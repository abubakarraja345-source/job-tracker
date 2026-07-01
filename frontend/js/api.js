/* ============================================================
   Job-Tracker — API helper
   Centralises all fetch calls to the backend Express API.
   ============================================================ */

const API_BASE_URL = 'http://localhost:5000/api';

const Api = {
  getToken() {
    return localStorage.getItem('jt_token');
  },

  setSession(token, user) {
    localStorage.setItem('jt_token', token);
    localStorage.setItem('jt_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('jt_token');
    localStorage.removeItem('jt_user');
  },

  getUser() {
    const raw = localStorage.getItem('jt_user');
    return raw ? JSON.parse(raw) : null;
  },

  async request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = this.getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (err) {
      throw new Error('Could not reach the server. Is the backend running?');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && auth) {
        this.clearSession();
        window.location.href = 'login.html';
      }
      throw new Error(data.message || 'Something went wrong.');
    }
    return data;
  },

  // Auth
  register(payload) { return this.request('/auth/register', { method: 'POST', body: payload, auth: false }); },
  login(payload) { return this.request('/auth/login', { method: 'POST', body: payload, auth: false }); },
  getProfile() { return this.request('/auth/profile'); },
  updateProfile(payload) { return this.request('/auth/profile', { method: 'PUT', body: payload }); },

  // Jobs
  getJobs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/jobs${qs ? `?${qs}` : ''}`);
  },
  getJob(id) { return this.request(`/jobs/${id}`); },
  createJob(payload) { return this.request('/jobs', { method: 'POST', body: payload }); },
  updateJob(id, payload) { return this.request(`/jobs/${id}`, { method: 'PUT', body: payload }); },
  deleteJob(id) { return this.request(`/jobs/${id}`, { method: 'DELETE' }); },

  // Stats
  getStats() { return this.request('/stats'); },

  // Reminders
  getReminders() { return this.request('/reminders'); },
  createReminder(payload) { return this.request('/reminders', { method: 'POST', body: payload }); },
  updateReminder(id, payload) { return this.request(`/reminders/${id}`, { method: 'PUT', body: payload }); },
  deleteReminder(id) { return this.request(`/reminders/${id}`, { method: 'DELETE' }); },

  // Notes
  getNotesForJob(jobId) { return this.request(`/notes/job/${jobId}`); },
  createNote(payload) { return this.request('/notes', { method: 'POST', body: payload }); },
  deleteNote(id) { return this.request(`/notes/${id}`, { method: 'DELETE' }); }
};
