const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auditService = require('../utils/auditService');

// පරිශීලක ඇතුළත් වීම (Login)
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'පරිශීලකයා හමුවුනේ නැත.' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'මුරපදය වැරදියි.' });

    const token = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 📋 Industrial Standard: Log the successful login
    await auditService.logAction(user.user_id, user.role, 'LOGIN', 'User', user.user_id, `User ${username} logged into the system.`);

    res.json({
      success: true,
      token: token, // Return the JWT token in the response body
      message: 'සාර්ථකව ඇතුළු විය!',
      user: { id: user.user_id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ලියාපදිංචිය සඳහා Placeholder
exports.register = async (req, res) => {
  res.status(501).json({ message: "පරිශීලක ලියාපදිංචිය අදාළ අංශය මගින් සිදු කළ යුතුය." });
};

// මුරපදය වෙනස් කිරීම (Reset Password)
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.userId;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.pool.query('UPDATE Users SET password_hash = $1 WHERE user_id = $2', [passwordHash, userId]);
    
    await auditService.logAction(userId, req.user.role, 'UPDATE', 'User', userId, 'පරිශීලකයා විසින් මුරපදය වෙනස් කරන ලදී.');
    res.json({ message: 'මුරපදය සාර්ථකව වෙනස් කළා!' });
  } catch (err) {
    console.error('❌ Reset Password Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
