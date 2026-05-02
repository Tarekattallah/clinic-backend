const User = require('../models/User.model');
const DoctorProfile = require('../models/DoctorProfile.model');

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = null;
    if (user.role === 'doctor') {
      profile = await DoctorProfile.findOne({ user: user._id }).populate('specialties', 'name');
    }

    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMe };
