const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // NEW: icon emoji for frontend display — FIX #9 (was always 🏥)
    icon: {
        type: String,
        default: '🏥',
        trim: true
    }
}, {
    timestamps: true
});

const Specialty = mongoose.model('Specialty', specialtySchema);

module.exports = Specialty;
