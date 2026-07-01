/* ============================================================
   Job-Tracker — Auth page logic (login.html / register.html)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  Utils.redirectIfLoggedIn();

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const errorBox = document.getElementById('formError');

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.add('visible');
  }
  function hideError() {
    errorBox.classList.remove('visible');
  }
  function setLoading(btn, loading, label) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait…' : label;
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();
      const btn = document.getElementById('submitBtn');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      setLoading(btn, true, 'Log in');
      try {
        const data = await Api.login({ email, password });
        Api.setSession(data.token, data.user);
        window.location.href = 'dashboard.html';
      } catch (err) {
        showError(err.message);
        setLoading(btn, false, 'Log in');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError();
      const btn = document.getElementById('submitBtn');
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (password.length < 6) {
        showError('Password must be at least 6 characters.');
        return;
      }

      setLoading(btn, true, 'Create account');
      try {
        const data = await Api.register({ fullName, email, password });
        Api.setSession(data.token, data.user);
        window.location.href = 'dashboard.html';
      } catch (err) {
        showError(err.message);
        setLoading(btn, false, 'Create account');
      }
    });
  }
});
