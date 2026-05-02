const express     = require('express');
const rateLimit   = require('express-rate-limit');
const { registerUser, loginUser } = require('../controllers/auth.controller');

const router = express.Router();

// FIX #14: Brute force protection — max 10 attempts per 15 min per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,
    message: { message: 'Too many attempts, please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, registerUser);
router.post('/login',    authLimiter, loginUser);

module.exports = router;
