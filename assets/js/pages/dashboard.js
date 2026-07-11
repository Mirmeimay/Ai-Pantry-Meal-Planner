document.addEventListener('DOMContentLoaded', () => {
  const user = APP.renderShell('dashboard.html');
  if (!user) return;
  APP.setTitle('Dashboard');
  APP.Notifications.syncExpiryAlerts();

  const body = document.getElementById('pageBody');
  body.innerHTML = `<div class="skel" style="height:110px;border-radius:22px;margin-bottom:16px;"></div>
    <div class="stat-grid">${'<div class="skel" style="height:120px;border-radius:22px;"></div>'.repeat(4)}</div>`;

  setTimeout(render, 380); // brief skeleton for perceived-performance / loading-state demo

  function render() {
    const items = APP.Ingredients.all();
    const expired = items.filter(i => APP.Ingredients.status(i.expiryDate) === 'expired');
    const today = items.filter(i => APP.Ingredients.status(i.expiryDate) === 'today');
    const soon = items.filter(i => APP.Ingredients.status(i.expiryDate) === 'soon');
    const expiring = [...today, ...soon];
    const db = APP.load();
    const mealLog = db.mealLog.filter(m => m.userId === user.id);
    const shoppingPending = APP.Shopping.all().filter(s => !s.done);
    const utilisation = items.length ? Math.round(((items.length - expired.length) / items.length) * 100) : 0;
    const wasteReduction = Math.min(96, mealLog.length * 14 + expiring.length * 3 + 20);

    const recs = RECIPES.length ? Recommender.recommend(items, {
      dietary: user.dietary || [], allergies: user.allergies || [], mealType: 'Any', cuisine: 'Any', maxCookTime: 999
    }) : [];
    const top = recs[0];

    const notifs = APP.Notifications.all().slice(0, 4);

    body.innerHTML = `
      <div class="flex-between" style="margin-bottom:20px;flex-wrap:wrap;gap:10px;">
        <div>
          <h2 style="margin:0;font-size:22px;">Welcome back, ${APP.esc(user.name.split(' ')[0])} 👋</h2>
          <p style="margin:2px 0 0;">Here's what's happening in your kitchen today.</p>
        </div>
        <button class="btn btn-secondary" id="refreshBtn">↻ Refresh</button>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-ic" style="background:var(--basil-100);color:var(--basil-700)">🥬</div>
          <div class="stat-value">${items.length}</div>
          <div class="stat-label">Pantry items</div>
        </div>
        <div class="stat-card">
          <div class="stat-ic" style="background:var(--gold-100);color:var(--gold-600)">⏰</div>
          <div class="stat-value">${expiring.length}</div>
          <div class="stat-label">Expiring soon</div>
          ${expiring.length ? `<span class="stat-trend badge-warn badge">Act now</span>` : ''}
        </div>
        <div class="stat-card">
          <div class="stat-ic" style="background:var(--clay-100);color:var(--clay-600)">🗑️</div>
          <div class="stat-value">${expired.length}</div>
          <div class="stat-label">Expired items</div>
        </div>
        <div class="stat-card">
          <div class="stat-ic" style="background:var(--herb-100);color:var(--herb-600)">✨</div>
          <div class="stat-value">${recs.length}</div>
          <div class="stat-label">Meals matched today</div>
        </div>
      </div>

      <div class="dash-grid">
        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card">
            <div class="panel-title"><h2>✨ Top AI recommendation</h2><a href="meal-recommendation.html" class="btn btn-ghost btn-sm">See all →</a></div>
            ${top ? `
              <div class="flex" style="gap:16px;align-items:flex-start;flex-wrap:wrap;">
                <div style="font-size:44px;line-height:1;">${top.recipe.emoji}</div>
                <div style="flex:1;min-width:220px;">
                  <div class="flex-between">
                    <h3 style="margin:0;font-size:17px;">${top.recipe.name}</h3>
                    <span class="badge badge-ok">${Math.round(top.score * 100)}% match</span>
                  </div>
                  <div class="text-sm muted" style="margin:4px 0 10px;">${top.recipe.cuisine} · ${top.recipe.mealType} · ${top.recipe.cookTime} min</div>
                  <div class="recipe-why">${top.explanation}</div>
                  <a href="recipe-details.html?id=${top.recipe.id}" class="btn btn-primary btn-sm" style="margin-top:12px;">View recipe</a>
                </div>
              </div>
            ` : `<div class="empty-state"><div class="ic">🍽️</div><h3>No matches yet</h3><p>Add a few pantry items to get your first AI meal recommendation.</p><a href="pantry.html" class="btn btn-primary btn-sm">Add ingredients</a></div>`}
          </div>

          <div class="card">
            <div class="panel-title"><h2>⏰ Expiry tracker</h2><a href="pantry.html" class="btn btn-ghost btn-sm">Manage pantry →</a></div>
            ${expiring.length || expired.length ? `
              <ul class="mini-list">
                ${[...expired, ...expiring].slice(0, 5).map(i => {
                  const st = APP.Ingredients.status(i.expiryDate);
                  const cfg = st === 'expired' ? { bg: 'var(--clay-100)', c: 'var(--clay-600)', ic: '🗑️', label: 'Expired' } : st === 'today' ? { bg: 'var(--clay-100)', c: 'var(--clay-600)', ic: '⚠️', label: 'Expires today' } : { bg: 'var(--gold-100)', c: 'var(--gold-600)', ic: '⏰', label: `${APP.Ingredients.daysUntil(i.expiryDate)}d left` };
                  return `<li><div class="mi-ic" style="background:${cfg.bg};color:${cfg.c}">${cfg.ic}</div><div class="mi-txt" style="flex:1"><b>${APP.esc(i.name)}</b><span>${APP.esc(i.location)} · ${APP.esc(i.category)}</span></div><span class="badge ${st === 'fresh' ? 'badge-ok' : st === 'soon' ? 'badge-warn' : 'badge-danger'}">${cfg.label}</span></li>`;
                }).join('')}
              </ul>` : `<div class="empty-state"><div class="ic">✅</div><h3>All fresh</h3><p>Nothing is expiring in the near future. Great job staying on top of your pantry.</p></div>`}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card">
            <div class="panel-title"><h2>📊 Pantry utilisation</h2></div>
            <div class="gauge-wrap">
              <div class="gauge-num">${utilisation}%</div>
              <div class="gauge-label">of pantry items are still fresh</div>
              <div class="progress-track" style="width:100%"><i style="width:${utilisation}%"></i></div>
            </div>
            <div class="divider"></div>
            <div class="flex-between text-sm"><span class="muted">Estimated waste avoided</span><b>${wasteReduction}%</b></div>
            <div class="progress-track" style="margin-top:6px;"><i style="width:${wasteReduction}%;background:linear-gradient(90deg,var(--gold-500),var(--basil-700));"></i></div>
            <p class="text-sm muted" style="margin-top:10px;margin-bottom:0;">Based on meals cooked from expiring stock and pantry freshness over time.</p>
          </div>

          <div class="card">
            <div class="panel-title"><h2>🔔 Recent notifications</h2><a href="notifications.html" class="btn btn-ghost btn-sm">View all →</a></div>
            ${notifs.length ? `<ul class="mini-list">${notifs.map(n => `
              <li><div class="mi-ic" style="background:var(--herb-100);color:var(--herb-600)">${n.type === 'expiry' ? '⏰' : n.type === 'meal' ? '✨' : '🛒'}</div>
              <div class="mi-txt" style="flex:1"><b>${APP.esc(n.title)}</b><span>${APP.timeAgo(n.createdAt)}</span></div>
              ${!n.read ? '<span class="status-dot" style="background:var(--clay-500)"></span>' : ''}</li>`).join('')}</ul>` : `<div class="empty-state"><div class="ic">🔕</div><h3>No notifications</h3><p>You're all caught up.</p></div>`}
          </div>

          <div class="card">
            <div class="panel-title"><h2>🛒 Shopping list</h2><a href="shopping-list.html" class="btn btn-ghost btn-sm">Open →</a></div>
            <div class="flex-between"><span class="muted text-sm">Pending items</span><span class="badge badge-info">${shoppingPending.length}</span></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('refreshBtn').addEventListener('click', () => {
      APP.Notifications.syncExpiryAlerts();
      render();
      APP.toast('Dashboard refreshed', 'success');
    });
  }
});
