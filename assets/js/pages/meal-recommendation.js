document.addEventListener('DOMContentLoaded', () => {
  const user = APP.renderShell('meal-recommendation.html');
  if (!user) return;
  APP.setTitle('AI Meal Recommendation');

  const body = document.getElementById('pageBody');
  let filters = { mealType: 'Any', cuisine: 'Any', maxCookTime: 999, dietary: [...(user.dietary || [])], allergies: [...(user.allergies || [])] };

  const cuisines = ['Any', ...new Set(RECIPES.map(r => r.cuisine))];
  const mealTypes = ['Any', 'Breakfast', 'Lunch', 'Dinner'];

  body.innerHTML = `<div class="skel" style="height:64px;border-radius:14px;margin-bottom:20px;"></div>
    <div class="recipe-grid">${'<div class="skel" style="height:280px;border-radius:22px;"></div>'.repeat(6)}</div>`;

  setTimeout(render, 350);

  function render() {
    const items = APP.Ingredients.all();
    const results = Recommender.recommend(items, filters);

    body.innerHTML = `
      <div style="margin-bottom:18px;">
        <h2 style="margin:0;font-size:22px;">✨ AI Meal Recommendation</h2>
        <p style="margin:2px 0 0;">Ranked by pantry match and how soon ingredients expire — every result explains its own reasoning.</p>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <div class="rec-filters">
          <div class="field" style="margin:0;"><label>Meal type</label><select class="input" id="f-mealtype">${mealTypes.map(m => `<option ${filters.mealType === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
          <div class="field" style="margin:0;"><label>Cuisine</label><select class="input" id="f-cuisine">${cuisines.map(c => `<option ${filters.cuisine === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="field" style="margin:0;"><label>Max cook time</label><select class="input" id="f-time">
            <option value="999" ${filters.maxCookTime === 999 ? 'selected' : ''}>Any</option>
            <option value="15" ${filters.maxCookTime === 15 ? 'selected' : ''}>Under 15 min</option>
            <option value="25" ${filters.maxCookTime === 25 ? 'selected' : ''}>Under 25 min</option>
            <option value="35" ${filters.maxCookTime === 35 ? 'selected' : ''}>Under 35 min</option>
          </select></div>
          <div class="field" style="margin:0;grid-column:span 2;"><label>Dietary preference</label>
            <div class="tag-select" id="dietTags">${APP.DIETARY.map(d => `<span class="tag-opt ${filters.dietary.includes(d) ? 'sel' : ''}" data-d="${d}">${d}</span>`).join('')}</div>
          </div>
        </div>
        <div class="field" style="margin:0;"><label>Allergies to avoid</label>
          <div class="tag-select" id="allergyTags">${APP.ALLERGIES.map(a => `<span class="tag-opt ${filters.allergies.includes(a) ? 'sel' : ''}" data-a="${a}">${a}</span>`).join('')}</div>
        </div>
      </div>

      ${results.length ? `<div class="recipe-grid">${results.map(r => cardHtml(r)).join('')}</div>` : `
        <div class="card"><div class="empty-state">
          <div class="ic">🍽️</div><h3>No matches for these filters</h3>
          <p>Try loosening a filter, or add more pantry items so the engine has more to work with.</p>
          <a href="pantry.html" class="btn btn-primary btn-sm">Go to Pantry</a>
        </div></div>`}
    `;

    document.getElementById('f-mealtype').onchange = e => { filters.mealType = e.target.value; render(); };
    document.getElementById('f-cuisine').onchange = e => { filters.cuisine = e.target.value; render(); };
    document.getElementById('f-time').onchange = e => { filters.maxCookTime = parseInt(e.target.value, 10); render(); };
    document.querySelectorAll('#dietTags .tag-opt').forEach(el => el.onclick = () => {
      const d = el.dataset.d;
      filters.dietary = filters.dietary.includes(d) ? filters.dietary.filter(x => x !== d) : [...filters.dietary, d];
      render();
    });
    document.querySelectorAll('#allergyTags .tag-opt').forEach(el => el.onclick = () => {
      const a = el.dataset.a;
      filters.allergies = filters.allergies.includes(a) ? filters.allergies.filter(x => x !== a) : [...filters.allergies, a];
      render();
    });
    body.querySelectorAll('[data-shop]').forEach(btn => btn.onclick = (e) => {
      e.preventDefault();
      const r = results.find(x => x.recipe.id === btn.dataset.shop);
      const added = APP.Shopping.addMissing(r.missing);
      APP.toast(added ? `${added} item(s) added to your shopping list` : 'Those items are already on your list', 'success');
    });
  }

  function cardHtml(r) {
    const bg = ['var(--basil-100)', 'var(--gold-100)', 'var(--herb-100)'][Math.abs(hashStr(r.recipe.id)) % 3];
    return `
    <div class="recipe-card">
      <div class="recipe-cover" style="background:${bg}">${r.recipe.emoji}<span class="recipe-score">${Math.round(r.score * 100)}%</span></div>
      <div class="recipe-body">
        <h3>${r.recipe.name}</h3>
        <div class="recipe-meta"><span>${r.recipe.cuisine}</span><span>·</span><span>${r.recipe.mealType}</span><span>·</span><span>⏱ ${r.recipe.cookTime}m</span></div>
        <div class="recipe-chiprow">
          ${r.have.slice(0, 3).map(h => `<span class="chip have">${APP.esc(h)}</span>`).join('')}
          ${r.missing.slice(0, 2).map(m => `<span class="chip missing">${APP.esc(m)}</span>`).join('')}
        </div>
        <div class="recipe-why">${r.explanation}</div>
        <div class="flex gap-2" style="margin-top:auto;">
          <a href="recipe-details.html?id=${r.recipe.id}" class="btn btn-primary btn-sm" style="flex:1;">View recipe</a>
          ${r.missing.length ? `<button class="btn btn-secondary btn-sm" data-shop="${r.recipe.id}">+ Shop gap</button>` : ''}
        </div>
      </div>
    </div>`;
  }

  function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i); return h; }
});
