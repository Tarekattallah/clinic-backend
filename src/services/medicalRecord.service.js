const MedicalRecord = require('../models/MedicalRecord.model');
const Appointment = require('../models/Appointment.model');
const DoctorProfile = require('../models/DoctorProfile.model');

const createRecord = async (doctorUserId, appointmentId, recordData) => {
  const appointment = await Appointment.findById(appointmentId).populate('doctor');
  if (!appointment) throw new Error('Appointment not found');

  // Make sure the doctor owns this appointment
  const doctorProfile = await DoctorProfile.findOne({ user: doctorUserId });
  if (!doctorProfile) throw new Error('Doctor profile not found');

  if (appointment.doctor._id.toString() !== doctorProfile._id.toString()) {
    throw new Error('Not authorized to add records for this appointment');
  }

  if (appointment.status !== 'completed') {
    throw new Error('Can only add medical records to completed appointments');
  }

  const existing = await MedicalRecord.findOne({ appointment: appointmentId });
  if (existing) throw new Error('Medical record already exists for this appointment');

  const record = await MedicalRecord.create({
    appointment: appointmentId,
    diagnosis: recordData.diagnosis || '',
    prescription: recordData.prescription || '',
    notes: recordData.notes || ''
  });

  return record;
};

const getRecordByAppointment = async (appointmentId, requesterId, requesterRole) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');

  // Patient can only see their own records
  if (requesterRole === 'patient' && appointment.patient.toString() !== requesterId.toString()) {
    throw new Error('Not authorized');
  }

  const record = await MedicalRecord.findOne({ appointment: appointmentId })
    .populate({
      path: 'appointment',
      populate: [
        { path: 'patient', select: 'name email' },
        { path: 'doctor', populate: { path: 'user', select: 'name' } }
      ]
    });

  if (!record) throw new Error('No medical record found for this appointment');
  return record;
};

module.exports = { createRecord, getRecordByAppointment };
