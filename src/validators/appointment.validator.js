const Joi = require('joi');

// FIX: was exported as bookAppointmentSchema but controller imports bookSchema
const bookSchema = Joi.object({
    doctorId: Joi.string().required(),
    dateTime: Joi.date().iso().greater('now').required()
        .messages({
            'date.greater': 'Appointment time must be in the future',
            'any.required': 'Date and time are required'
        }),
    notes: Joi.string().allow('').optional()
});

// FIX: was missing entirely
const rescheduleSchema = Joi.object({
    dateTime: Joi.date().iso().greater('now').required()
        .messages({
            'date.greater': 'New appointment time must be in the future',
            'any.required': 'New date and time are required'
        })
});

module.exports = {
    bookSchema,
    rescheduleSchema,
    // keep old name as alias just in case
    bookAppointmentSchema: bookSchema
};
