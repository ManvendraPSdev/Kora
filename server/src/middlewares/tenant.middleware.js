function resolveTenant(req, _res, next) {
  req.tenantId = req.user?.tenantId || null;
  next();
}

module.exports = resolveTenant;
