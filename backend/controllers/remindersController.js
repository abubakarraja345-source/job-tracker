const { sql, getPool } = require('../config/db');

exports.getAllReminders = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query(`SELECT r.*, j.company_name, j.job_title
              FROM dbo.Reminders r
              LEFT JOIN dbo.Jobs j ON j.id = r.job_id
              WHERE r.user_id = @userId
              ORDER BY r.is_done ASC, r.remind_at ASC`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load reminders.' });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const { jobId, title, remindAt } = req.body;
    if (!title || !remindAt) {
      return res.status(400).json({ message: 'Title and reminder date/time are required.' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('jobId', sql.Int, jobId || null)
      .input('title', sql.NVarChar, title)
      .input('remindAt', sql.DateTime2, remindAt)
      .query(`INSERT INTO dbo.Reminders (user_id, job_id, title, remind_at)
              OUTPUT INSERTED.*
              VALUES (@userId, @jobId, @title, @remindAt)`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create reminder.' });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const { title, remindAt, isDone } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .input('title', sql.NVarChar, title)
      .input('remindAt', sql.DateTime2, remindAt)
      .input('isDone', sql.Bit, isDone ? 1 : 0)
      .query(`UPDATE dbo.Reminders SET title = @title, remind_at = @remindAt, is_done = @isDone
              OUTPUT INSERTED.*
              WHERE id = @id AND user_id = @userId`);
    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update reminder.' });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .query('DELETE FROM dbo.Reminders OUTPUT DELETED.id WHERE id = @id AND user_id = @userId');
    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Reminder not found.' });
    }
    res.json({ message: 'Reminder deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete reminder.' });
  }
};
