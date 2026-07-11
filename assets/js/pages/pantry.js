document.addEventListener('DOMContentLoaded', () => {
  const user = APP.renderShell('pantry.html');
  if (!user) return;
  APP.setTitle('Pantry');

  const body = document.getElementById('pageBody');
  let state = { search: '', category: 'All', sort: 'expiry-asc', tab: 'all' };

  function statusMeta(expiryDate) {
    const st = APP.Ingredients.status(expiryDate);
    const days = APP.Ingredients.daysUntil(expiryDate);
    if (st === 'expired') return { cls: 'badge-danger', label: 'Expired', dot: 'var(--clay-500)' };
    if (st === 'today') return { cls: 'badge-danger', label: 'Expires today', dot: 'var(--clay-500)' };
    if (st === 'soon') return { cls: 'badge-warn', label: `${days}d left`, dot: 'var(--gold-500)' };
    return { cls: 'badge-ok', label: 'Fresh', dot: 'var(--basil-700)' };
  }

  function getFiltered() {
    let items = APP.Ingredients.all();
    if (state.tab !== 'all') items = items.filter(i => APP.Ingredients.status(i.expiryDate) === state.tab);
    if (state.category !== 'All') items = items.filter(i => i.category === state.category);
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q));
    }
    const sorters = {
      'expiry-asc': (a, b) => a.expiryDate.localeCompare(b.expiryDate),
      'expiry-desc': (a, b) => b.expiryDate.localeCompare(a.expiryDate),
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'qty-desc': (a, b) => b.quantity - a.quantity,
    };
    return items.sort(sorters[state.sort]);
  }

  function counts() {
    const all = APP.Ingredients.all();
    return {
      all: all.length,
      fresh: all.filter(i => APP.Ingredients.status(i.expiryDate) === 'fresh').length,
      soon: all.filter(i => APP.Ingredients.status(i.expiryDate) === 'soon').length,
      today: all.filter(i => APP.Ingredients.status(i.expiryDate) === 'today').length,
      expired: all.filter(i => APP.Ingredients.status(i.expiryDate) === 'expired').length,
    };
  }

  function render() {
    const c = counts();
    const items = getFiltered();
    body.innerHTML = `
      <div class="flex-between" style="margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div><h2 style="margin:0;font-size:22px;">Pantry Inventory</h2><p style="margin:2px 0 0;">${c.all} item${c.all === 1 ? '' : 's'} tracked</p></div>
        <button class="btn btn-primary" id="addBtn">+ Add ingredient</button>
      </div>

      <div class="tabs">
        <button class="tab-btn ${state.tab === 'all' ? 'active' : ''}" data-tab="all">All (${c.all})</button>
        <button class="tab-btn ${state.tab === 'fresh' ? 'active' : ''}" data-tab="fresh">Fresh (${c.fresh})</button>
        <button class="tab-btn ${state.tab === 'soon' ? 'active' : ''}" data-tab="soon">Expiring soon (${c.soon})</button>
        <button class="tab-btn ${state.tab === 'today' ? 'active' : ''}" data-tab="today">Today (${c.today})</button>
        <button class="tab-btn ${state.tab === 'expired' ? 'active' : ''}" data-tab="expired">Expired (${c.expired})</button>
      </div>

      <div class="filter-bar">
        <input class="input" id="searchInput" placeholder="🔍 Search ingredients…" value="${APP.esc(state.search)}">
        <select class="input" id="categorySelect">
          <option value="All">All categories</option>
          ${APP.CATEGORIES.map(c2 => `<option ${state.category === c2 ? 'selected' : ''}>${c2}</option>`).join('')}
        </select>
        <select class="input" id="sortSelect">
          <option value="expiry-asc" ${state.sort === 'expiry-asc' ? 'selected' : ''}>Expiry: soonest first</option>
          <option value="expiry-desc" ${state.sort === 'expiry-desc' ? 'selected' : ''}>Expiry: latest first</option>
          <option value="name-asc" ${state.sort === 'name-asc' ? 'selected' : ''}>Name: A–Z</option>
          <option value="qty-desc" ${state.sort === 'qty-desc' ? 'selected' : ''}>Quantity: highest first</option>
        </select>
      </div>

      ${items.length ? `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Ingredient</th><th>Category</th><th>Quantity</th><th>Location</th><th>Expiry date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            ${items.map(i => {
              const meta = statusMeta(i.expiryDate);
              return `<tr>
                <td><b>${APP.esc(i.name)}</b></td>
                <td class="cell-muted">${APP.esc(i.category)}</td>
                <td class="cell-muted">${i.quantity} ${APP.esc(i.unit)}</td>
                <td class="cell-muted">${APP.esc(i.location)}</td>
                <td class="cell-muted">${i.expiryDate}</td>
                <td><span class="badge ${meta.cls}"><span class="status-dot" style="background:${meta.dot}"></span>${meta.label}</span></td>
                <td class="row-actions">
                  <button class="btn btn-secondary btn-sm" data-edit="${i.id}">Edit</button>
                  <button class="btn btn-danger btn-sm" data-del="${i.id}">Delete</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : `
      <div class="card"><div class="empty-state">
        <div class="ic">🥬</div><h3>No ingredients found</h3>
        <p>${state.search || state.category !== 'All' || state.tab !== 'all' ? 'Try adjusting your search or filters.' : 'Start by adding what\'s currently in your kitchen.'}</p>
        <button class="btn btn-primary btn-sm" id="emptyAddBtn">+ Add ingredient</button>
      </div></div>`}
    `;

    document.getElementById('addBtn').onclick = () => openForm();
    document.getElementById('emptyAddBtn')?.addEventListener('click', () => openForm());
    document.getElementById('searchInput').oninput = (e) => { state.search = e.target.value; render(); };
    document.getElementById('categorySelect').onchange = (e) => { state.category = e.target.value; render(); };
    document.getElementById('sortSelect').onchange = (e) => { state.sort = e.target.value; render(); };
    body.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => { state.tab = btn.dataset.tab; render(); });
    body.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openForm(APP.Ingredients.get(btn.dataset.edit)));
    body.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => handleDelete(btn.dataset.del));
  }

  async function handleDelete(id) {
    const item = APP.Ingredients.get(id);
    const ok = await APP.confirmDialog({ title: 'Delete ingredient?', message: `Remove <b>${APP.esc(item.name)}</b> from your pantry? This can't be undone.`, confirmText: 'Delete' });
    if (ok) { APP.Ingredients.remove(id); render(); APP.toast('Ingredient deleted', 'success'); }
  }

  function openForm(existing) {
    const isEdit = !!existing;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-head"><h3>${isEdit ? 'Edit ingredient' : 'Add ingredient'}</h3><button class="modal-close">&times;</button></div>
        <div class="modal-body">
          <div class="field" id="f-name"><label>Ingredient name</label><input class="input" id="in-name" value="${isEdit ? APP.esc(existing.name) : ''}" placeholder="e.g. Chicken Breast"><div class="err-msg">Name is required.</div></div>
          <div class="input-row">
            <div class="field"><label>Category</label><select class="input" id="in-category">${APP.CATEGORIES.map(c => `<option ${isEdit && existing.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
            <div class="field"><label>Storage location</label><select class="input" id="in-location">${APP.LOCATIONS.map(l => `<option ${isEdit && existing.location === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          </div>
          <div class="input-row">
            <div class="field" id="f-qty"><label>Quantity</label><input class="input" type="number" min="0" step="0.1" id="in-qty" value="${isEdit ? existing.quantity : 1}"><div class="err-msg">Enter a valid quantity.</div></div>
            <div class="field"><label>Unit</label><select class="input" id="in-unit">${APP.UNITS.map(u => `<option ${isEdit && existing.unit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
          </div>
          <div class="input-row">
            <div class="field"><label>Purchase date</label><input class="input" type="date" id="in-purchase" value="${isEdit ? existing.purchaseDate : new Date().toISOString().slice(0,10)}"></div>
            <div class="field" id="f-expiry"><label>Expiry date</label><input class="input" type="date" id="in-expiry" value="${isEdit ? existing.expiryDate : ''}"><div class="err-msg">Expiry date is required.</div></div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-secondary" data-act="cancel">Cancel</button>
          <button class="btn btn-primary" data-act="save">${isEdit ? 'Save changes' : 'Add ingredient'}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('.modal-close').onclick = close;
    overlay.querySelector('[data-act="cancel"]').onclick = close;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('[data-act="save"]').onclick = () => {
      const name = document.getElementById('in-name').value.trim();
      const qty = parseFloat(document.getElementById('in-qty').value);
      const expiry = document.getElementById('in-expiry').value;
      let valid = true;
      document.getElementById('f-name').classList.toggle('invalid', !name); if (!name) valid = false;
      document.getElementById('f-qty').classList.toggle('invalid', !(qty > 0)); if (!(qty > 0)) valid = false;
      document.getElementById('f-expiry').classList.toggle('invalid', !expiry); if (!expiry) valid = false;
      if (!valid) return;

      const payload = {
        name, category: document.getElementById('in-category').value,
        location: document.getElementById('in-location').value,
        quantity: qty, unit: document.getElementById('in-unit').value,
        purchaseDate: document.getElementById('in-purchase').value, expiryDate: expiry,
      };
      if (isEdit) { APP.Ingredients.update(existing.id, payload); APP.toast('Ingredient updated', 'success'); }
      else { APP.Ingredients.add(payload); APP.toast('Ingredient added to pantry', 'success'); }
      close(); render();
    };
  }

  render();
});
