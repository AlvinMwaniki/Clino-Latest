// ═══════════════════════════════════════════════════════════════
// FILE: routes/auditRoutes.js
// ═══════════════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controller/auditController');
const { authorize } = require('../middleware/authMiddleware');

router.get('/', authorize('admin'), getAuditLogs);

module.exports = router;