const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware.
 * Reads the HttpOnly cookie named "token", verifies it,
 * and attaches req.user = { user_id, username, avatar } on success.
 * Returns 401 if no cookie present or if the JWT is invalid/expired.
 */
function protect(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      user_id: decoded.user_id,
      username: decoded.username,
      avatar: decoded.avatar,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = protect;
