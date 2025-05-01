const express = require('express');
const { getDept } = require('../controllers/deptController');
const router = express.Router();

router.get('/get', getDept);

module.exports = router;