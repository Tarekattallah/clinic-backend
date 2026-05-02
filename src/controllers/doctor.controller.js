const doctorService = require('../services/doctor.service');
const DoctorProfile = require('../models/DoctorProfile.model');
const fs            = require('fs');
const path          = require('path');

const getAllDoctors = async (req, res) => {
  try {
    const { specialty } = req.query;
    const doctors = await doctorService.getAllDoctors(specialty || null);
    res.json({ count: doctors.length, doctors });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (err) { res.status(404).json({ message: err.message }); }
};

const getMyProfile = async (req, res) => {
  try {
    // FIX: was getDoctorByUserId (doesn't exist) → getDoctorProfileByUser
    const profile = await doctorService.getDoctorProfileByUser(req.user._id);
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json({ profile });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateMyProfile = async (req, res) => {
  try {
    const { bio, phone, experienceYears, specialties } = req.body;

    // FIX: update basic profile fields
    await doctorService.updateDoctorProfile(req.user._id, { bio, phone, experienceYears });

    // FIX: also save specialties if provided in same request
    if (Array.isArray(specialties)) {
      await doctorService.updateDoctorSpecialties(req.user._id, specialties);
    }

    // Return fully populated profile
    const updated = await doctorService.getDoctorProfileByUser(req.user._id);
    res.json({ message: 'Profile updated successfully', profile: updated });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// POST /api/doctors/profile/avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const BASE_URL  = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const avatarUrl = `${BASE_URL}/uploads/avatars/${req.file.filename}`;

    // Delete old avatar file if exists
    const existing = await DoctorProfile.findOne({ user: req.user._id });
    if (existing?.avatarUrl) {
      const oldFilename = existing.avatarUrl.split('/uploads/avatars/')[1];
      if (oldFilename) {
        const oldPath = path.join(__dirname, '../../uploads/avatars', oldFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      { avatarUrl },
      { new: true }
    ).populate('user', 'name email').populate('specialties', 'name');

    if (!profile) return res.status(404).json({ message: 'Doctor profile not found' });

    res.json({ message: 'Avatar uploaded successfully', avatarUrl, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/doctors/profile/avatar
const deleteAvatar = async (req, res) => {
  try {
    const existing = await DoctorProfile.findOne({ user: req.user._id });
    if (existing?.avatarUrl) {
      const oldFilename = existing.avatarUrl.split('/uploads/avatars/')[1];
      if (oldFilename) {
        const oldPath = path.join(__dirname, '../../uploads/avatars', oldFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }
    const profile = await DoctorProfile.findOneAndUpdate(
      { user: req.user._id },
      { avatarUrl: '' },
      { new: true }
    );
    res.json({ message: 'Avatar removed', profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllDoctors, getDoctorById, getMyProfile, updateMyProfile, uploadAvatar, deleteAvatar };
