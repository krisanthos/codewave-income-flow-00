
const adminAuth = function(req, res, next) {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

export default adminAuth;
