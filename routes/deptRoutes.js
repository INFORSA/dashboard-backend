const express = require('express');
const { getDept, getPengurus } = require('../controllers/deptController');
const router = express.Router();

router.get('/get', getDept);
router.get('/get/pengurus', getPengurus);

module.exports = router;