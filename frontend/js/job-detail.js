/* ============================================================
   4JobTracker — Application detail page logic
   ============================================================ */

let currentJobId = null;
let currentJob = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Utils.requireAuth();
  Utils.setActiveNav('applications');
  await Utils.fillSidebarUser();
  Utils.bindLogout();

  const params = new URLSearchParams(window.location.search);
  currentJobId = params.get('id');
  if (!currentJobId) {
    window.location.href = 'applications.html';
    return;
  }

  loadJob();
  loadNotes();

  document.getElementById('editBtn').addEventListener('click', () => {
    window.location.href = `add-job.html?id=${currentJobId}`;
  });
  document.getElementById('deleteBtn').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.add('open');
  });
  document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.remove('open');
  });
  document.getElementById('confirmDelete').addEventListener('click', async () => {
    try {
      await Api.deleteJob(currentJobId);
      window.location.href = 'applications.html';
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });

  document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('noteContent').value.trim();
    if (!content) return;
    try {
      await Api.createNote({ jobId: currentJobId, content });
      document.getElementById('noteContent').value = '';
      loadNotes();
      Utils.showToast('Note added.', 'success');
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });

  document.getElementById('reminderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('reminderTitle').value.trim();
    const remindAt = document.getElementById('reminderAt').value;
    if (!title || !remindAt) return;
    try {
      await Api.createReminder({ jobId: currentJobId, title, remindAt });
      document.getElementById('reminderForm').reset();
      Utils.showToast('Reminder set.', 'success');
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });
});

async function loadJob() {
  try {
    currentJob = await Api.getJob(currentJobId);
    document.getElementById('jobCompanyEyebrow').textContent = currentJob.company_name;
    document.getElementById('jobTitleHeading').textContent = currentJob.job_title;
    document.getElementById('detailLocation').textContent = currentJob.job_location || '—';
    document.getElementById('detailSalary').textContent = Utils.formatSalary(currentJob.salary_min, currentJob.salary_max);
    document.getElementById('detailAppliedDate').textContent = Utils.formatDate(currentJob.applied_date);
    document.getElementById('detailUrl').innerHTML = currentJob.job_url
      ? `<a href="${currentJob.job_url}" target="_blank" rel="noopener">View posting →</a>` : '—';
    document.getElementById('detailStatus').innerHTML = `<span class="badge ${Utils.badgeClass(currentJob.status)}">${currentJob.status}</span>`;
    renderStepper(currentJob.status);
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }
}

function renderStepper(status) {
  const stepper = document.getElementById('stepper');

  if (status === 'Rejected' || status === 'Withdrawn') {
    stepper.innerHTML = `
      <div class="step done"><div class="step-dot">✓</div></div>
      <div class="step-line"></div>
      <div class="step current"><div class="step-dot">✕</div></div>
    `;
    return;
  }

  const stages = ['Applied', 'Interviewing', 'Offer'];
  const currentIndex = stages.indexOf(status);

  stepper.innerHTML = stages.map((stage, i) => {
    const done = i < currentIndex;
    const current = i === currentIndex;
    const dotContent = done ? '✓' : (i + 1);
    const cls = done ? 'done' : (current ? 'current' : '');
    const line = i < stages.length - 1 ? '<div class="step-line"></div>' : '';
    return `<div class="step ${cls}"><div class="step-dot">${dotContent}</div></div>${line}`;
  }).join('');
}

async function loadNotes() {
  const list = document.getElementById('notesList');
  try {
    const notes = await Api.getNotesForJob(currentJobId);
    if (notes.length === 0) {
      list.innerHTML = `<p class="muted">No notes yet. Log details from calls and interviews here.</p>`;
      return;
    }
    list.innerHTML = notes.map(n => `
      <div class="note-item">
        <div class="note-meta">${Utils.formatDateTime(n.created_at)}</div>
        <p style="margin:0;">${escapeHtml(n.content)}</p>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = `<p class="muted">Could not load notes.</p>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
