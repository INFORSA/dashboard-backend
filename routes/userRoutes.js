const express = require('express');
const { getUser, getAnggota } = require('../controllers/userController');
const router = express.Router();

router.get('/get', getUser);
router.get('/get/anggota', getAnggota);

module.exports = router;