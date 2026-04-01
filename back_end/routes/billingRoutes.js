const express = require('express');
const router = express.Router();
const {
  getAllBills,
  getBillById,
  createBill,
  updatePaymentStatus,
  getBillsByPatient,
  getBillingStats
} = require('../controller/billingController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/stats', authorize('admin'), getBillingStats);
router.get('/', authorize('admin', 'doctor'), getAllBills);
router.get('/:id', getBillById);
router.get('/patient/:patientId', getBillsByPatient);
router.post('/', authorize('admin', 'doctor'), createBill);
router.put('/:id/status', authorize('admin'), updatePaymentStatus);

module.exports = router;