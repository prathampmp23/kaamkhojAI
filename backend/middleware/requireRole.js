const requireRole = (...roles) => {
  const normalizedRoles = roles
    .flat()
    .map((r) => String(r).trim().toLowerCase())
    .filter(Boolean);

  return (req, res, next) => {
    const userRole = String(req.user?.role || '').toLowerCase();
    if (!userRole) {
      return res.status(403).json({ success: false, message: 'User role missing' });
    }
    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires role ${normalizedRoles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = requireRole;
