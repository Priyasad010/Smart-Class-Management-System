const jwt = require('jsonwebtoken');

/**
 * Middleware to verify the JWT token sent in the request header.
 */
exports.verifyToken = (req, res, next) => {
  // 🛡️ Look for token in Cookies first, then fall back to Header
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(403).json({ message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token.' });
    req.user = {
      userId: decoded.id,
      role: decoded.role,
      username: decoded.username
    };
    next();
  });
};

/**
 * Middleware factory to check if the logged-in user has the required roles.
 */
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `ප්‍රවේශය තහනම්: මෙම ක්‍රියාව සඳහා ${roles.join(' හෝ ')} අවසරය අවශ්‍ය වේ.` 
      });
    }
    next();
  };
};