/* ==========================================================================
   XAI PANTRY — core app layer
   A self-contained "backend simulation": persistent data layer (localStorage),
   auth, and shared UI utilities used by every page. Vanilla JS, no build step.
   ========================================================================== */

const APP = (() => {
  const DB_KEY = 'xaipantry_db_v1';
  const CATEGORIES = ['Produce','Dairy','Meat & Poultry','Seafood','Grains & Pasta','Bakery','Condiments','Spices','Frozen','Canned & Jarred','Beverages','Other'];
  const UNITS = ['pcs','g','kg','ml','l','pack','bottle','can','bunch','loaf'];
  const LOCATIONS = ['Fridge','Freezer','Pantry Shelf','Counter'];
  const DIETARY = ['Vegetarian','Vegan','Halal','Gluten-Free','Dairy-Free','Low-Carb','Pescatarian'];
  const ALLERGIES = ['Peanuts','Tree Nuts','Shellfish','Eggs','Soy','Gluten','Dairy'];

  function seedDB() {
    const now = Date.now();
    const day = 86400000;
    const iso = (offset) => new Date(now + offset * day).toISOString().slice(0, 10);
    const demoUserId = 'u_demo';
    return {
      users: [{
        id: demoUserId, name: 'Amir Rahman', email: 'demo@xaipantry.app',
        passwordHash: null, dietary: ['Halal'], allergies: ['Peanuts'],
        cuisine: ['Asian', 'Mediterranean'], avatarInitial: 'A', createdAt: iso(-40),
        notifyExpiry: true, notifyShopping: true, notifyMeals: false
      }],
      session: { userId: null },
      ingredients: [
        { id: 'i1', userId: demoUserId, name: 'Chicken Breast', category: 'Meat & Poultry', quantity: 2, unit: 'pcs', location: 'Fridge', purchaseDate: iso(-2), expiryDate: iso(3) },
        { id: 'i2', userId: demoUserId, name: 'Milk', category: 'Dairy', quantity: 1, unit: 'bottle', location: 'Fridge', purchaseDate: iso(-4), expiryDate: iso(1) },
        { id: 'i3', userId: demoUserId, name: 'Spinach', category: 'Produce', quantity: 1, unit: 'pack', location: 'Fridge', purchaseDate: iso(-3), expiryDate: iso(0) },
        { id: 'i4', userId: demoUserId, name: 'Rice', category: 'Grains & Pasta', quantity: 2, unit: 'kg', location: 'Pantry Shelf', purchaseDate: iso(-20), expiryDate: iso(180) },
        { id: 'i5', userId: demoUserId, name: 'Eggs', category: 'Dairy', quantity: 8, unit: 'pcs', location: 'Fridge', purchaseDate: iso(-5), expiryDate: iso(12) },
        { id: 'i6', userId: demoUserId, name: 'Carrots', category: 'Produce', quantity: 5, unit: 'pcs', location: 'Fridge', purchaseDate: iso(-6), expiryDate: iso(4) },
        { id: 'i7', userId: demoUserId, name: 'Soy Sauce', category: 'Condiments', quantity: 1, unit: 'bottle', location: 'Pantry Shelf', purchaseDate: iso(-30), expiryDate: iso(300) },
        { id: 'i8', userId: demoUserId, name: 'Garlic', category: 'Produce', quantity: 6, unit: 'pcs', location: 'Pantry Shelf', purchaseDate: iso(-10), expiryDate: iso(20) },
        { id: 'i9', userId: demoUserId, name: 'Tomatoes', category: 'Produce', quantity: 4, unit: 'pcs', location: 'Fridge', purchaseDate: iso(-3), expiryDate: iso(-1) },
        { id: 'i10', userId: demoUserId, name: 'Onions', category: 'Produce', quantity: 3, unit: 'pcs', location: 'Pantry Shelf', purchaseDate: iso(-8), expiryDate: iso(15) },
        { id: 'i11', userId: demoUserId, name: 'Greek Yogurt', category: 'Dairy', quantity: 1, unit: 'pack', location: 'Fridge', purchaseDate: iso(-1), expiryDate: iso(9) },
        { id: 'i12', userId: demoUserId, name: 'Pasta', category: 'Grains & Pasta', quantity: 1, unit: 'pack', location: 'Pantry Shelf', purchaseDate: iso(-15), expiryDate: iso(200) },
        { id: 'i13', userId: demoUserId, name: 'Bell Pepper', category: 'Produce', quantity: 2, unit: 'pcs', location: 'Fridge', purchaseDate: iso(-2), expiryDate: iso(5) },
        { id: 'i14', userId: demoUserId, name: 'Bread', category: 'Bakery', quantity: 1, unit: 'loaf', location: 'Counter', purchaseDate: iso(-2), expiryDate: iso(2) },
      ],
      shopping: [
        { id: 's1', userId: demoUserId, name: 'Olive Oil', category: 'Condiments', qty: '1 bottle', done: false, addedAt: iso(-1) },
        { id: 's2', userId: demoUserId, name: 'Basmati Rice', category: 'Grains & Pasta', qty: '1 kg', done: true, addedAt: iso(-3) },
      ],
      notifications: [
        { id: 'n1', userId: demoUserId, type: 'expiry', title: 'Spinach expires today', message: 'Use it up in tonight\u2019s recipe to avoid waste.', read: false, createdAt: now - 1 * 3600000 },
        { id: 'n2', userId: demoUserId, type: 'expiry', title: 'Milk expires tomorrow', message: 'Consider a recipe that uses dairy soon.', read: false, createdAt: now - 5 * 3600000 },
        { id: 'n3', userId: demoUserId, type: 'meal', title: 'New meal match found', message: 'Chicken Fried Rice scored 92% using items you already have.', read: true, createdAt: now - 26 * 3600000 },
        { id: 'n4', userId: demoUserId, type: 'shopping', title: 'Shopping list reminder', message: 'You have 2 items pending in your shopping list.', read: true, createdAt: now - 50 * 3600000 },
      ],
      mealLog: [
        { id: 'm1', userId: demoUserId, recipeId: 'r2', date: iso(-2) },
        { id: 'm2', userId: demoUserId, recipeId: 'r6', date: iso(-6) },
      ],
      settings: { theme: null }
    };
  }

  function load() {
    let raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const seeded = seedDB();
      localStorage.setItem(DB_KEY, JSON.stringify(seeded));
      return seeded;
    }
    try { return JSON.parse(raw); } catch (e) { const s = seedDB(); save(s); return s; }
  }
  function save(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  function uid(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 10); }

  async function hash(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 0; for (let i = 0; i < text.length; i++) { h = (h << 5) - h + text.charCodeAt(i); h |= 0; }
    return String(h);
  }

  // ---------------- Auth ----------------
  const Auth = {
    async register({ name, email, password }) {
      const db = load();
      email = email.trim().toLowerCase();
      if (db.users.some(u => u.email === email)) throw new Error('An account with this email already exists.');
      const passwordHash = await hash(password);
      const user = {
        id: uid('u'), name: name.trim(), email, passwordHash,
        dietary: [], allergies: [], cuisine: [], avatarInitial: name.trim()[0]?.toUpperCase() || 'U',
        createdAt: new Date().toISOString().slice(0, 10), notifyExpiry: true, notifyShopping: true, notifyMeals: true
      };
      db.users.push(user);
      db.session.userId = user.id;
      save(db);
      return user;
    },
    async login({ email, password }) {
      const db = load();
      email = email.trim().toLowerCase();
      const user = db.users.find(u => u.email === email);
      if (!user) throw new Error('No account found with that email.');
      if (user.passwordHash) {
        const h = await hash(password);
        if (h !== user.passwordHash) throw new Error('Incorrect password.');
      } else if (!password) {
        throw new Error('Please enter your password.');
      }
      db.session.userId = user.id;
      save(db);
      return user;
    },
    loginDemo() {
      const db = load();
      db.session.userId = 'u_demo';
      save(db);
      return db.users.find(u => u.id === 'u_demo');
    },
    logout() { const db = load(); db.session.userId = null; save(db); },
    currentUser() {
      const db = load();
      if (!db.session.userId) return null;
      return db.users.find(u => u.id === db.session.userId) || null;
    },
    requireAuth() {
      const u = Auth.currentUser();
      if (!u) { window.location.href = 'login.html'; return null; }
      return u;
    },
    updateUser(patch) {
      const db = load();
      const u = db.users.find(x => x.id === db.session.userId);
      if (!u) return null;
      Object.assign(u, patch);
      save(db);
      return u;
    },
    async changePassword(newPass) {
      const db = load();
      const u = db.users.find(x => x.id === db.session.userId);
      u.passwordHash = await hash(newPass);
      save(db);
    }
  };

  // ---------------- Data (Ingredients / Shopping / Notifications) ----------------
  function scopedUserId() { return Auth.currentUser()?.id; }

  const Ingredients = {
    all() { const uidCur = scopedUserId(); return load().ingredients.filter(i => i.userId === uidCur).sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)); },
    get(id) { return load().ingredients.find(i => i.id === id); },
    add(item) {
      const db = load();
      const row = { id: uid('i'), userId: scopedUserId(), ...item };
      db.ingredients.push(row); save(db); return row;
    },
    update(id, patch) {
      const db = load();
      const row = db.ingredients.find(i => i.id === id);
      if (row) { Object.assign(row, patch); save(db); }
      return row;
    },
    remove(id) {
      const db = load();
      db.ingredients = db.ingredients.filter(i => i.id !== id);
      save(db);
    },
    daysUntil(expiryDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const exp = new Date(expiryDate + 'T00:00:00');
      return Math.round((exp - today) / 86400000);
    },
    status(expiryDate) {
      const d = Ingredients.daysUntil(expiryDate);
      if (d < 0) return 'expired';
      if (d === 0) return 'today';
      if (d <= 3) return 'soon';
      return 'fresh';
    }
  };

  const Shopping = {
    all() { const uidCur = scopedUserId(); return load().shopping.filter(s => s.userId === uidCur).sort((a, b) => a.done - b.done); },
    add(item) { const db = load(); const row = { id: uid('s'), userId: scopedUserId(), done: false, addedAt: new Date().toISOString().slice(0, 10), ...item }; db.shopping.push(row); save(db); return row; },
    toggle(id) { const db = load(); const row = db.shopping.find(s => s.id === id); if (row) { row.done = !row.done; save(db); } return row; },
    remove(id) { const db = load(); db.shopping = db.shopping.filter(s => s.id !== id); save(db); },
    clearDone() { const db = load(); db.shopping = db.shopping.filter(s => !(s.userId === scopedUserId() && s.done)); save(db); },
    addMissing(names) {
      const db = load(); const existing = new Set(db.shopping.filter(s => s.userId === scopedUserId()).map(s => s.name.toLowerCase()));
      let added = 0;
      names.forEach(n => {
        if (!existing.has(n.toLowerCase())) {
          db.shopping.push({ id: uid('s'), userId: scopedUserId(), name: n, category: 'Other', qty: '1', done: false, addedAt: new Date().toISOString().slice(0, 10) });
          added++;
        }
      });
      save(db); return added;
    }
  };

  const Notifications = {
    all() { const uidCur = scopedUserId(); return load().notifications.filter(n => n.userId === uidCur).sort((a, b) => b.createdAt - a.createdAt); },
    unreadCount() { return Notifications.all().filter(n => !n.read).length; },
    markRead(id) { const db = load(); const n = db.notifications.find(x => x.id === id); if (n) { n.read = true; save(db); } },
    markAllRead() { const db = load(); const uidCur = scopedUserId(); db.notifications.forEach(n => { if (n.userId === uidCur) n.read = true; }); save(db); },
    push(n) { const db = load(); db.notifications.unshift({ id: uid('n'), userId: scopedUserId(), read: false, createdAt: Date.now(), ...n }); save(db); },
    remove(id) { const db = load(); db.notifications = db.notifications.filter(n => n.id !== id); save(db); },
    syncExpiryAlerts() {
      // Generate/refresh notifications for items expiring soon, avoiding duplicates per day.
      const db = load(); const uidCur = scopedUserId();
      const items = db.ingredients.filter(i => i.userId === uidCur);
      items.forEach(it => {
        const status = Ingredients.status(it.expiryDate);
        if (status === 'today' || status === 'soon' || status === 'expired') {
          const key = `expiry-${it.id}-${it.expiryDate}`;
          if (!db.notifications.some(n => n.dedupeKey === key)) {
            const label = status === 'expired' ? 'has expired' : status === 'today' ? 'expires today' : `expires in ${Ingredients.daysUntil(it.expiryDate)} day(s)`;
            db.notifications.unshift({
              id: uid('n'), userId: uidCur, type: 'expiry', dedupeKey: key,
              title: `${it.name} ${label}`, message: `Stored in your ${it.location.toLowerCase()}. Check the AI Meal Recommendation page for ways to use it before it goes to waste.`,
              read: false, createdAt: Date.now()
            });
          }
        }
      });
      save(db);
    }
  };

  // ---------------- UI utilities ----------------
  function ensureToastStack() {
    let stack = document.querySelector('.toast-stack');
    if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.appendChild(stack); }
    return stack;
  }
  const ICONS = { success: '✅', error: '⚠️', info: 'ℹ️' };
  function toast(message, type = 'success', duration = 3400) {
    const stack = ensureToastStack();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span class="tic">${ICONS[type] || ''}</span><span>${message}</span>`;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; setTimeout(() => el.remove(), 260); }, duration);
  }

  function confirmDialog({ title = 'Are you sure?', message = '', confirmText = 'Confirm', danger = true }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay open';
      overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-head"><h3>${title}</h3><button class="modal-close" aria-label="Close">&times;</button></div>
          <div class="modal-body"><p style="margin:0">${message}</p></div>
          <div class="modal-foot">
            <button class="btn btn-secondary" data-act="cancel">Cancel</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${confirmText}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      const close = (val) => { overlay.remove(); resolve(val); };
      overlay.querySelector('[data-act="cancel"]').onclick = () => close(false);
      overlay.querySelector('.modal-close').onclick = () => close(false);
      overlay.querySelector('[data-act="ok"]').onclick = () => close(true);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    });
  }

  function initTheme() {
    const db = load();
    let theme = db.settings.theme;
    if (!theme) theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    const db = load(); db.settings.theme = cur; save(db);
    document.querySelectorAll('[data-theme-icon]').forEach(el => el.textContent = cur === 'dark' ? '☀️' : '🌙');
    return cur;
  }

  const NAV_ITEMS = [
    { href: 'dashboard.html', label: 'Dashboard', icon: '⌂' },
    { href: 'pantry.html', label: 'Pantry', icon: '🥬' },
    { href: 'meal-recommendation.html', label: 'AI Meals', icon: '✨' },
    { href: 'shopping-list.html', label: 'Shopping List', icon: '🛒' },
    { href: 'notifications.html', label: 'Notifications', icon: '🔔' },
    { href: 'profile.html', label: 'Profile', icon: '⚙︎' },
  ];

  function renderShell(activeHref) {
    const user = Auth.requireAuth();
    if (!user) return null;
    const root = document.getElementById('app-shell-root');
    if (!root) return user;
    const unread = Notifications.unreadCount();
    root.innerHTML = `
      <button class="menu-btn icon-btn" id="menuToggle" aria-label="Toggle menu" style="position:fixed;top:14px;left:14px;z-index:50;">☰</button>
      <aside class="sidebar" id="sidebar">
        <div class="brand"><div class="brand-mark">🍽️</div><div class="brand-name">XAI Pantry<span>Meal Planner</span></div></div>
        <nav class="nav-group">
          <div class="nav-label">Menu</div>
          ${NAV_ITEMS.map(it => `
            <a href="${it.href}" class="nav-link ${activeHref === it.href ? 'active' : ''}">
              <span class="ic">${it.icon}</span>${it.label}
              ${it.href === 'notifications.html' && unread ? `<span class="nav-badge">${unread}</span>` : ''}
            </a>`).join('')}
        </nav>
        <div class="sidebar-foot">
          <a href="profile.html" class="user-chip">
            <div class="avatar">${user.avatarInitial || user.name[0]}</div>
            <div class="who"><b>${user.name}</b><small>${user.email}</small></div>
          </a>
          <button class="btn btn-ghost btn-block btn-sm" id="logoutBtn" style="margin-top:10px;justify-content:flex-start">↩ Sign out</button>
        </div>
      </aside>
      <div class="content">
        <header class="topbar">
          <h1 id="pageTitle"></h1>
          <div class="topbar-right">
            <button class="icon-btn" id="notifBtn" title="Notifications" onclick="location.href='notifications.html'">
              🔔${unread ? '<span class="dot-alert"></span>' : ''}
            </button>
            <button class="theme-toggle" id="themeBtn"><span data-theme-icon>${document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}</span></button>
          </div>
        </header>
        <main class="page-body" id="pageBody"></main>
      </div>`;
    document.getElementById('logoutBtn').onclick = async () => {
      const ok = await confirmDialog({ title: 'Sign out?', message: 'You can sign back in anytime with your email and password.', confirmText: 'Sign out', danger: false });
      if (ok) { Auth.logout(); window.location.href = 'login.html'; }
    };
    document.getElementById('themeBtn').onclick = toggleTheme;
    document.getElementById('menuToggle').onclick = () => document.getElementById('sidebar').classList.toggle('open');
    return user;
  }

  function setTitle(t) { const el = document.getElementById('pageTitle'); if (el) el.textContent = t; document.title = t + ' · XAI Pantry'; }
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  return {
    CATEGORIES, UNITS, LOCATIONS, DIETARY, ALLERGIES,
    load, save, uid, Auth, Ingredients, Shopping, Notifications,
    toast, confirmDialog, initTheme, toggleTheme, renderShell, setTitle, esc, timeAgo
  };
})();

document.addEventListener('DOMContentLoaded', () => { APP.initTheme(); });
