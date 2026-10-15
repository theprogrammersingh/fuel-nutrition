import { GeminiInferenceResult } from '../types';
import { getSettings } from './storage';

const SYSTEM_INSTRUCTION = `You are a precise, objective nutritional analysis assistant. 
Analyze the provided food image and return a structured JSON response estimating:
1. dish_name: Short title of the meal.
2. portion_estimate: Concise description (e.g., "1 bowl (~300g)" or "1 plate").
3. calories: Estimated total energy in kcal (integer).
4. protein: Estimated total protein in grams (integer).
5. carbs: Estimated carbohydrates in grams (integer).
6. fat: Estimated fat in grams (integer).
7. confidence_score: Confidence level between 0.0 and 1.0 (float).
Keep estimates realistic and grounded based on typical restaurant and home culinary standards.
Return ONLY valid JSON matching this schema without markdown fences.`;

export async function testGeminiApiKey(apiKey: string, modelName: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim() === '') {
    return { success: false, message: 'Please enter a valid API key.' };
  }

  const cleanModel = modelName.trim() || 'gemini-3.8-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with the single word "OK" to verify this connection.' }]
          }
        ]
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      return { success: false, message: msg };
    }

    return { success: true, message: `Connected successfully to ${cleanModel}!` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Gemini API.' };
  }
}

function parseGeminiJsonResponse(rawText: string): GeminiInferenceResult {
  const sanitized = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(sanitized);
  } catch {
    const match = sanitized.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Unable to parse nutritional payload from Gemini response.');
    }
  }

  return {
    dish_name: parsed.dish_name || 'Logged Meal',
    portion_estimate: parsed.portion_estimate || 'Standard Serving',
    calories: Math.round(Number(parsed.calories) || 0),
    protein: Math.round(Number(parsed.protein) || 0),
    carbs: Math.round(Number(parsed.carbs) || 0),
    fat: Math.round(Number(parsed.fat) || 0),
    confidence_score: Math.min(1, Math.max(0.1, Number(parsed.confidence_score) || 0.9)),
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : []
  };
}

const MANUAL_SYSTEM_INSTRUCTION = `You are a precise, objective nutritional analysis assistant. 
Analyze the provided food description and optional food image, and return a structured JSON response estimating:
1. dish_name: Short title of the meal.
2. portion_estimate: Concise description (e.g., "1 bowl (~300g)", "2 slices", or "Standard serving").
3. calories: Estimated total energy in kcal (integer).
4. protein: Estimated total protein in grams (integer).
5. carbs: Estimated carbohydrates in grams (integer).
6. fat: Estimated fat in grams (integer).
7. confidence_score: Confidence level between 0.0 and 1.0 (float).
8. ingredients: Array of strings listing the primary ingredients identified.
Keep estimates realistic and grounded based on typical restaurant, USDA, and home culinary standards.
Return ONLY valid JSON matching this schema without markdown fences.`;

export async function analyzeMealImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<GeminiInferenceResult> {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey?.trim();
  const model = settings.selectedModel?.trim() || 'gemini-3.8-flash';

  if (!apiKey) {
    throw new Error('Gemini API Key is required. Please set your API key in the Settings tab.');
  }

  // Clean base64 string if it contains data prefix
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: SYSTEM_INSTRUCTION },
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errorMsg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Gemini analysis error: ${errorMsg}`);
  }

  const data = await response.json();
  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidateText) {
    throw new Error('No content returned from Gemini Vision model.');
  }

  return parseGeminiJsonResponse(candidateText);
}

export async function analyzeMealManual(
  description: string,
  imageBase64?: string | null,
  mimeType: string = 'image/jpeg'
): Promise<GeminiInferenceResult> {
  const settings = getSettings();
  const apiKey = settings.geminiApiKey?.trim();
  const model = settings.selectedModel?.trim() || 'gemini-3.8-flash';

  if (!apiKey) {
    throw new Error('Gemini API Key is required. Please set your API key in the Settings tab.');
  }

  const cleanDescription = description.trim();
  if (!cleanDescription) {
    throw new Error('Please enter a description for your meal.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const promptText = `${MANUAL_SYSTEM_INSTRUCTION}

User Dish Description:
"${cleanDescription}"

${
  imageBase64
    ? 'A photo of the food is provided. Combine visual cues from the photo with the user’s description to accurately determine the dish, portion size, and macronutrients.'
    : 'No photo is provided. Estimate realistic calories, protein, carbs, fat, and portion size based on the user description.'
}`;

  const parts: any[] = [{ text: promptText }];

  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64
      }
    });
  }

  const payload = {
    contents: [
      {
        parts
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errorMsg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Gemini analysis error: ${errorMsg}`);
  }

  const data = await response.json();
  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidateText) {
    throw new Error('No content returned from Gemini model.');
  }

  const parsed = parseGeminiJsonResponse(candidateText);
  if (!parsed.dish_name || parsed.dish_name === 'Logged Meal') {
    parsed.dish_name = cleanDescription.slice(0, 36);
  }
  return parsed;
}
