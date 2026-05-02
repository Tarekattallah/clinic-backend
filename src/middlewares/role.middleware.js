const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Please login first' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Only ${roles.join(' or ')} can access this route.`
            });
        }

        next();
    };
};

module.exports = { authorize };