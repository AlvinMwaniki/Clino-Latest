// ═══════════════════════════════════════════════════════════════
// FILE: routes/wardRoutes.js
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const ctrl = require('../controller/wardController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/occupancy', ctrl.getOccupancySummary);
router.get('/', ctrl.getAllWards);
router.get('/:wardId/beds', ctrl.getWardBeds);
router.post('/assign', authorize('admin', 'doctor'), ctrl.assignBed);
router.put('/discharge/:assignment_id', authorize('admin', 'doctor'), ctrl.dischargeBed);

module.exports = router;