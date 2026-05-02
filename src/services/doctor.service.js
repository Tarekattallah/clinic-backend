const DoctorProfile = require('../models/DoctorProfile.model');
const Specialty     = require('../models/Specialty.model');

const getAllDoctors = async () => {
    return DoctorProfile.find()
        .populate('user', 'name email')
        .populate('specialties', 'name');
};

// NEW: efficient single doctor lookup
const getDoctorById = async (id) => {
    return DoctorProfile.findById(id)
        .populate('user', 'name email')
        .populate('specialties', 'name');
};

// NEW: get logged-in doctor's own profile without loading all doctors
const getDoctorProfileByUser = async (userId) => {
    return DoctorProfile.findOne({ user: userId })
        .populate('user', 'name email')
        .populate('specialties', 'name');
};

const updateDoctorProfile = async (userId, profileData) => {
    // Sanitize: only allow specific fields
    const { bio, phone, experienceYears } = profileData;
    const update = {};
    if (bio           !== undefined) update.bio            = bio;
    if (phone         !== undefined) update.phone          = phone;
    if (experienceYears !== undefined) update.experienceYears = Number(experienceYears) || 0; // FIX: parse as number

    const profile = await DoctorProfile.findOneAndUpdate(
        { user: userId },
        update,
        { new: true, runValidators: true }
    );
    if (!profile) throw new Error('Profile not found');
    return profile;
};

const updateDoctorSpecialties = async (userId, specialtyIds) => {
    // FIX: only validate if non-empty array provided
    if (Array.isArray(specialtyIds) && specialtyIds.length > 0) {
        const found = await Specialty.find({ _id: { $in: specialtyIds } });
        if (found.length !== specialtyIds.length) {
            // Don't throw - just save valid ones
            const validIds = found.map(s => s._id.toString());
            specialtyIds = specialtyIds.filter(id => validIds.includes(id.toString()));
        }
    }

    const profile = await DoctorProfile.findOneAndUpdate(
        { user: userId },
        { specialties: specialtyIds || [] },
        { new: true, runValidators: true }
    ).populate('specialties', 'name');

    if (!profile) throw new Error('Profile not found');
    return profile;
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    getDoctorProfileByUser,
    updateDoctorProfile,
    updateDoctorSpecialties,
};
