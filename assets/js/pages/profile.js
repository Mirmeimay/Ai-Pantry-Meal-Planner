document.addEventListener('DOMContentLoaded', () => {
  let user = APP.renderShell('profile.html');
  if (!user) return;
  APP.setTitle('Profile & Settings');

  const body = document.getElementById('pageBody');

  function render() {
    body.innerHTML = `
      <div class="profile-grid">
        <div class="card profile-card">
          <div class="profile-avatar">${user.avatarInitial || user.name[0]}</div>
          <h3 style="margin-bottom:2px;">${APP.esc(user.name)}</h3>
          <p class="text-sm" style="margin-bottom:14px;">${APP.esc(user.email)}</p>
          <div class="divider"></div>
          <div class="text-sm muted" style="text-align:left;">Member since<br><b style="color:var(--text)">${user.createdAt}</b></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px;">
          <div class="card">
            <div class="panel-title"><h2>Account details</h2></div>
            <form id="infoForm">
              <div class="input-row">
                <div class="field"><label>Full name</label><input class="input" id="pf-name" value="${APP.esc(user.name)}"></div>
                <div class="field"><label>Email address</label><input class="input" type="email" id="pf-email" value="${APP.esc(user.email)}"></div>
              </div>
              <button class="btn btn-primary" type="submit">Save changes</button>
            </form>
          </div>

          <div class="card">
            <div class="panel-title"><h2>Change password</h2></div>
            <form id="pwForm">
              <div class="input-row">
                <div class="field"><label>New password</label><input class="input" type="password" id="pf-newpw" placeholder="At least 8 characters"></div>
                <div class="field"><label>Confirm new password</label><input class="input" type="password" id="pf-confirmpw" placeholder="Re-enter password"></div>
              </div>
              <button class="btn btn-secondary" type="submit">Update password</button>
            </form>
          </div>

          <div class="card">
            <div class="panel-title"><h2>Dietary preferences</h2></div>
            <p class="text-sm" style="margin-top:-6px;">Used to filter AI meal recommendations.</p>
            <div class="tag-select" id="dietTags">${APP.DIETARY.map(d => `<span class="tag-opt ${user.dietary?.includes(d) ? 'sel' : ''}" data-d="${d}">${d}</span>`).join('')}</div>
            <div class="divider"></div>
            <div class="panel-title" style="margin-bottom:10px;"><h2 style="font-size:15px;">Allergies</h2></div>
            <div class="tag-select" id="allergyTags">${APP.ALLERGIES.map(a => `<span class="tag-opt ${user.allergies?.includes(a) ? 'sel' : ''}" data-a="${a}">${a}</span>`).join('')}</div>
          </div>

          <div class="card">
            <div class="panel-title"><h2>Notification preferences</h2></div>
            <div class="settings-row"><div><b>Expiry alerts</b><span>Get notified when pantry items are about to expire</span></div><label class="switch"><input type="checkbox" id="sw-expiry" ${user.notifyExpiry ? 'checked' : ''}><span class="slider"></span></label></div>
            <div class="settings-row"><div><b>Shopping reminders</b><span>Reminders about pending shopping list items</span></div><label class="switch"><input type="checkbox" id="sw-shopping" ${user.notifyShopping ? 'checked' : ''}><span class="slider"></span></label></div>
            <div class="settings-row"><div><b>Meal suggestions</b><span>Get notified about new high-match meal recommendations</span></div><label class="switch"><input type="checkbox" id="sw-meals" ${user.notifyMeals ? 'checked' : ''}><span class="slider"></span></label></div>
            <div class="settings-row"><div><b>Dark mode</b><span>Toggle the app's colour theme</span></div><label class="switch"><input type="checkbox" id="sw-theme" ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'checked' : ''}><span class="slider"></span></label></div>
          </div>

          <div class="card" style="border-color:var(--clay-500);">
            <div class="panel-title"><h2 style="color:var(--clay-600);">Danger zone</h2></div>
            <div class="settings-row"><div><b>Clear all pantry data</b><span>Removes every ingredient, shopping item and notification</span></div><button class="btn btn-danger btn-sm" id="clearDataBtn">Clear data</button></div>
            <div class="settings-row"><div><b>Sign out everywhere</b><span>End your current session on this device</span></div><button class="btn btn-secondary btn-sm" id="signOutBtn">Sign out</button></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('infoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('pf-name').value.trim();
      const email = document.getElementById('pf-email').value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { APP.toast('Enter a valid name and email.', 'error'); return; }
      user = APP.Auth.updateUser({ name, email, avatarInitial: name[0].toUpperCase() });
      APP.toast('Account details updated', 'success');
      render();
    });

    document.getElementById('pwForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('pf-newpw').value;
      const cpw = document.getElementById('pf-confirmpw').value;
      if (pw.length < 8) { APP.toast('Password must be at least 8 characters.', 'error'); return; }
      if (pw !== cpw) { APP.toast('Passwords do not match.', 'error'); return; }
      await APP.Auth.changePassword(pw);
      APP.toast('Password updated successfully', 'success');
      e.target.reset();
    });

    document.querySelectorAll('#dietTags .tag-opt').forEach(el => el.onclick = () => {
      const d = el.dataset.d;
      const cur = user.dietary || [];
      user = APP.Auth.updateUser({ dietary: cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d] });
      render();
    });
    document.querySelectorAll('#allergyTags .tag-opt').forEach(el => el.onclick = () => {
      const a = el.dataset.a;
      const cur = user.allergies || [];
      user = APP.Auth.updateUser({ allergies: cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a] });
      render();
    });

    document.getElementById('sw-expiry').onchange = e => APP.Auth.updateUser({ notifyExpiry: e.target.checked });
    document.getElementById('sw-shopping').onchange = e => APP.Auth.updateUser({ notifyShopping: e.target.checked });
    document.getElementById('sw-meals').onchange = e => APP.Auth.updateUser({ notifyMeals: e.target.checked });
    document.getElementById('sw-theme').onchange = () => APP.toggleTheme();

    document.getElementById('clearDataBtn').onclick = async () => {
      const ok = await APP.confirmDialog({ title: 'Clear all pantry data?', message: 'This permanently removes all your ingredients, shopping list items and notifications. Your account stays active.', confirmText: 'Clear everything' });
      if (!ok) return;
      const db = APP.load();
      db.ingredients = db.ingredients.filter(i => i.userId !== user.id);
      db.shopping = db.shopping.filter(s => s.userId !== user.id);
      db.notifications = db.notifications.filter(n => n.userId !== user.id);
      db.mealLog = db.mealLog.filter(m => m.userId !== user.id);
      APP.save(db);
      APP.toast('All pantry data cleared', 'success');
    };
    document.getElementById('signOutBtn').onclick = async () => {
      const ok = await APP.confirmDialog({ title: 'Sign out?', message: 'You can sign back in anytime.', confirmText: 'Sign out', danger: false });
      if (ok) { APP.Auth.logout(); window.location.href = 'login.html'; }
    };
  }

  render();
});
