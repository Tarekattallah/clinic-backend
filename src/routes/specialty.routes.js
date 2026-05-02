const express = require('express');
const router = express.Router();

const { 
    createSpecialty, 
    getAllSpecialties, 
    deleteSpecialty 
} = require('../controllers/specialty.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');


router.get('/', getAllSpecialties);

router.post('/', protect, authorize('admin'), createSpecialty);
router.delete('/:id', protect, authorize('admin'), deleteSpecialty);

module.exports = router;