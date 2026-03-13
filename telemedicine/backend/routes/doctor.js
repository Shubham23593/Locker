const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

router.put('/toggle-status', auth, authorize('doctor'), doctorController.toggleStatus);
router.get('/by-specialization', auth, doctorController.getDoctorsBySpecialization);
router.get('/profile', auth, authorize('doctor'), doctorController.getProfile);

module.exports = router;
