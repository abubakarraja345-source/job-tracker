/* ============================================================
   4JobTracker — Reminders page logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  await Utils.requireAuth();
  Utils.setActiveNav('reminders');
  await Utils.fillSidebarUser();
  Utils.bindLogout();

  loadReminders();

  document.getElementById('reminderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const remindAt = document.getElementById('remindAt').value;
    if (!title || !remindAt) return;

    try {
      await Api.createReminder({ title, remindAt });
      document.getElementById('reminderForm').reset();
      Utils.showToast('Reminder added.', 'success');
      loadReminders();
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });
});

async function loadReminders() {
  const list = document.getElementById('remindersList');
  try {
    const reminders = await Api.getReminders();
    if (reminders.length === 0) {
      list.innerHTML = `<div class="empty-state"><h3>No reminders yet</h3><p>Add one above to keep your follow-ups on track.</p></div>`;
      return;
    }
    list.innerHTML = reminders.map(r => `
      <div class="reminder-item ${r.is_done ? 'done' : ''}" data-id="${r.id}">
        <div class="reminder-checkbox ${r.is_done ? 'checked' : ''}" onclick="toggleDone(${r.id}, ${!r.is_done}, '${escapeAttr(r.title)}', '${r.remind_at}')">${r.is_done ? '✓' : ''}</div>
        <div style="flex:1;">
          <div class="reminder-title">${escapeHtml(r.title)}</div>
          <div class="reminder-meta">${r.company_name ? escapeHtml(r.company_name) + ' · ' : ''}${Utils.formatDateTime(r.remind_at)}</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="deleteReminder(${r.id})">Delete</button>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="muted">Could not load reminders.</p>`;
    Utils.showToast(err.message, 'error');
  }
}

async function toggleDone(id, isDone, title, remindAt) {
  try {
    await Api.updateReminder(id, { title, remindAt, isDone });
    loadReminders();
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }
}

async function deleteReminder(id) {
  try {
    await Api.deleteReminder(id);
    Utils.showToast('Reminder deleted.', 'success');
    loadReminders();
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
function escapeAttr(str) {
  return (str || '').replace(/'/g, "\\'");
}
