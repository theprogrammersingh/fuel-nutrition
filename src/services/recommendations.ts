import { DailyGoals, MealEntry, NudgeState } from '../types';

export function calculateMacroNudge(meals: MealEntry[], goals: DailyGoals): NudgeState {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date === todayStr);

  const totalCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);

  const remCalories = Math.max(0, goals.calories - totalCalories);
  const remProtein = Math.max(0, goals.protein - totalProtein);

  const caloriePct = totalCalories / Math.max(1, goals.calories);
  const proteinPct = totalProtein / Math.max(1, goals.protein);

  // Recommendations filtered by dietary preference
  const isVeg = goals.dietaryFocus === 'high_protein_veg' || goals.dietaryFocus === 'vegan';
  const isVegan = goals.dietaryFocus === 'vegan';

  // Scenario C: Protein goal reached
  if (totalProtein >= goals.protein) {
    return {
      scenario: 'C',
      title: 'Protein Target Reached',
      message: `Optimal protein hit (${totalProtein}g / ${goals.protein}g). Maintain energy balance with light, fibrous greens if needed.`,
      remainingCalories: remCalories,
      remainingProtein: 0,
      recommendations: [
        { name: 'Mixed Baby Greens & Olive Oil', calories: 85, protein: 3 },
        { name: 'Crisp Cucumbers with Hummus', calories: 110, protein: 4 },
        { name: 'Fresh Blueberries (150g)', calories: 84, protein: 1 },
      ]
    };
  }

  // Scenario A: Tight calorie window (< 35% calorie budget remaining) OR calorie progress outpaces protein by > 20%
  const isLagging = (caloriePct - proteinPct) > 0.15 || (remCalories <= 500 && remProtein >= 30);

  if (isLagging) {
    let leanItems = [
      { name: 'Whey Isolate Shake', calories: 120, protein: 26 },
      { name: 'Liquid Egg Whites (200g)', calories: 95, protein: 20 },
      { name: 'Nonfat Greek Yogurt (170g)', calories: 100, protein: 18 },
      { name: 'Low-Fat Cottage Cheese (150g)', calories: 115, protein: 21 },
    ];

    if (isVegan) {
      leanItems = [
        { name: 'Pea Protein Isolate', calories: 120, protein: 25 },
        { name: 'Steamed Edamame (150g)', calories: 180, protein: 17 },
        { name: 'Air-Fried Extra Firm Tofu', calories: 140, protein: 18 },
        { name: 'Nutritional Yeast Broth', calories: 60, protein: 10 },
      ];
    } else if (isVeg) {
      leanItems = [
        { name: 'Whey Isolate Shake', calories: 120, protein: 26 },
        { name: 'Low-Fat Paneer / Chenna (150g)', calories: 145, protein: 22 },
        { name: 'Nonfat Greek Yogurt (170g)', calories: 100, protein: 18 },
        { name: 'Egg Whites (Scrambled)', calories: 95, protein: 20 },
      ];
    }

    return {
      scenario: 'A',
      title: 'Calorie window tight; protein deficit',
      message: `Approaching daily energy limit while requiring ${remProtein}g protein. Avoid dense fats and sugar for remaining intake.`,
      remainingCalories: remCalories,
      remainingProtein: remProtein,
      recommendations: leanItems,
    };
  }

  // Scenario B: Calorie budget open, protein needs density
  let denseItems = [
    { name: 'Grilled Salmon Bowl', calories: 420, protein: 38 },
    { name: 'Whole Eggs & Sourdough Toast', calories: 350, protein: 22 },
    { name: 'Chicken Thigh with Quinoa', calories: 480, protein: 42 },
    { name: 'Tofu Lentil Curry', calories: 380, protein: 24 },
  ];

  if (isVegan) {
    denseItems = [
      { name: 'Tempeh Stir-Fry with Quinoa', calories: 410, protein: 31 },
      { name: 'Lentil & Chickpea Dahl', calories: 360, protein: 22 },
      { name: 'Hemp Seed Power Bowl', calories: 340, protein: 20 },
    ];
  } else if (isVeg) {
    denseItems = [
      { name: 'Paneer Tikka with Roti', calories: 420, protein: 26 },
      { name: 'Greek Salad with Boiled Eggs', calories: 320, protein: 21 },
      { name: 'Spiced Moong Daal with Rice', calories: 390, protein: 20 },
    ];
  }

  return {
    scenario: 'B',
    title: 'Calorie budget open; prioritize dense protein',
    message: `${remCalories} kcal budget available. Ample room to hit target ${goals.protein}g with balanced protein-rich meals.`,
    remainingCalories: remCalories,
    remainingProtein: remProtein,
    recommendations: denseItems,
  };
}
