const { sql, getPool } = require('../config/db');

exports.getNotesForJob = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('jobId', sql.Int, req.params.jobId)
      .input('userId', sql.Int, req.user.id)
      .query(`SELECT * FROM dbo.Notes WHERE job_id = @jobId AND user_id = @userId ORDER BY created_at DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load notes.' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { jobId, content } = req.body;
    if (!jobId || !content) {
      return res.status(400).json({ message: 'Job and note content are required.' });
    }
    const pool = await getPool();
    const result = await pool.request()
      .input('jobId', sql.Int, jobId)
      .input('userId', sql.Int, req.user.id)
      .input('content', sql.NVarChar, content)
      .query(`INSERT INTO dbo.Notes (job_id, user_id, content)
              OUTPUT INSERTED.*
              VALUES (@jobId, @userId, @content)`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not add note.' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('userId', sql.Int, req.user.id)
      .query('DELETE FROM dbo.Notes OUTPUT DELETED.id WHERE id = @id AND user_id = @userId');
    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete note.' });
  }
};
