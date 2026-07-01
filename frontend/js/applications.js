/* ============================================================
   Job-Tracker — Applications list logic
   ============================================================ */

let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  Utils.requireAuth();
  Utils.setActiveNav('applications');
  Utils.fillSidebarUser();
  Utils.bindLogout();

  loadJobs();

  document.getElementById('searchInput').addEventListener('input', Utils.debounce(loadJobs, 350));
  document.getElementById('statusFilter').addEventListener('change', loadJobs);

  document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDelete').addEventListener('click', doDelete);
});

async function loadJobs() {
  const tbody = document.getElementById('jobsTableBody');
  const search = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('statusFilter').value;

  try {
    const jobs = await Api.getJobs({ search, status });
    if (jobs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">
        <div class="empty-state">
          <h3>No applications yet</h3>
          <p>Add your first application to start building your trail.</p>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = jobs.map(job => `
      <tr onclick="goToDetail(${job.id})">
        <td class="company">${escapeHtml(job.company_name)}</td>
        <td class="role">${escapeHtml(job.job_title)}</td>
        <td><span class="badge ${Utils.badgeClass(job.status)}">${job.status}</span></td>
        <td>${Utils.formatDate(job.applied_date)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); window.location.href='job-detail.html?id=${job.id}'">View</button>
            <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); openDeleteModal(${job.id})">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted">Could not load applications.</td></tr>`;
    Utils.showToast(err.message, 'error');
  }
}

function goToDetail(id) {
  window.location.href = `job-detail.html?id=${id}`;
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  document.getElementById('deleteModal').classList.add('open');
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('deleteModal').classList.remove('open');
}
async function doDelete() {
  if (!pendingDeleteId) return;
  try {
    await Api.deleteJob(pendingDeleteId);
    Utils.showToast('Application deleted.', 'success');
    closeDeleteModal();
    loadJobs();
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
