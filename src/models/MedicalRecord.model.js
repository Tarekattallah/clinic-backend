const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        unique: true  // FIX: منع إضافة أكتر من record لنفس الـ appointment
    },
    diagnosis: {
        type: String,
        trim: true
    },
    prescription: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
