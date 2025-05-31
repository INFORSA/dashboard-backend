const express = require('express');
const router = express.Router();
const { getNilai, getStaff } = require('../controllers/performanceController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Route yang dilindungi
router.get('/get', authenticate, authorize('readAny', 'penilaian'), getStaff);
router.get('/get/nilai/:depart', authenticate, authorize('readAny', 'penilaian'), getNilai);

module.exports = router;