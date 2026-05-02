const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User',          required: true },
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true },
  dateTime:{ type: Date,   required: true },
  status:  { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
  notes:   { type: String, trim: true, maxlength: 1000 },
}, { timestamps: true });

// Performance indexes
appointmentSchema.index({ patient: 1, status: 1 });
appointmentSchema.index({ doctor: 1,  status: 1 });
appointmentSchema.index({ doctor: 1,  dateTime: 1 });   // for slot checking
appointmentSchema.index({ dateTime: 1 });                // for admin reports

module.exports = mongoose.model('Appointment', appointmentSchema);
