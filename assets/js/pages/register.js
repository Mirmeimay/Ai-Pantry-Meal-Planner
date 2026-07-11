document.addEventListener('DOMContentLoaded', () => {
  if (APP.Auth.currentUser()) { window.location.href = 'dashboard.html'; return; }

  const pwInput = document.getElementById('password');
  const pwBar = document.getElementById('pwBar');
  pwInput.addEventListener('input', () => {
    const v = pwInput.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const pct = (score / 4) * 100;
    pwBar.style.width = pct + '%';
    pwBar.style.background = score <= 1 ? 'var(--clay-500)' : score === 2 ? 'var(--gold-500)' : 'var(--basil-700)';
  });

  function setError(fieldId, invalid) { document.getElementById(fieldId).classList.toggle('invalid', invalid); }

  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;
    const terms = document.getElementById('terms').checked;

    const nameOk = name.length >= 2;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwOk = password.length >= 8;
    const matchOk = password === confirm && confirm.length > 0;

    setError('f-name', !nameOk);
    setError('f-email', !emailOk);
    setError('f-password', !pwOk);
    setError('f-confirm', !matchOk);

    if (!nameOk || !emailOk || !pwOk || !matchOk) return;
    if (!terms) { APP.toast('Please accept the Terms and Privacy Policy to continue.', 'error'); return; }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true; btn.textContent = 'Creating account…';
    try {
      await APP.Auth.register({ name, email, password });
      APP.toast('Account created — welcome to XAI Pantry!', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 500);
    } catch (err) {
      APP.toast(err.message, 'error');
      btn.disabled = false; btn.textContent = 'Create account';
    }
  });
});
