const express = require('express');
const router = express.Router();
const { getNilai, getStaff, getLineChart, getBarChart, getRadarChart, getLineChart2, getAllNilai, getNilaiByPenilai, getMaxNilai, getPersonalNilai, getPersonalLineChart, updateNilai, getMatriks, storeMatriks, addMatriks, updateMatriks, deleteMatriks } = require('../controllers/performanceController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

// Route yang dilindungi
//GET
router.get('/get', authenticate, authorize('readAny', 'penilaian'), getStaff);

router.get('/get/all/matriks', authenticate, authorize('readAny', 'penilaian'), getMatriks);
router.get('/get/matriks/:id', authenticate, authorize('readAny', 'penilaian'), storeMatriks);
router.post('/add/matriks', authenticate, authorize('createAny', 'penilaian'), upload.none(), addMatriks);
router.put("/update/matriks", authenticate, authorize('updateAny', 'penilaian'), upload.none(), updateMatriks);
router.delete("/remove/matriks/:id", authenticate, authorize('deleteAny', 'penilaian'), deleteMatriks);

router.get('/get/all/nilai/:month', authenticate, authorize('readAny', 'penilaian'), getAllNilai);
router.get('/get/nilai/:depart/:month', authenticate, authorize('readAny', 'penilaian'), getNilai);
router.get('/get/max-nilai/:month', authenticate, authorize('readAny', 'penilaian'), getMaxNilai);
router.get('/get/nilai/:depart/:penilai/:month', authenticate, authorize('readAny', 'penilaian'), getNilaiByPenilai);
router.get('/get/nilai/personal', authenticate, authorize('readOwn', 'penilaian'), getPersonalNilai);
router.get('/get/linechart', authenticate, authorize('readAny', 'penilaian'), getLineChart);
router.get('/get/linechart/:depart', authenticate, authorize('readAny', 'penilaian'), getLineChart2);
router.get('/get/personal/linechart', authenticate, authorize('readOwn', 'penilaian'), getPersonalLineChart);
router.get('/get/barchart/:depart', authenticate, authorize('readAny', 'penilaian'), getBarChart);
router.get('/get/radarchart/:depart', authenticate, authorize('readAny', 'penilaian'), getRadarChart);

//UPDATE
router.put("/update-nilai", authenticate, authorize('updateAny', 'penilaian'), updateNilai);

module.exports = router;