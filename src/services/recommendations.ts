import { DailyGoals, MealEntry, NudgeState, TargetGoal } from '../types';

export function calculateMacroNudge(meals: MealEntry[], goals: DailyGoals): NudgeState {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date === todayStr);

  const totalCalories = todayMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + m.protein, 0);

  const remCalories = Math.max(0, goals.calories - totalCalories);
  const remProtein = Math.max(0, goals.protein - totalProtein);

  const caloriePct = totalCalories / Math.max(1, goals.calories);
  const proteinPct = totalProtein / Math.max(1, goals.protein);

  const isVeg = goals.dietaryFocus === 'high_protein_veg' || goals.dietaryFocus === 'vegan';
  const isVegan = goals.dietaryFocus === 'vegan';
  const targetGoal: TargetGoal = goals.targetGoal || 'maintain';

  // SCENARIO C: Protein goal reached
  if (totalProtein >= goals.protein) {
    if (targetGoal === 'bulking') {
      return {
        scenario: 'C',
        title: 'Protein Hit · Bulking Surplus',
        message: `Muscle synthesis target reached (${totalProtein}g / ${goals.protein}g). Fill remaining ${remCalories} kcal with quality carbs and healthy fats for growth.`,
        remainingCalories: remCalories,
        remainingProtein: 0,
        recommendations: isVegan
          ? [
              { name: 'Oatmeal with Almond Butter & Banana', calories: 340, protein: 9 },
              { name: 'Avocado Toast on Sourdough', calories: 290, protein: 6 },
              { name: 'Dark Chocolate & Mixed Walnuts (40g)', calories: 240, protein: 5 },
            ]
          : [
              { name: 'Honey & Banana Whole Milk Greek Yogurt', calories: 260, protein: 12 },
              { name: 'Avocado Toast with Olive Oil', calories: 280, protein: 6 },
              { name: 'Peanut Butter Rice Cakes', calories: 220, protein: 8 },
            ],
      };
    }

    if (targetGoal === 'lose_weight') {
      return {
        scenario: 'C',
        title: 'Protein Target Reached in Deficit',
        message: `Optimal lean mass protection achieved (${totalProtein}g / ${goals.protein}g). Keep deficit intact with light, fibrous greens or hydration.`,
        remainingCalories: remCalories,
        remainingProtein: 0,
        recommendations: [
          { name: 'Crisp Cucumbers with Lemon & Hummus', calories: 90, protein: 3 },
          { name: 'Baby Spinach & Cherry Tomato Salad', calories: 75, protein: 2 },
          { name: 'Fresh Strawberries (150g)', calories: 50, protein: 1 },
        ],
      };
    }

    // Default maintain
    return {
      scenario: 'C',
      title: 'Protein Target Reached',
      message: `Optimal protein hit (${totalProtein}g / ${goals.protein}g). Maintain energy balance with balanced whole foods.`,
      remainingCalories: remCalories,
      remainingProtein: 0,
      recommendations: [
        { name: 'Mixed Baby Greens & Olive Oil', calories: 85, protein: 3 },
        { name: 'Crisp Cucumbers with Hummus', calories: 110, protein: 4 },
        { name: 'Fresh Blueberries (150g)', calories: 84, protein: 1 },
      ],
    };
  }

  // SCENARIO A: Tight calorie window (< 35% calorie budget remaining) OR calorie progress outpaces protein by > 15%
  const isLagging = (caloriePct - proteinPct) > 0.15 || (remCalories <= 500 && remProtein >= 25);

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

    const title = targetGoal === 'lose_weight'
      ? 'Deficit Tight · Maximize Protein Purity'
      : targetGoal === 'bulking'
      ? 'Protein Deficit · Prioritize Pure Protein'
      : 'Calorie Window Tight · Protein Deficit';

    const message = targetGoal === 'lose_weight'
      ? `Calorie budget is closing with ${remProtein}g protein remaining. Stick to ultra-lean sources to protect muscle without breaking deficit.`
      : `Approaching daily energy limit while requiring ${remProtein}g protein. Prioritize high-purity protein sources.`;

    return {
      scenario: 'A',
      title,
      message,
      remainingCalories: remCalories,
      remainingProtein: remProtein,
      recommendations: leanItems,
    };
  }

  // SCENARIO B: Calorie budget open, protein needs density
  if (targetGoal === 'bulking') {
    let bulkingItems = [
      { name: 'Peanut Butter Banana Whey Shake', calories: 480, protein: 38 },
      { name: 'Salmon with Sweet Potato & Quinoa', calories: 520, protein: 44 },
      { name: 'Whole Eggs & Avocado on Sourdough', calories: 430, protein: 24 },
      { name: 'Chicken Thigh Bowl with Rice & Beans', calories: 550, protein: 46 },
    ];

    if (isVegan) {
      bulkingItems = [
        { name: 'Hemp Seed & Peanut Butter Oats', calories: 460, protein: 28 },
        { name: 'Tempeh & Avocado Quinoa Bowl', calories: 480, protein: 34 },
        { name: 'Spiced Lentil Dahl with Rice & Nuts', calories: 440, protein: 24 },
      ];
    } else if (isVeg) {
      bulkingItems = [
        { name: 'Paneer Tikka with Paratha & Curd', calories: 520, protein: 30 },
        { name: 'Greek Yogurt with Granola & Almonds', calories: 420, protein: 26 },
        { name: 'Whole Eggs, Cheese & Toast', calories: 440, protein: 25 },
      ];
    }

    return {
      scenario: 'B',
      title: 'Bulking Calorie Room · Fuel Muscle Growth',
      message: `${remCalories} kcal budget available. Use high-density nutrient pairings to reach both your caloric surplus and ${goals.protein}g protein.`,
      remainingCalories: remCalories,
      remainingProtein: remProtein,
      recommendations: bulkingItems,
    };
  }

  // Standard or Lose Weight scenario B
  let denseItems = [
    { name: 'Grilled Salmon Bowl with Greens', calories: 380, protein: 36 },
    { name: 'Grilled Chicken Breast & Veggies', calories: 320, protein: 40 },
    { name: 'Whole Eggs & Sourdough Toast', calories: 330, protein: 21 },
    { name: 'Tofu Lentil Curry with Steamed Veggies', calories: 340, protein: 24 },
  ];

  if (isVegan) {
    denseItems = [
      { name: 'Tempeh Stir-Fry with Greens', calories: 360, protein: 30 },
      { name: 'Lentil & Chickpea Dahl', calories: 340, protein: 22 },
      { name: 'Hemp Seed Power Bowl', calories: 320, protein: 20 },
    ];
  } else if (isVeg) {
    denseItems = [
      { name: 'Paneer Tikka with Mixed Salad', calories: 360, protein: 25 },
      { name: 'Greek Salad with Boiled Eggs', calories: 310, protein: 21 },
      { name: 'Spiced Moong Daal with Greens', calories: 330, protein: 20 },
    ];
  }

  const title = targetGoal === 'lose_weight'
    ? 'Deficit on Track · Satiating Protein Sources'
    : 'Calorie Budget Open · Prioritize Balanced Protein';

  const message = targetGoal === 'lose_weight'
    ? `${remCalories} kcal remaining in today's deficit. Choose high-volume, lean protein to stay full while hitting your ${goals.protein}g target.`
    : `${remCalories} kcal budget available. Ample room to hit target ${goals.protein}g with balanced protein-rich meals.`;

  return {
    scenario: 'B',
    title,
    message,
    remainingCalories: remCalories,
    remainingProtein: remProtein,
    recommendations: denseItems,
  };
}
