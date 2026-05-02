const Specialty = require('../models/Specialty.model');

const ICON_MAP = {
    cardiology: '❤️', neurology: '🧠', orthopedics: '🦴', ophthalmology: '👁️',
    dental: '🦷', pediatrics: '👶', dermatology: '🧴', oncology: '🎗️',
    radiology: '🔬', psychiatry: '🧘', gynecology: '👩‍⚕️', urology: '🩺',
    endocrinology: '⚗️', gastroenterology: '💊', pulmonology: '🫁',
    nephrology: '🫘', rheumatology: '🦾', surgery: '🔪', anesthesiology: '💉',
};

const guessIcon = (name) => {
    const key = name.toLowerCase().trim();
    for (const [k, v] of Object.entries(ICON_MAP)) {
        if (key.includes(k)) return v;
    }
    return '🏥';
};

const createSpecialty = async (req, res) => {
    try {
        const { name, icon } = req.body;
        const specialty = await Specialty.create({
            name,
            icon: icon || guessIcon(name)   // auto-assign icon if not provided
        });
        res.status(201).json({ message: 'Specialty created successfully', specialty });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Specialty with this name already exists' });
        }
        require('../utils/logger').error('Create specialty error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllSpecialties = async (req, res) => {
    try {
        const specialties = await Specialty.find().sort({ name: 1 });
        res.json(specialties);
    } catch (error) {
        require('../utils/logger').error('Get specialties error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSpecialty = async (req, res) => {
    try {
        const specialty = await Specialty.findByIdAndDelete(req.params.id);
        if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
        res.json({ message: 'Specialty deleted successfully' });
    } catch (error) {
        require('../utils/logger').error('Delete specialty error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createSpecialty, getAllSpecialties, deleteSpecialty };
