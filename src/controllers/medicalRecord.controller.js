const medicalRecordService = require('../services/medicalRecord.service');

const addRecord = async (req, res) => {
  try {
    const record = await medicalRecordService.createRecord(
      req.user._id,
      req.params.appointmentId,
      req.body
    );
    res.status(201).json({ message: 'Medical record added', record });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getRecord = async (req, res) => {
  try {
    const record = await medicalRecordService.getRecordByAppointment(
      req.params.appointmentId,
      req.user._id,
      req.user.role
    );
    res.json({ record });
  } catch (err) {
    res.status(err.message === 'Not authorized' ? 403 : 404).json({ message: err.message });
  }
};

module.exports = { addRecord, getRecord };
