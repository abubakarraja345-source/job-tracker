const { sql, getPool } = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user.id;

    const byStatus = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT status, COUNT(*) AS count FROM dbo.Jobs
              WHERE user_id = @userId GROUP BY status`);

    const totals = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT COUNT(*) AS total FROM dbo.Jobs WHERE user_id = @userId`);

    const byMonth = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT FORMAT(applied_date, 'yyyy-MM') AS month, COUNT(*) AS count
              FROM dbo.Jobs WHERE user_id = @userId
              GROUP BY FORMAT(applied_date, 'yyyy-MM')
              ORDER BY month`);

    const upcomingReminders = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT TOP 5 r.id, r.title, r.remind_at, j.company_name, j.job_title
              FROM dbo.Reminders r
              LEFT JOIN dbo.Jobs j ON j.id = r.job_id
              WHERE r.user_id = @userId AND r.is_done = 0
              ORDER BY r.remind_at ASC`);

    res.json({
      total: totals.recordset[0].total,
      byStatus: byStatus.recordset,
      byMonth: byMonth.recordset,
      upcomingReminders: upcomingReminders.recordset
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load statistics.' });
  }
};
