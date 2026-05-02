const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(3).trim().required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 3 characters'
        }),

    email: Joi.string().email().trim().lowercase().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        }),

    password: Joi.string().min(6).required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required'
        }),

    // admin مسموح هنا لأن الفرونت بيحمي التسجيل بـ secret code
    role: Joi.string().valid('patient', 'doctor', 'admin').default('patient')
});

const loginSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        }),

    password: Joi.string().min(6).required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required'
        })
});

module.exports = {
    registerSchema,
    loginSchema
};
