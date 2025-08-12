const express = require('express');
const { getDept, getPengurus, getReview, addReview, deleteReview, storeDept, addDept, updateDept, deleteDept } = require('../controllers/deptController');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/get', getDept);
router.get('/get/departemen/:id', authenticate, authorize('readAny', 'departemen'), storeDept);
router.post('/add/departemen', authenticate, authorize('createAny', 'departemen'), upload.none(), addDept);
router.put("/update/departemen", authenticate, authorize('updateAny', 'departemen'), upload.none(), updateDept);
router.delete("/remove/departemen/:id", authenticate, authorize('deleteAny', 'departemen'), deleteDept);

router.get('/get/pengurus', getPengurus);
router.get('/get/review/:depart/:month', getReview);
router.post('/add/review', upload.none(), addReview);
router.delete('/remove/review/:id', deleteReview);

module.exports = router;