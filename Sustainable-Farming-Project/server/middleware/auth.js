const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

/**
 * Middleware to verify JWT token and attach user to request
 */
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const farmer = await Farmer.findById(decoded.id);
        if (!farmer) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        req.user = farmer;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

/**
 * Middleware to check if user is admin
 */
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = { auth, adminOnly };
