const express = require('express');
const router = express.Router();
const { getNilai, getStaff, getLineChart, getBarChart, getRadarChart, getLineChart2, getAllNilai } = require('../controllers/performanceController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Route yang dilindungi
router.get('/get', authenticate, authorize('readAny', 'penilaian'), getStaff);
router.get('/get/all/nilai', authenticate, authorize('readAny', 'penilaian'), getAllNilai);
router.get('/get/nilai/:depart', authenticate, authorize('readAny', 'penilaian'), getNilai);
router.get('/get/linechart', authenticate, authorize('readAny', 'penilaian'), getLineChart);
router.get('/get/linechart/:depart', authenticate, authorize('readAny', 'penilaian'), getLineChart2);
router.get('/get/barchart/:depart', authenticate, authorize('readAny', 'penilaian'), getBarChart);
router.get('/get/radarchart/:depart', authenticate, authorize('readAny', 'penilaian'), getRadarChart);

module.exports = router;