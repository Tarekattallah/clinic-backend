const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const SLOT_DURATION_MINUTES = 30;
const WORK_HOURS_START = 9;
const WORK_HOURS_END = 17;

module.exports = { ROLES, APPOINTMENT_STATUS, SLOT_DURATION_MINUTES, WORK_HOURS_START, WORK_HOURS_END };
