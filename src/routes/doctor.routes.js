const express = require('express');
const { getAllDoctors, getDoctorById, getMyProfile, updateMyProfile, uploadAvatar, deleteAvatar } = require('../controllers/doctor.controller');
const { protect }   = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const upload        = require('../middlewares/upload.middleware');

const router = express.Router();

// Public
router.get('/',    getAllDoctors);
router.get('/:id', getDoctorById);

// Doctor only
router.get('/profile/me',    protect, authorize('doctor'), getMyProfile);
router.put('/profile/me',    protect, authorize('doctor'), updateMyProfile);
router.post('/profile/avatar',   protect, authorize('doctor'), upload.single('avatar'), uploadAvatar);
router.delete('/profile/avatar', protect, authorize('doctor'), deleteAvatar);

module.exports = router;
