const express = require('express');
const { addRecord, getRecord } = require('../controllers/medicalRecord.controller');
const { protect }   = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const router = express.Router();
router.post('/appointment/:appointmentId',  protect, authorize('doctor'), addRecord);
router.get('/appointment/:appointmentId',   protect, getRecord);
module.exports = router;
