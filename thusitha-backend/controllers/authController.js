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

    // Check if user still has default password
    let mustChangePassword = false;
    const isDefault = await bcrypt.compare('Thusitha@123', user.password_hash);
    if (isDefault) mustChangePassword = true;

    // 📋 Industrial Standard: Log the successful login
    await auditService.logAction(user.user_id, user.role, 'LOGIN', 'User', user.user_id, `User ${username} logged into the system.`);

    res.json({
      success: true,
      token: token,
      message: 'සාර්ථකව ඇතුළු විය!',
      must_change_password: mustChangePassword,
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

// පද්ධතියෙන් ඉවත් වීම (Logout)
exports.logout = async (req, res) => {
  // Since JWT is stateless, the frontend should remove the token.
  // We just log the action here.
  try {
    const userId = req.user?.userId;
    if (userId) {
      await auditService.logAction(userId, req.user?.role, 'LOGOUT', 'User', userId, 'පරිශීලකයා පද්ධතියෙන් ඉවත් විය.');
    }
    res.json({ success: true, message: 'සාර්ථකව පද්ධතියෙන් ඉවත් විය.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// මුරපදය අමතක වීම (Forgot Password)
exports.forgotPassword = async (req, res) => {
  const { username } = req.body;
  try {
    const result = await db.pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'පරිශීලකයා හමුවුනේ නැත.' });
    
    // In a real app, generate a token, save to DB, and send an email/SMS.
    res.json({ message: 'මුරපදය යළි සැකසීමේ සබැඳිය (Reset Link) ඔබගේ දුරකථනයට හෝ ඊමේල් ලිපිනයට යවන ලදී.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Student පළමු වර පිළිගැනීමේදී මුරපදය වෙනස් කිරීම (Change Password)
exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.userId;
  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'මුරපදය අකුරු 6කට වඩා විය යුතුයි.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await db.pool.query('UPDATE Users SET password_hash = $1 WHERE user_id = $2', [passwordHash, userId]);
    
    await auditService.logAction(userId, req.user.role, 'UPDATE', 'User', userId, 'පරිශීලකයා විසින් මුරපදය වෙනස් කරන ලදී.');
    res.json({ message: 'මුරපදය සාර්ථකව වෙනස් කළා!' });
  } catch (err) {
    console.error('❌ Change Password Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
