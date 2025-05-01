const express = require('express');
const { getStaff } = require('../controllers/staffController');
const router = express.Router();

router.get('/get', getStaff);

module.exports = router;