// ═══════════════════════════════════════════════════════════════
//  FILE: routes/prescriptionRoutes.js
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const ctrl = require('../controller/prescriptionController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/', authorize('admin', 'doctor'), ctrl.getAllPrescriptions);
router.get('/patient/:patientId', ctrl.getPrescriptionsByPatient);
router.post('/', authorize('doctor'), ctrl.createPrescription);
router.put('/:id/dispense', authorize('admin', 'doctor'), ctrl.dispensePrescription);

module.exports = router;