document.addEventListener('DOMContentLoaded', () => {
  const user = APP.renderShell('meal-recommendation.html');
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const recipe = Recommender.byId(params.get('id'));
  const body = document.getElementById('pageBody');

  if (!recipe) {
    APP.setTitle('Recipe not found');
    body.innerHTML = `<div class="card"><div class="empty-state"><div class="ic">🔎</div><h3>Recipe not found</h3><p>This recipe may have been removed. Head back to see fresh recommendations.</p><a href="meal-recommendation.html" class="btn btn-primary btn-sm">Back to recommendations</a></div></div>`;
    return;
  }

  APP.setTitle(recipe.name);
  const items = APP.Ingredients.all();
  const pantryByName = new Map(items.map(i => [i.name.toLowerCase(), i]));
  const allScored = Recommender.recommend(items, {});
  const matchForThis = allScored.find(r => r.recipe.id === recipe.id);
  const { have, missing, expiringUsed, explanation, score } = matchForThis || {
    have: [], missing: recipe.ingredients, expiringUsed: [], score: 0,
    explanation: items.length ? 'None of this recipe\u2019s ingredients are currently in your pantry, or it was filtered out by your dietary/allergy preferences.' : 'Your pantry is empty — add ingredients on the Pantry page to see a personalised match.'
  };

  const bg = ['linear-gradient(135deg,var(--basil-100),var(--herb-100))', 'linear-gradient(135deg,var(--gold-100),var(--basil-100))'][recipe.id.length % 2];

  body.innerHTML = `
    <a href="meal-recommendation.html" class="btn btn-ghost btn-sm" style="margin-bottom:14px;">← Back to recommendations</a>
    <div class="rd-hero" style="background:${bg}">
      <div class="emoji">${recipe.emoji}</div>
      <div>
        <div class="flex gap-2" style="margin-bottom:8px;flex-wrap:wrap;">
          <span class="badge badge-neutral">${recipe.cuisine}</span>
          <span class="badge badge-neutral">${recipe.mealType}</span>
          <span class="badge badge-neutral">⏱ ${recipe.cookTime} min</span>
          <span class="badge badge-ok">${Math.round(score * 100)}% pantry match</span>
        </div>
        <h1 style="margin-bottom:4px;">${recipe.name}</h1>
        <p style="margin:0;">${recipe.diet.length ? recipe.diet.join(' · ') : 'Standard recipe'}</p>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;">
      <div class="panel-title"><h2>✨ Why this was recommended</h2></div>
      <div class="rc-why">${explanation}</div>
    </div>

    <div class="rd-layout">
      <div style="display:flex;flex-direction:column;gap:20px;">
        <div class="card">
          <div class="panel-title"><h2>Ingredients</h2></div>
          ${recipe.ingredients.map(ing => {
            const p = pantryByName.get(ing.toLowerCase());
            const isExpiring = expiringUsed.some(e => e.name === ing);
            return `<div class="ing-row"><span>${APP.esc(ing)}</span>${p ? `<span class="badge ${isExpiring ? 'badge-warn' : 'badge-ok'}">${isExpiring ? 'In pantry · expiring' : 'In pantry'}</span>` : `<span class="badge badge-neutral">Need to buy</span>`}</div>`;
          }).join('')}
          ${missing.length ? `<button class="btn btn-secondary btn-block" style="margin-top:14px;" id="shopGapBtn">+ Add ${missing.length} missing item${missing.length > 1 ? 's' : ''} to shopping list</button>` : ''}
        </div>

        <div class="card">
          <div class="panel-title"><h2>Nutrition (per serving)</h2></div>
          <div class="nutri-grid">
            <div><b>${recipe.nutrition.calories}</b><span>Calories</span></div>
            <div><b>${recipe.nutrition.protein}g</b><span>Protein</span></div>
            <div><b>${recipe.nutrition.carbs}g</b><span>Carbs</span></div>
            <div><b>${recipe.nutrition.fat}g</b><span>Fat</span></div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="panel-title"><h2>Steps</h2></div>
        ${recipe.steps.map((s, idx) => `<div class="step-item"><div class="step-num">${idx + 1}</div><p style="margin:0;color:var(--text)">${APP.esc(s)}</p></div>`).join('')}
        <button class="btn btn-primary btn-block" style="margin-top:16px;" id="cookedBtn">✓ Mark as cooked</button>
      </div>
    </div>
  `;

  document.getElementById('shopGapBtn')?.addEventListener('click', () => {
    const added = APP.Shopping.addMissing(missing);
    APP.toast(added ? `${added} item(s) added to your shopping list` : 'Those items are already on your list', 'success');
  });
  document.getElementById('cookedBtn').addEventListener('click', () => {
    const db = APP.load();
    db.mealLog.unshift({ id: APP.uid('m'), userId: user.id, recipeId: recipe.id, date: new Date().toISOString().slice(0, 10) });
    APP.save(db);
    APP.Notifications.push({ type: 'meal', title: `Cooked: ${recipe.name}`, message: 'Logged to your meal history. Nice work reducing waste!' });
    APP.toast('Marked as cooked — logged to your history 🎉', 'success');
  });
});
