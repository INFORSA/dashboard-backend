const express = require('express');
const { getStaff, getReview, checkSertif, uploadSertif, getSertif, deleteSertif, downloadSertif, addReview, deleteReview } = require('../controllers/staffController');
const router = express.Router();
const upload = require("../middleware/uploadSertif");
const authenticate = require('../middleware/authMiddleware');

router.get('/get', getStaff);

//Review
router.get('/get/review/:anggota', getReview);
router.post('/add/review', upload.none(), addReview);
router.delete('/remove/review/:id', deleteReview);

//Sertif
router.get("/check-sertif/:nim", checkSertif);
router.get("/get/sertif", getSertif);
router.get("/sertif/download/:filename", authenticate, downloadSertif);
router.post("/upload-sertif", upload.array("files", 20), uploadSertif);
router.delete("/remove/sertif/:id", deleteSertif);

module.exports = router;