const Appointment = require('../models/Appointment.model');
const DoctorProfile = require('../models/DoctorProfile.model');

// Check if a 30-min slot is already taken
const isSlotTaken = async (doctorId, dateTime) => {
  const start = new Date(dateTime);
  const end = new Date(dateTime);
  end.setMinutes(end.getMinutes() + 30);

  const conflict = await Appointment.findOne({
    doctor: doctorId,
    status: { $in: ['pending', 'confirmed'] },
    dateTime: { $gte: start, $lt: end }
  });

  return !!conflict;
};

// Return free 30-min slots for a doctor on a given date (9am-5pm)
const getAvailableSlots = async (doctorId, date) => {
  const day = new Date(date);
  const startOfDay = new Date(day);
  startOfDay.setHours(9, 0, 0, 0);
  const endOfDay = new Date(day);
  endOfDay.setHours(17, 0, 0, 0);

  const booked = await Appointment.find({
    doctor: doctorId,
    status: { $in: ['pending', 'confirmed'] },
    dateTime: { $gte: startOfDay, $lte: endOfDay }
  }).select('dateTime');

  const bookedTimes = booked.map(a => new Date(a.dateTime).getTime());

  const slots = [];
  const current = new Date(startOfDay);
  while (current < endOfDay) {
    if (!bookedTimes.includes(current.getTime())) {
      slots.push(new Date(current).toISOString());
    }
    current.setMinutes(current.getMinutes() + 30);
  }
  return slots;
};

const bookAppointment = async (patientId, doctorId, dateTime, notes) => {
  const doctor = await DoctorProfile.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');

  const taken = await isSlotTaken(doctorId, dateTime);
  if (taken) throw new Error('SLOT_TAKEN');

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    dateTime: new Date(dateTime),
    notes: notes || '',
    status: 'pending'
  });

  await appointment.populate('patient', 'name email');
  return appointment;
};

const getPatientAppointments = async (patientId) => {
  return await Appointment.find({ patient: patientId })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
    .sort({ dateTime: -1 });
};

const getDoctorAppointments = async (doctorProfileId) => {
  return await Appointment.find({ doctor: doctorProfileId })
    .populate('patient', 'name email')
    .sort({ dateTime: 1 });
};

const getAllAppointments = async () => {
  return await Appointment.find()
    .populate('patient', 'name email')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
    .sort({ dateTime: -1 });
};

const updateStatus = async (appointmentId, newStatus, requesterId, requesterRole) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');

  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[appointment.status].includes(newStatus)) {
    throw new Error(`Cannot change from ${appointment.status} to ${newStatus}`);
  }

  if (['confirmed', 'completed'].includes(newStatus) && requesterRole === 'patient') {
    throw new Error('Patients cannot confirm or complete appointments');
  }

  appointment.status = newStatus;
  await appointment.save();
  return appointment;
};

const rescheduleAppointment = async (appointmentId, newDateTime, requesterId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');

  if (appointment.patient.toString() !== requesterId.toString()) {
    throw new Error('Not authorized to reschedule this appointment');
  }

  if (!['pending', 'confirmed'].includes(appointment.status)) {
    throw new Error('Cannot reschedule a completed or cancelled appointment');
  }

  const taken = await isSlotTaken(appointment.doctor, newDateTime);
  if (taken) throw new Error('SLOT_TAKEN');

  appointment.dateTime = new Date(newDateTime);
  appointment.status = 'pending';
  await appointment.save();
  return appointment;
};

const cancelAppointment = async (appointmentId, requesterId, requesterRole) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');

  if (requesterRole === 'patient' && appointment.patient.toString() !== requesterId.toString()) {
    throw new Error('Not authorized');
  }
  if (appointment.status === 'completed') {
    throw new Error('Cannot cancel a completed appointment');
  }

  appointment.status = 'cancelled';
  await appointment.save();
  return appointment;
};

module.exports = {
  bookAppointment,
  getAvailableSlots,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateStatus,
  rescheduleAppointment,
  cancelAppointment
};
