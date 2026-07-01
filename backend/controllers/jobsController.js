const { sql, getPool } = require('../config/db');

exports.getAllJobs = async (req, res) => {
  try {
    const pool = await getPool();
    const { status, search } = req.query;

    let query = 'SELECT * FROM dbo.Jobs WHERE user_id = @userId';
    const request = pool.request().input('userId', sql.Int, req.user.id);

    if (status && status !== 'All') {
      query += ' AND status = @status';
      request.input('status', sql.NVarChar, status);
    }
    if (search) {
      query += ' AND (company_name LIKE @search OR job_title LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }
    query += ' ORDER BY applied_date DESC, created_at DESC';

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load applications.' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .query('SELECT * FROM dbo.Jobs WHERE id = @id AND user_id = @userId');

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load application.' });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { companyName, jobTitle, jobLocation, jobUrl, salaryMin, salaryMax, status, appliedDate } = req.body;

    if (!companyName || !jobTitle) {
      return res.status(400).json({ message: 'Company name and job title are required.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('companyName', sql.NVarChar, companyName)
      .input('jobTitle', sql.NVarChar, jobTitle)
      .input('jobLocation', sql.NVarChar, jobLocation || null)
      .input('jobUrl', sql.NVarChar, jobUrl || null)
      .input('salaryMin', sql.Decimal(12, 2), salaryMin || null)
      .input('salaryMax', sql.Decimal(12, 2), salaryMax || null)
      .input('status', sql.NVarChar, status || 'Applied')
      .input('appliedDate', sql.Date, appliedDate || new Date())
      .query(`INSERT INTO dbo.Jobs
                (user_id, company_name, job_title, job_location, job_url, salary_min, salary_max, status, applied_date)
              OUTPUT INSERTED.*
              VALUES
                (@userId, @companyName, @jobTitle, @jobLocation, @jobUrl, @salaryMin, @salaryMax, @status, @appliedDate)`);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create application.' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { companyName, jobTitle, jobLocation, jobUrl, salaryMin, salaryMax, status, appliedDate } = req.body;
    const pool = await getPool();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .input('companyName', sql.NVarChar, companyName)
      .input('jobTitle', sql.NVarChar, jobTitle)
      .input('jobLocation', sql.NVarChar, jobLocation || null)
      .input('jobUrl', sql.NVarChar, jobUrl || null)
      .input('salaryMin', sql.Decimal(12, 2), salaryMin || null)
      .input('salaryMax', sql.Decimal(12, 2), salaryMax || null)
      .input('status', sql.NVarChar, status)
      .input('appliedDate', sql.Date, appliedDate)
      .query(`UPDATE dbo.Jobs SET
                company_name = @companyName, job_title = @jobTitle, job_location = @jobLocation,
                job_url = @jobUrl, salary_min = @salaryMin, salary_max = @salaryMax,
                status = @status, applied_date = @appliedDate, updated_at = SYSUTCDATETIME()
              OUTPUT INSERTED.*
              WHERE id = @id AND user_id = @userId`);

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update application.' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .query('DELETE FROM dbo.Jobs OUTPUT DELETED.id WHERE id = @id AND user_id = @userId');

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.json({ message: 'Application deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete application.' });
  }
};
