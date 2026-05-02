const adminService       = require('../services/admin.service');
const appointmentService = require('../services/appointment.service');

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.json({ count: appointments.length, appointments });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ count: users.length, users });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getReports = async (req, res) => {
  try {
    const report = await adminService.getReports();
    res.json({ report });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const result = await adminService.deleteUser(req.params.id);
    res.json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const User = require('../models/User.model');
    const DoctorProfile = require('../models/DoctorProfile.model');
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (role === 'doctor') {
      const exists = await DoctorProfile.findOne({ user: user._id });
      if (!exists) await DoctorProfile.create({ user: user._id, bio: '', phone: '', experienceYears: 0, specialties: [] });
    }
    res.json({ message: 'Role updated', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /admin/users — create a user directly (admin only)
const createUser = async (req, res) => {
  try {
    const authService = require('../services/auth.service');
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const result = await authService.register({ name, email, password, role: role || 'patient' });
    res.status(201).json({ message: 'User created successfully', user: result });
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// PATCH /admin/users/:id — update name, email, role
const updateUser = async (req, res) => {
  try {
    const User = require('../models/User.model');
    const DoctorProfile = require('../models/DoctorProfile.model');
    const { name, email, role } = req.body;

    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'User not found' });

    // Check email uniqueness if changed
    if (email && email !== existing.email) {
      const taken = await User.findOne({ email });
      if (taken) return res.status(409).json({ message: 'Email already in use' });
    }

    const updates = {};
    if (name)  updates.name  = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (role && ['patient','doctor','admin'].includes(role)) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');

    // Auto-create DoctorProfile if promoted to doctor
    if (updates.role === 'doctor') {
      const exists = await DoctorProfile.findOne({ user: user._id });
      if (!exists) await DoctorProfile.create({ user: user._id, bio: '', phone: '', experienceYears: 0, specialties: [] });
    }

    res.json({ message: 'User updated', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllAppointments, getAllUsers, getReports, deleteUser, updateUserRole, createUser, updateUser };
