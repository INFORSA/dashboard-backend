const express = require('express');
const { getDept, getPengurus, getReview, addReview, deleteReview } = require('../controllers/deptController');
const router = express.Router();
const upload = require('../middleware/upload');

router.get('/get', getDept);
router.get('/get/pengurus', getPengurus);
router.get('/get/review/:depart/:month', getReview);
router.post('/add/review', upload.none(), addReview);
router.delete('/remove/review/:id', deleteReview);

module.exports = router;