document.addEventListener('DOMContentLoaded', () => {
  if (APP.Auth.currentUser()) { window.location.href = 'dashboard.html'; return; }

  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');

  function setError(fieldId, invalid) {
    document.getElementById(fieldId).classList.toggle('invalid', invalid);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setError('f-email', !emailOk);
    setError('f-password', !password);
    if (!emailOk || !password) return;

    submitBtn.disabled = true; submitBtn.textContent = 'Signing in…';
    try {
      await APP.Auth.login({ email, password });
      APP.toast('Login successful — welcome back!', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 500);
    } catch (err) {
      APP.toast(err.message, 'error');
      submitBtn.disabled = false; submitBtn.textContent = 'Sign in';
    }
  });

  document.getElementById('demoBtn').addEventListener('click', () => {
    APP.Auth.loginDemo();
    APP.toast('Demo account loaded', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 400);
  });

  const forgotModal = document.getElementById('forgotModal');
  document.getElementById('forgotLink').addEventListener('click', (e) => { e.preventDefault(); forgotModal.classList.add('open'); });
  forgotModal.querySelector('.modal-close').addEventListener('click', () => forgotModal.classList.remove('open'));
  forgotModal.addEventListener('click', (e) => { if (e.target === forgotModal) forgotModal.classList.remove('open'); });
  document.getElementById('resetSendBtn').addEventListener('click', () => {
    const email = document.getElementById('resetEmail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { APP.toast('Enter a valid email first.', 'error'); return; }
    forgotModal.classList.remove('open');
    APP.toast('If an account exists for that email, a reset link has been sent.', 'info');
  });
});
