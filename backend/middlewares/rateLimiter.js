// Disabled for development
const dummyLimiter = (req, res, next) => next();

exports.globalLimiter = dummyLimiter;
exports.authLimiter = dummyLimiter;
exports.searchLimiter = dummyLimiter;
exports.adminLimiter = dummyLimiter;
