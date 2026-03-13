const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/dashboard', auth, authorize('admin'), adminController.getDashboard);
router.get('/users', auth, authorize('admin'), adminController.getAllUsers);
router.get('/simulation', auth, authorize('admin'), adminController.getSimulation);

module.exports = router;
