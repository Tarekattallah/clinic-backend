const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio:             { type: String, trim: true, maxlength: 1000 },
  phone:           { type: String, trim: true },
  experienceYears: { type: Number, min: 0, default: 0 },
  specialties:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }],
  avatarUrl:       { type: String, default: '' },
}, { timestamps: true });

doctorProfileSchema.index({ user: 1 });           // fast profile lookup
doctorProfileSchema.index({ specialties: 1 });    // filter by specialty

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
