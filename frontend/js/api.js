/* ============================================================
   4JobTracker — Data layer (Supabase-backed)
   Same method names as before so dashboard.js, applications.js,
   etc. don't need to change — only the internals moved from
   fetch() calls to the Express API, to supabase-js calls.
   ============================================================ */

const Api = {
  async getSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  },

  async getUser() {
    const session = await this.getSession();
    if (!session) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.user_metadata?.full_name || session.user.email
    };
  },

  async signOut() {
    await supabaseClient.auth.signOut();
  },

  // ------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------
  async register({ fullName, email, password }) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw new Error(error.message);
    return { user: { id: data.user.id, email: data.user.email, fullName } };
  },

  async login({ email, password }) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Invalid email or password.');
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || data.user.email
      }
    };
  },

  async getProfile() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data.user) throw new Error('Could not load profile.');
    return {
      full_name: data.user.user_metadata?.full_name || '',
      email: data.user.email,
      created_at: data.user.created_at
    };
  },

  async updateProfile({ fullName, password }) {
    const payload = { data: { full_name: fullName } };
    if (password) payload.password = password;
    const { error } = await supabaseClient.auth.updateUser(payload);
    if (error) throw new Error(error.message);
    return { message: 'Profile updated successfully.' };
  },

  // ------------------------------------------------------------
  // Jobs
  // ------------------------------------------------------------
  async getJobs({ status, search } = {}) {
    const user = await this.getUser();
    if (!user) throw new Error('Not logged in.');

    let query = supabaseClient.from('jobs').select('*').eq('user_id', user.id);
    if (status && status !== 'All') query = query.eq('status', status);
    if (search) query = query.or(`company_name.ilike.%${search}%,job_title.ilike.%${search}%`);
    query = query.order('applied_date', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  async getJob(id) {
    const { data, error } = await supabaseClient.from('jobs').select('*').eq('id', id).single();
    if (error) throw new Error('Application not found.');
    return data;
  },

  async createJob(payload) {
    const user = await this.getUser();
    if (!user) throw new Error('Not logged in.');

    const row = {
      user_id: user.id,
      company_name: payload.companyName,
      job_title: payload.jobTitle,
      job_location: payload.jobLocation || null,
      job_url: payload.jobUrl || null,
      salary_min: payload.salaryMin || null,
      salary_max: payload.salaryMax || null,
      status: payload.status || 'Applied',
      applied_date: payload.appliedDate || new Date().toISOString().slice(0, 10)
    };
    const { data, error } = await supabaseClient.from('jobs').insert(row).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateJob(id, payload) {
    const row = {
      company_name: payload.companyName,
      job_title: payload.jobTitle,
      job_location: payload.jobLocation || null,
      job_url: payload.jobUrl || null,
      salary_min: payload.salaryMin || null,
      salary_max: payload.salaryMax || null,
      status: payload.status,
      applied_date: payload.appliedDate
    };
    const { data, error } = await supabaseClient.from('jobs').update(row).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteJob(id) {
    const { error } = await supabaseClient.from('jobs').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Application deleted.' };
  },

  // ------------------------------------------------------------
  // Stats — computed client-side from the user's jobs/reminders
  // ------------------------------------------------------------
  async getStats() {
    const user = await this.getUser();
    if (!user) throw new Error('Not logged in.');

    const { data: jobs, error: jobsErr } = await supabaseClient
      .from('jobs').select('status, applied_date').eq('user_id', user.id);
    if (jobsErr) throw new Error(jobsErr.message);

    const byStatusMap = {};
    const byMonthMap = {};
    jobs.forEach(j => {
      byStatusMap[j.status] = (byStatusMap[j.status] || 0) + 1;
      const month = (j.applied_date || '').slice(0, 7); // yyyy-MM
      if (month) byMonthMap[month] = (byMonthMap[month] || 0) + 1;
    });

    const byStatus = Object.entries(byStatusMap).map(([status, count]) => ({ status, count }));
    const byMonth = Object.entries(byMonthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));

    const { data: upcomingReminders, error: remErr } = await supabaseClient
      .from('reminders')
      .select('id, title, remind_at, jobs(company_name, job_title)')
      .eq('user_id', user.id)
      .eq('is_done', false)
      .order('remind_at', { ascending: true })
      .limit(5);
    if (remErr) throw new Error(remErr.message);

    return {
      total: jobs.length,
      byStatus,
      byMonth,
      upcomingReminders: (upcomingReminders || []).map(r => ({
        id: r.id,
        title: r.title,
        remind_at: r.remind_at,
        company_name: r.jobs?.company_name || null,
        job_title: r.jobs?.job_title || null
      }))
    };
  },

  // ------------------------------------------------------------
  // Reminders
  // ------------------------------------------------------------
  async getReminders() {
    const user = await this.getUser();
    if (!user) throw new Error('Not logged in.');

    const { data, error } = await supabaseClient
      .from('reminders')
      .select('*, jobs(company_name, job_title)')
      .eq('user_id', user.id)
      .order('is_done', { ascending: true })
      .order('remind_at', { ascending: true });
    if (error) throw new Error(error.message);

    return data.map(r => ({
      ...r,
      company_name: r.jobs?.company_name || null,
      job_title: r.jobs?.job_title || null
    }));
  },

  async createReminder({ jobId, title, remindAt }) {
    const user = await this.getUser();
    if (!user) throw new Error('Not logged in.');

    const { data, error } = await supabaseClient
      .from('reminders')
      .insert({ user_id: user.id, job_id: jobId || null, title, remind_at: remindAt })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateReminder(id, { title, remindAt, isDone }) {
    const { data, error } = await supabaseClient
      .from('reminders')
      .update({ title, remind_at: remindAt, is_done: !!isDone })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteReminder(id) {
    const { error } = await supabaseClient.from('reminders').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Reminder deleted.' };
  },

  // ------------------------------------------------------------
  // Notes
  // ------------------------------------------------------------
  async getNotesForJob(jobId) {
    const { data, error } = await supabaseClient
      .from('notes')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async createNote({ jobId, content }) {
    const user = await this.getUser();
    if (!user) throw new Error('Not logged in.');

    const { data, error } = await supabaseClient
      .from('notes')
      .insert({ job_id: jobId, user_id: user.id, content })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteNote(id) {
    const { error } = await supabaseClient.from('notes').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Note deleted.' };
  }
};
