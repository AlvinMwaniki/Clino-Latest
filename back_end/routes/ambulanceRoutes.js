// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const ctrl = require('../controller/ambulanceController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/', ctrl.getAllAmbulances);
router.get('/dispatches', authorize('admin'), ctrl.getDispatchHistory);
router.post('/dispatch', authorize('admin'), ctrl.dispatchAmbulance);
router.post('/request', ctrl.requestAmbulance);        // patients can call this
router.put('/:id/status', authorize('admin'), ctrl.updateAmbulanceStatus);

module.exports = router;