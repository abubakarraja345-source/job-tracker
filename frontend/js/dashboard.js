/* ============================================================
   Job-Tracker — Dashboard logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  Utils.requireAuth();
  Utils.setActiveNav('dashboard');
  Utils.fillSidebarUser();
  Utils.bindLogout();

  try {
    const stats = await Api.getStats();
    renderStatCards(stats);
    ChartsHelper.renderMonthChart('monthChart', stats.byMonth);
    ChartsHelper.renderStatusChart('statusChart', stats.byStatus);
    renderUpcomingReminders(stats.upcomingReminders);
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }
});

function renderStatCards(stats) {
  const byStatus = Object.fromEntries(stats.byStatus.map(r => [r.status, r.count]));
  const grid = document.getElementById('statGrid');
  grid.innerHTML = `
    <div class="stat-card">
      <span class="label">Total applications</span>
      <span class="value">${stats.total || 0}</span>
    </div>
    <div class="stat-card accent-gold">
      <span class="label">Interviewing</span>
      <span class="value">${byStatus.Interviewing || 0}</span>
    </div>
    <div class="stat-card accent-forest">
      <span class="label">Offers</span>
      <span class="value">${byStatus.Offer || 0}</span>
    </div>
    <div class="stat-card accent-coral">
      <span class="label">Rejected</span>
      <span class="value">${byStatus.Rejected || 0}</span>
    </div>
  `;
}

function renderUpcomingReminders(reminders) {
  const container = document.getElementById('upcomingReminders');
  if (!reminders || reminders.length === 0) {
    container.innerHTML = `<div class="empty-state"><h3>No upcoming reminders</h3><p>Add one from the Reminders page to stay on top of follow-ups.</p></div>`;
    return;
  }
  container.innerHTML = reminders.map(r => `
    <div class="reminder-item">
      <div class="reminder-checkbox"></div>
      <div>
        <div class="reminder-title">${escapeHtml(r.title)}</div>
        <div class="reminder-meta">${r.company_name ? escapeHtml(r.company_name) + ' · ' : ''}${Utils.formatDateTime(r.remind_at)}</div>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
