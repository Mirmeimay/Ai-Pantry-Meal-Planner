document.addEventListener('DOMContentLoaded', () => {
  const user = APP.renderShell('shopping-list.html');
  if (!user) return;
  APP.setTitle('Shopping List');

  const body = document.getElementById('pageBody');

  function render() {
    const all = APP.Shopping.all();
    const pending = all.filter(s => !s.done);
    const done = all.filter(s => s.done);
    const byCategory = {};
    pending.forEach(s => { (byCategory[s.category] = byCategory[s.category] || []).push(s); });

    body.innerHTML = `
      <div class="flex-between" style="margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div><h2 style="margin:0;font-size:22px;">Shopping List</h2><p style="margin:2px 0 0;">${pending.length} item${pending.length === 1 ? '' : 's'} to buy · ${done.length} completed</p></div>
        <div class="flex gap-2">
          <button class="btn btn-secondary" id="exportBtn">⬇ Export list</button>
          <button class="btn btn-primary" id="addBtn">+ Add item</button>
        </div>
      </div>

      ${all.length ? `
      <div class="card" style="margin-bottom:20px;">
        <div class="flex-between" style="margin-bottom:6px;"><span class="text-sm muted">Progress</span><span class="text-sm" style="font-weight:700">${done.length}/${all.length} done</span></div>
        <div class="progress-track"><i style="width:${all.length ? (done.length / all.length) * 100 : 0}%"></i></div>
      </div>` : ''}

      ${pending.length ? Object.entries(byCategory).map(([cat, arr]) => `
        <div class="shop-cat">
          <h3>${APP.esc(cat)}</h3>
          ${arr.map(itemHtml).join('')}
        </div>`).join('') : (done.length === 0 ? `
        <div class="card"><div class="empty-state">
          <div class="ic">🛒</div><h3>Your shopping list is empty</h3>
          <p>Add items manually, or generate a list automatically from any recipe's missing ingredients.</p>
          <a href="meal-recommendation.html" class="btn btn-primary btn-sm">Browse AI recommendations</a>
        </div></div>` : '')}

      ${done.length ? `
        <div class="shop-cat">
          <div class="flex-between"><h3>Completed</h3><button class="btn btn-ghost btn-sm" id="clearDoneBtn">Clear completed</button></div>
          ${done.map(itemHtml).join('')}
        </div>` : ''}
    `;

    document.getElementById('addBtn').onclick = openAddModal;
    document.getElementById('exportBtn').onclick = exportList;
    document.getElementById('clearDoneBtn')?.addEventListener('click', async () => {
      const ok = await APP.confirmDialog({ title: 'Clear completed items?', message: 'This removes all checked-off items from your list.', confirmText: 'Clear', danger: false });
      if (ok) { APP.Shopping.clearDone(); render(); APP.toast('Completed items cleared', 'success'); }
    });
    body.querySelectorAll('[data-toggle]').forEach(el => el.onclick = () => { APP.Shopping.toggle(el.dataset.toggle); render(); });
    body.querySelectorAll('[data-del]').forEach(el => el.onclick = () => { APP.Shopping.remove(el.dataset.del); render(); APP.toast('Item removed', 'success'); });
  }

  function itemHtml(s) {
    return `<div class="shop-item ${s.done ? 'done' : ''}">
      <input type="checkbox" ${s.done ? 'checked' : ''} data-toggle="${s.id}">
      <div style="flex:1"><div class="item-name">${APP.esc(s.name)}</div><div class="item-qty">${APP.esc(s.qty || '')}</div></div>
      <button class="btn btn-ghost btn-sm" data-del="${s.id}" aria-label="Remove">✕</button>
    </div>`;
  }

  function openAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-head"><h3>Add shopping item</h3><button class="modal-close">&times;</button></div>
        <div class="modal-body">
          <div class="field" id="f-name"><label>Item name</label><input class="input" id="in-name" placeholder="e.g. Olive Oil"><div class="err-msg">Item name is required.</div></div>
          <div class="input-row">
            <div class="field"><label>Category</label><select class="input" id="in-cat">${APP.CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select></div>
            <div class="field"><label>Quantity</label><input class="input" id="in-qty" placeholder="e.g. 1 bottle"></div>
          </div>
        </div>
        <div class="modal-foot"><button class="btn btn-secondary" data-act="cancel">Cancel</button><button class="btn btn-primary" data-act="save">Add item</button></div>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('.modal-close').onclick = close;
    overlay.querySelector('[data-act="cancel"]').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-act="save"]').onclick = () => {
      const name = document.getElementById('in-name').value.trim();
      if (!name) { document.getElementById('f-name').classList.add('invalid'); return; }
      APP.Shopping.add({ name, category: document.getElementById('in-cat').value, qty: document.getElementById('in-qty').value.trim() || '1' });
      close(); render(); APP.toast('Item added to shopping list', 'success');
    };
  }

  function exportList() {
    const all = APP.Shopping.all();
    if (!all.length) { APP.toast('Your shopping list is empty', 'error'); return; }
    const text = all.map(s => `${s.done ? '[x]' : '[ ]'} ${s.name} — ${s.qty || ''} (${s.category})`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shopping-list.txt'; a.click();
    URL.revokeObjectURL(url);
    APP.toast('Shopping list exported', 'success');
  }

  render();
});
