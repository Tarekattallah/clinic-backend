const { registerSchema, loginSchema } = require('../validators/auth.validator');
const authService = require('../services/auth.service');

const registerUser = async (req, res) => {
    try {
        // Validate input
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.details.map(err => err.message)
            });
        }

        const result = await authService.register(value);

        res.status(201).json({
            message: 'User registered successfully',
            user: result
        });
    } catch (error) {
        require('../utils/logger').error('Register error:', error.message);

        if (error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: 'Server error during registration' });
    }
};

const loginUser = async (req, res) => {
    try {
        // Validate input
        const { error, value } = loginSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.details.map(err => err.message)
            });
        }

        const result = await authService.login(value.email, value.password);

        res.status(200).json({
            message: 'Login successful',
            user: result
        });
    } catch (error) {
        require('../utils/logger').error('Login error:', error.message);

        if (error.message.includes('Invalid email or password')) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    loginUser
};