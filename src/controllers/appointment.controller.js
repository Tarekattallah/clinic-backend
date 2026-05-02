const appointmentService = require('../services/appointment.service');
const { bookSchema, rescheduleSchema } = require('../validators/appointment.validator');

const bookAppointment = async (req, res) => {
  try {
    const { error, value } = bookSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: 'Validation error', errors: error.details.map(e => e.message) });
    }

    const appointment = await appointmentService.bookAppointment(
      req.user._id,
      value.doctorId,
      value.dateTime,
      value.notes
    );

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    if (err.message === 'SLOT_TAKEN') {
      return res.status(409).json({
        message: 'This time slot is already booked. Please choose a different time.',
        code: 'SLOT_TAKEN'
      });
    }
    require('../utils/logger').error('Book appointment error:', err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: 'date query param is required (YYYY-MM-DD)' });

    const slots = await appointmentService.getAvailableSlots(doctorId, date);
    res.json({ date, doctorId, availableSlots: slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      appointments = await appointmentService.getPatientAppointments(req.user._id);
    } else if (req.user.role === 'doctor') {
      const DoctorProfile = require('../models/DoctorProfile.model');
      const profile = await DoctorProfile.findOne({ user: req.user._id });
      if (!profile) return res.status(404).json({ message: 'Doctor profile not found' });
      appointments = await appointmentService.getDoctorAppointments(profile._id);
    } else {
      appointments = await appointmentService.getAllAppointments();
    }

    res.json({ count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: 'status is required' });

    const appointment = await appointmentService.updateStatus(id, status, req.user._id, req.user.role);
    res.json({ message: 'Status updated successfully', appointment });
  } catch (err) {
    if (err.message.includes('Cannot change')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { error, value } = rescheduleSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: 'Validation error', errors: error.details.map(e => e.message) });
    }

    const appointment = await appointmentService.rescheduleAppointment(
      req.params.id,
      value.dateTime,
      req.user._id
    );

    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (err) {
    if (err.message === 'SLOT_TAKEN') {
      return res.status(409).json({ message: 'That time slot is already taken.', code: 'SLOT_TAKEN' });
    }
    res.status(500).json({ message: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (err) {
    res.status(err.message === 'Not authorized' ? 403 : 400).json({ message: err.message });
  }
};

module.exports = {
  bookAppointment,
  getAvailableSlots,
  getMyAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment
};
