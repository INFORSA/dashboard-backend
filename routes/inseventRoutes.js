const express = require('express');
const router = express.Router();
const { getAll, getLomba, getPeserta } = require('../controllers/inseventController');

router.get('/get', getAll);
// router.get('/get/lomba', getLomba);
router.get('/get/peserta', getPeserta);

module.exports = router;