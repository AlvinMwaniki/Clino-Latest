const express = require('express');
const router = express.Router();
const { initiateSTKPush, mpesaCallback, checkPaymentStatus } = require('../controller/mpesaController');

// Note: callback from Safaricom must be public (no auth)
router.post('/stk-push', initiateSTKPush);
router.post('/callback', mpesaCallback);   // Safaricom calls this
router.get('/status/:checkoutRequestId', checkPaymentStatus);

module.exports = router;