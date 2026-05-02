const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const User        = require('../models/User.model');
const DoctorProfile = require('../models/DoctorProfile.model');

const register = async (userData) => {
    const { name, email, password, role } = userData;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) throw new Error('User with this email already exists');

    const salt           = await bcrypt.genSalt(12); // increased from 10 to 12
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role
    });

    if (role === 'doctor') {
        await DoctorProfile.create({
            user: user._id, bio:'', phone:'', experienceYears:0, specialties:[]
        });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { _id: user._id, name: user.name, email: user.email, role: user.role, token };
};

const login = async (email, password) => {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Use constant-time comparison to prevent timing attacks
    // Always call bcrypt.compare even if user not found (prevents user enumeration)
    const dummyHash = '$2a$12$invalidhashforcomparisonpurposes.invalid';
    const isMatch = user
        ? await bcrypt.compare(password, user.password)
        : await bcrypt.compare(password, dummyHash);

    if (!user || !isMatch) throw new Error('Invalid email or password');

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return { _id: user._id, name: user.name, email: user.email, role: user.role, token };
};

module.exports = { register, login };
