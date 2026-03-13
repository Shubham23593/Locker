const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const queueController = require('../controllers/queueController');

router.post('/join', auth, queueController.joinQueue);
router.post('/schedule', auth, queueController.scheduleAppointment);
router.get('/status', auth, queueController.getQueueStatus);
router.put('/start/:id', auth, authorize('doctor'), queueController.startSession);
router.put('/end/:id', auth, authorize('doctor'), queueController.endSession);
router.get('/doctor', auth, authorize('doctor'), queueController.getQueue);
router.get('/global', auth, authorize('admin'), queueController.getGlobalQueue);
router.get('/metrics', auth, authorize('admin'), queueController.getMetrics);

module.exports = router;
