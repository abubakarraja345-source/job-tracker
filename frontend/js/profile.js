/* ============================================================
   Job-Tracker — Profile page logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  Utils.requireAuth();
  Utils.setActiveNav('profile');
  Utils.fillSidebarUser();
  Utils.bindLogout();

  const errorBox = document.getElementById('formError');
  const successBox = document.getElementById('formSuccess');

  try {
    const profile = await Api.getProfile();
    document.getElementById('fullName').value = profile.full_name;
    document.getElementById('email').value = profile.email;
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');
    successBox.classList.remove('visible');

    const fullName = document.getElementById('fullName').value.trim();
    const password = document.getElementById('password').value;

    try {
      await Api.updateProfile({ fullName, password: password || undefined });
      const user = Api.getUser();
      user.fullName = fullName;
      Api.setSession(Api.getToken(), user);
      Utils.fillSidebarUser();
      successBox.textContent = 'Profile updated.';
      successBox.classList.add('visible');
      document.getElementById('password').value = '';
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.add('visible');
    }
  });
});
