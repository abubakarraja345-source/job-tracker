const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, getPool } = require('../config/db');
require('dotenv').config();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, fullName: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const pool = await getPool();

    const existing = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .query('SELECT id FROM dbo.Users WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('fullName', sql.NVarChar, fullName.trim())
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .input('passwordHash', sql.NVarChar, passwordHash)
      .query(`INSERT INTO dbo.Users (full_name, email, password_hash)
              OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.email
              VALUES (@fullName, @email, @passwordHash)`);

    const user = result.recordset[0];
    const token = signToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while creating your account.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase().trim())
      .query('SELECT * FROM dbo.Users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while logging in.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, full_name, email, created_at FROM dbo.Users WHERE id = @id');

    if (!result.recordset[0]) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, password } = req.body;
    const pool = await getPool();

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.request()
        .input('id', sql.Int, req.user.id)
        .input('fullName', sql.NVarChar, fullName)
        .input('passwordHash', sql.NVarChar, passwordHash)
        .query(`UPDATE dbo.Users SET full_name = @fullName, password_hash = @passwordHash WHERE id = @id`);
    } else {
      await pool.request()
        .input('id', sql.Int, req.user.id)
        .input('fullName', sql.NVarChar, fullName)
        .query(`UPDATE dbo.Users SET full_name = @fullName WHERE id = @id`);
    }

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update profile.' });
  }
};
