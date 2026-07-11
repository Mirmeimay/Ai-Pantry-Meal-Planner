document.addEventListener('DOMContentLoaded', () => {
  const user = APP.renderShell('notifications.html');
  if (!user) return;
  APP.setTitle('Notifications');
  APP.Notifications.syncExpiryAlerts();

  const body = document.getElementById('pageBody');
  const ICONS = { expiry: { ic: '⏰', bg: 'var(--gold-100)', c: 'var(--gold-600)' }, meal: { ic: '✨', bg: 'var(--herb-100)', c: 'var(--herb-600)' }, shopping: { ic: '🛒', bg: 'var(--basil-100)', c: 'var(--basil-700)' } };

  function render() {
    const notifs = APP.Notifications.all();
    body.innerHTML = `
      <div class="flex-between" style="margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div><h2 style="margin:0;font-size:22px;">Notifications</h2><p style="margin:2px 0 0;">${notifs.filter(n => !n.read).length} unread</p></div>
        <button class="btn btn-secondary" id="markAllBtn">Mark all as read</button>
      </div>
      <div class="card" style="padding:0;">
        ${notifs.length ? notifs.map(n => {
          const cfg = ICONS[n.type] || ICONS.meal;
          return `<div class="notif-item ${!n.read ? 'unread' : ''}" style="padding-left:14px;padding-right:14px;">
            <div class="notif-ic" style="background:${cfg.bg};color:${cfg.c}">${cfg.ic}</div>
            <div style="flex:1"><div class="notif-txt"><b>${APP.esc(n.title)}</b><p>${APP.esc(n.message)}</p></div></div>
            <div class="flex" style="flex-direction:column;align-items:flex-end;gap:6px;">
              <span class="notif-time">${APP.timeAgo(n.createdAt)}</span>
              <div class="flex gap-2">
                ${!n.read ? `<button class="btn btn-ghost btn-sm" data-read="${n.id}">Mark read</button>` : ''}
                <button class="btn btn-ghost btn-sm" data-del="${n.id}">✕</button>
              </div>
            </div>
          </div>`;
        }).join('') : `<div class="empty-state"><div class="ic">🔕</div><h3>No notifications</h3><p>You're all caught up — nothing needs your attention right now.</p></div>`}
      </div>
    `;
    document.getElementById('markAllBtn').onclick = () => { APP.Notifications.markAllRead(); render(); APP.toast('All notifications marked as read', 'success'); };
    body.querySelectorAll('[data-read]').forEach(el => el.onclick = () => { APP.Notifications.markRead(el.dataset.read); render(); });
    body.querySelectorAll('[data-del]').forEach(el => el.onclick = () => { APP.Notifications.remove(el.dataset.del); render(); });
  }
  render();
});
