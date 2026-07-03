/* ============================================================
   4JobTracker — Add / edit application logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  await Utils.requireAuth();
  Utils.setActiveNav('add-job');
  await Utils.fillSidebarUser();
  Utils.bindLogout();

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');
  const form = document.getElementById('jobForm');
  const errorBox = document.getElementById('formError');
  const successBox = document.getElementById('formSuccess');

  if (editId) {
    document.getElementById('pageTitle').textContent = 'Edit application';
    document.getElementById('jobId').value = editId;
    document.getElementById('submitBtn').textContent = 'Save changes';
    try {
      const job = await Api.getJob(editId);
      document.getElementById('companyName').value = job.company_name;
      document.getElementById('jobTitle').value = job.job_title;
      document.getElementById('jobLocation').value = job.job_location || '';
      document.getElementById('status').value = job.status;
      document.getElementById('salaryMin').value = job.salary_min || '';
      document.getElementById('salaryMax').value = job.salary_max || '';
      document.getElementById('appliedDate').value = job.applied_date ? job.applied_date.slice(0, 10) : '';
      document.getElementById('jobUrl').value = job.job_url || '';
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  } else {
    document.getElementById('appliedDate').valueAsDate = new Date();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');
    successBox.classList.remove('visible');

    const payload = {
      companyName: document.getElementById('companyName').value.trim(),
      jobTitle: document.getElementById('jobTitle').value.trim(),
      jobLocation: document.getElementById('jobLocation').value.trim(),
      status: document.getElementById('status').value,
      salaryMin: document.getElementById('salaryMin').value || null,
      salaryMax: document.getElementById('salaryMax').value || null,
      appliedDate: document.getElementById('appliedDate').value || null,
      jobUrl: document.getElementById('jobUrl').value.trim()
    };

    if (!payload.companyName || !payload.jobTitle) {
      errorBox.textContent = 'Company and job title are required.';
      errorBox.classList.add('visible');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;

    try {
      const id = document.getElementById('jobId').value;
      if (id) {
        await Api.updateJob(id, payload);
        successBox.textContent = 'Application updated.';
      } else {
        await Api.createJob(payload);
        successBox.textContent = 'Application added to your trail.';
      }
      successBox.classList.add('visible');
      setTimeout(() => { window.location.href = 'applications.html'; }, 700);
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.add('visible');
      submitBtn.disabled = false;
    }
  });
});
