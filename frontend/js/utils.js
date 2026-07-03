/* ============================================================
   4JobTracker — Shared utilities
   ============================================================ */

const Utils = {
  async requireAuth() {
    const session = await Api.getSession();
    if (!session) {
      window.location.href = 'login.html';
    }
  },

  async redirectIfLoggedIn() {
    const session = await Api.getSession();
    if (session) {
      window.location.href = 'dashboard.html';
    }
  },

  showToast(message, type = 'success') {
    let toast = document.getElementById('jt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'jt-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  formatSalary(min, max) {
    if (!min && !max) return '—';
    const fmt = (n) => `$${Number(n).toLocaleString()}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min || max);
  },

  badgeClass(status) {
    const map = {
      Applied: 'badge-applied',
      Interviewing: 'badge-interviewing',
      Offer: 'badge-offer',
      Rejected: 'badge-rejected',
      Withdrawn: 'badge-withdrawn'
    };
    return map[status] || 'badge-applied';
  },

  statusOrder: ['Applied', 'Interviewing', 'Offer'],

  initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  },

  setActiveNav(page) {
    document.querySelectorAll('.trail-nav a').forEach(a => {
      a.classList.toggle('active', a.dataset.page === page);
    });
  },

  async fillSidebarUser() {
    const user = await Api.getUser();
    const nameEl = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    if (user && nameEl) nameEl.textContent = user.fullName;
    if (user && emailEl) emailEl.textContent = user.email;
  },

  bindLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.addEventListener('click', async () => {
        await Api.signOut();
        window.location.href = 'login.html';
      });
    }
  },

  debounce(fn, delay = 350) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
};
