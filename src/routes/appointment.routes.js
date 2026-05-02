const express = require('express');
const {
  bookAppointment,
  getAvailableSlots,
  getMyAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment
} = require('../controllers/appointment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// All routes need auth
router.use(protect);

// Get current user appointments (role-based inside controller)
router.get('/', getMyAppointments);

// Available slots for a doctor
router.get('/doctor/:doctorId/available', getAvailableSlots);

// Book a new appointment (patients only)
router.post('/', authorize('patient'), bookAppointment);

// Update status (doctor or admin)
router.patch('/:id/status', authorize('doctor', 'admin'), updateAppointmentStatus);

// Reschedule (patient only)
router.put('/:id/reschedule', authorize('patient'), rescheduleAppointment);

// Cancel (patient, doctor, admin)
router.delete('/:id', cancelAppointment);

module.exports = router;
