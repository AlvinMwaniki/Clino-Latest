const express = require('express');
const { loginUser, getAllUsers, getDashboardStats } = require('../controller/userController');
const router = express.Router();



router.post('/login', loginUser);
router.get('/', getAllUsers);

// Added this line to handle the /stats request 👇
router.get('/stats', getDashboardStats);

module.exports = router;
