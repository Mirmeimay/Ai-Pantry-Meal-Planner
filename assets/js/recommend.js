/* ==========================================================================
   XAI PANTRY — explainable recommendation engine
   Rule-based (not a black box): every score is derived from transparent
   factors, and each factor is surfaced back to the user as plain-language
   reasoning. This is what makes the recommendations "explainable AI".
   ========================================================================== */

const RECIPES = [
  { id: 'r1', name: 'Chicken Fried Rice', emoji: '🍳', cuisine: 'Asian', mealType: 'Dinner', cookTime: 25, diet: [], allergens: ['Eggs', 'Soy'],
    ingredients: ['Rice', 'Chicken Breast', 'Eggs', 'Carrots', 'Soy Sauce', 'Garlic', 'Onions'],
    nutrition: { calories: 480, protein: 32, carbs: 52, fat: 14 },
    steps: ['Cook rice and let it cool (day-old rice works best).', 'Dice chicken breast and stir-fry until golden.', 'Push chicken aside, scramble eggs in the same pan.', 'Add carrots, onions and garlic; stir-fry 3 minutes.', 'Add rice and soy sauce, toss everything together over high heat for 4-5 minutes.', 'Season to taste and serve hot.'] },
  { id: 'r2', name: 'Garlic Butter Pasta', emoji: '🍝', cuisine: 'Italian', mealType: 'Dinner', cookTime: 20, diet: ['Vegetarian'], allergens: ['Gluten', 'Dairy'],
    ingredients: ['Pasta', 'Garlic', 'Tomatoes', 'Bell Pepper', 'Onions'],
    nutrition: { calories: 420, protein: 12, carbs: 68, fat: 11 },
    steps: ['Boil pasta until al dente, reserve 1 cup pasta water.', 'Saute garlic and onions until fragrant.', 'Add tomatoes and bell pepper, cook down into a light sauce.', 'Toss pasta into the sauce with a splash of pasta water.', 'Finish with cracked pepper and serve.'] },
  { id: 'r3', name: 'Spinach & Egg Scramble', emoji: '🍳', cuisine: 'Western', mealType: 'Breakfast', cookTime: 10, diet: ['Vegetarian', 'Gluten-Free'], allergens: ['Eggs', 'Dairy'],
    ingredients: ['Spinach', 'Eggs', 'Milk', 'Onions'],
    nutrition: { calories: 290, protein: 20, carbs: 6, fat: 20 },
    steps: ['Wilt spinach in a pan for 1-2 minutes.', 'Whisk eggs with a splash of milk.', 'Pour eggs over spinach and onions, scramble gently over low heat.', 'Season with salt and pepper, serve warm.'] },
  { id: 'r4', name: 'Yogurt Berry Bowl', emoji: '🥣', cuisine: 'Western', mealType: 'Breakfast', cookTime: 5, diet: ['Vegetarian', 'Gluten-Free'], allergens: ['Dairy'],
    ingredients: ['Greek Yogurt', 'Bread'],
    nutrition: { calories: 260, protein: 18, carbs: 30, fat: 6 },
    steps: ['Spoon yogurt into a bowl.', 'Toast bread and cut into cubes for crunch.', 'Top yogurt with toasted bread cubes and a drizzle of honey if available.'] },
  { id: 'r5', name: 'Tomato Garlic Chicken', emoji: '🍗', cuisine: 'Mediterranean', mealType: 'Dinner', cookTime: 35, diet: ['Gluten-Free', 'Dairy-Free', 'Halal'], allergens: [],
    ingredients: ['Chicken Breast', 'Tomatoes', 'Garlic', 'Onions', 'Bell Pepper'],
    nutrition: { calories: 410, protein: 38, carbs: 14, fat: 20 },
    steps: ['Sear chicken breast until browned on both sides.', 'Remove chicken, saute garlic and onions in the same pan.', 'Add tomatoes and bell pepper, simmer into a sauce.', 'Return chicken to the pan, cover and cook through, about 15 minutes.'] },
  { id: 'r6', name: 'Veggie Carrot Soup', emoji: '🥕', cuisine: 'Western', mealType: 'Lunch', cookTime: 30, diet: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'], allergens: [],
    ingredients: ['Carrots', 'Onions', 'Garlic'],
    nutrition: { calories: 180, protein: 4, carbs: 26, fat: 6 },
    steps: ['Saute onions and garlic until soft.', 'Add chopped carrots and cover with water or stock.', 'Simmer 20 minutes until carrots are tender.', 'Blend until smooth and season to taste.'] },
  { id: 'r7', name: 'Caprese-Style Sandwich', emoji: '🥪', cuisine: 'Italian', mealType: 'Lunch', cookTime: 10, diet: ['Vegetarian'], allergens: ['Gluten', 'Dairy'],
    ingredients: ['Bread', 'Tomatoes', 'Greek Yogurt', 'Garlic'],
    nutrition: { calories: 340, protein: 14, carbs: 40, fat: 12 },
    steps: ['Mix Greek yogurt with crushed garlic as a spread.', 'Toast bread slices lightly.', 'Layer tomatoes on the spread.', 'Season with salt, pepper and a drizzle of oil.'] },
  { id: 'r8', name: 'Shrimp & Pepper Stir Fry', emoji: '🍤', cuisine: 'Asian', mealType: 'Dinner', cookTime: 18, diet: ['Pescatarian', 'Dairy-Free'], allergens: ['Shellfish', 'Soy'],
    ingredients: ['Bell Pepper', 'Garlic', 'Onions', 'Soy Sauce', 'Rice'],
    nutrition: { calories: 380, protein: 24, carbs: 46, fat: 9 },
    steps: ['Cook rice separately.', 'Stir-fry garlic and onions until fragrant.', 'Add bell pepper and shrimp (or a plant protein swap), cook until done.', 'Add soy sauce, toss and serve over rice.'] },
  { id: 'r9', name: 'Classic Egg Fried Rice', emoji: '🍚', cuisine: 'Asian', mealType: 'Lunch', cookTime: 15, diet: ['Vegetarian'], allergens: ['Eggs', 'Soy'],
    ingredients: ['Rice', 'Eggs', 'Carrots', 'Soy Sauce', 'Onions'],
    nutrition: { calories: 360, protein: 14, carbs: 58, fat: 8 },
    steps: ['Scramble eggs and set aside.', 'Stir-fry onions and carrots for 3 minutes.', 'Add rice, breaking up clumps.', 'Fold eggs back in, add soy sauce and toss well.'] },
  { id: 'r10', name: 'Mediterranean Pasta Salad', emoji: '🥗', cuisine: 'Mediterranean', mealType: 'Lunch', cookTime: 20, diet: ['Vegetarian'], allergens: ['Gluten'],
    ingredients: ['Pasta', 'Tomatoes', 'Bell Pepper', 'Onions', 'Garlic'],
    nutrition: { calories: 400, protein: 11, carbs: 62, fat: 12 },
    steps: ['Cook pasta and cool under running water.', 'Chop tomatoes, bell pepper and onions.', 'Toss everything with garlic and a light dressing.', 'Chill for 10 minutes before serving.'] },
  { id: 'r11', name: 'Herbed Chicken & Rice Bowl', emoji: '🍛', cuisine: 'Mediterranean', mealType: 'Dinner', cookTime: 30, diet: ['Gluten-Free', 'Dairy-Free', 'Halal'], allergens: [],
    ingredients: ['Chicken Breast', 'Rice', 'Garlic', 'Onions', 'Bell Pepper'],
    nutrition: { calories: 460, protein: 36, carbs: 50, fat: 13 },
    steps: ['Season and pan-sear chicken, then slice.', 'Saute garlic, onions and bell pepper.', 'Serve sliced chicken over rice topped with the vegetable saute.'] },
  { id: 'r12', name: 'Simple Milk Toast', emoji: '🍞', cuisine: 'Western', mealType: 'Breakfast', cookTime: 8, diet: ['Vegetarian'], allergens: ['Gluten', 'Dairy'],
    ingredients: ['Bread', 'Milk', 'Eggs'],
    nutrition: { calories: 310, protein: 13, carbs: 34, fat: 12 },
    steps: ['Whisk milk and eggs together.', 'Dip bread slices and let soak briefly.', 'Pan-fry until golden on both sides.', 'Serve warm.'] },
  { id: 'r13', name: 'Roasted Tomato & Garlic Soup', emoji: '🍅', cuisine: 'Mediterranean', mealType: 'Lunch', cookTime: 35, diet: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'], allergens: [],
    ingredients: ['Tomatoes', 'Garlic', 'Onions'],
    nutrition: { calories: 160, protein: 4, carbs: 22, fat: 6 },
    steps: ['Roast tomatoes and garlic until soft and caramelised.', 'Saute onions, then blend everything together with a little water or stock.', 'Simmer 10 minutes and season to taste.'] },
  { id: 'r14', name: 'Spinach Garlic Pasta', emoji: '🍝', cuisine: 'Italian', mealType: 'Dinner', cookTime: 20, diet: ['Vegetarian'], allergens: ['Gluten'],
    ingredients: ['Pasta', 'Spinach', 'Garlic', 'Onions'],
    nutrition: { calories: 390, protein: 13, carbs: 60, fat: 10 },
    steps: ['Cook pasta until al dente.', 'Saute garlic and onions, then wilt in spinach.', 'Toss pasta through the spinach mixture with a splash of pasta water.'] },
];

const Recommender = (() => {
  function norm(s) { return s.trim().toLowerCase(); }

  /**
   * Scores every recipe against the user's pantry + preferences and returns
   * a ranked list, each with a transparent breakdown of *why* it was scored
   * that way (used for the "explainable" chip trail + narrative text).
   */
  function recommend(pantryItems, opts = {}) {
    const { dietary = [], allergies = [], mealType = 'Any', cuisine = 'Any', maxCookTime = 999 } = opts;
    const pantryByName = new Map(pantryItems.map(p => [norm(p.name), p]));

    const results = RECIPES.map(recipe => {
      const have = [];
      const missing = [];
      const expiringUsed = [];
      recipe.ingredients.forEach(reqName => {
        const p = pantryByName.get(norm(reqName));
        if (p) {
          have.push(reqName);
          const status = APP.Ingredients.status(p.expiryDate);
          if (status === 'today' || status === 'soon' || status === 'expired') expiringUsed.push({ name: reqName, status, days: APP.Ingredients.daysUntil(p.expiryDate) });
        } else {
          missing.push(reqName);
        }
      });

      const matchRatio = have.length / recipe.ingredients.length;
      const expiryBonus = expiringUsed.length * 0.12;
      const missingPenalty = missing.length * 0.09;
      let score = matchRatio * 0.7 + expiryBonus - missingPenalty;

      // Hard filters (allergy / dietary / meal type / cuisine / time) — excluded, not just down-ranked.
      let excluded = false, excludeReason = '';
      if (allergies.length && recipe.allergens.some(a => allergies.includes(a))) { excluded = true; excludeReason = `contains ${recipe.allergens.filter(a => allergies.includes(a)).join(', ')}, which conflicts with your allergy preferences`; }
      if (!excluded && dietary.length && !dietary.every(d => recipe.diet.includes(d))) { excluded = true; excludeReason = `doesn't meet your ${dietary.filter(d => !recipe.diet.includes(d)).join(', ')} preference`; }
      if (!excluded && mealType !== 'Any' && recipe.mealType !== mealType) { excluded = true; excludeReason = `is a ${recipe.mealType.toLowerCase()} recipe, not ${mealType.toLowerCase()}`; }
      if (!excluded && cuisine !== 'Any' && recipe.cuisine !== cuisine) { excluded = true; excludeReason = `is ${recipe.cuisine} cuisine, not ${cuisine}`; }
      if (!excluded && recipe.cookTime > maxCookTime) { excluded = true; excludeReason = `takes ${recipe.cookTime} minutes, above your ${maxCookTime}-minute limit`; }

      score = Math.max(0, Math.min(1, score));

      const explanation = buildExplanation(recipe, have, missing, expiringUsed, matchRatio);

      return { recipe, have, missing, expiringUsed, matchRatio, score, excluded, excludeReason, explanation };
    });

    return results
      .filter(r => !r.excluded)
      .sort((a, b) => b.score - a.score || b.expiringUsed.length - a.expiringUsed.length);
  }

  function buildExplanation(recipe, have, missing, expiringUsed, matchRatio) {
    const parts = [];
    if (have.length) {
      parts.push(`We recommended <b>${recipe.name}</b> because your pantry already has ${listify(have)}${have.length >= 3 ? ' — that\u2019s ' + Math.round(matchRatio * 100) + '% of what this recipe needs' : ''}.`);
    } else {
      parts.push(`<b>${recipe.name}</b> is a possible match, though none of its ingredients are currently in your pantry.`);
    }
    if (expiringUsed.length) {
      const urgent = expiringUsed.map(e => `${e.name} (${e.status === 'expired' ? 'already expired' : e.status === 'today' ? 'expires today' : `expires in ${e.days} day(s)`})`).join(', ');
      parts.push(`It also uses ${urgent}, which helps reduce food waste by using items before they spoil.`);
    }
    if (missing.length) {
      parts.push(missing.length === 1
        ? `Only <b>1 additional ingredient</b> is needed: ${missing[0]}.`
        : `You'd need <b>${missing.length} additional ingredients</b>: ${listify(missing)}.`);
    } else {
      parts.push(`You have everything needed — no shopping required.`);
    }
    return parts.join(' ');
  }

  function listify(arr) {
    if (arr.length <= 1) return arr.join('');
    if (arr.length === 2) return arr.join(' and ');
    return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
  }

  function byId(id) { return RECIPES.find(r => r.id === id); }

  return { recommend, byId, RECIPES };
})();
