// middleware/roleAuth.js
// Enforce specific roles on admin-level routes
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient role.' });
  }
  next();
};

module.exports = requireRole;
