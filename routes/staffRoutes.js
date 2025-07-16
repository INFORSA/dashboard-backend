const express = require('express');
const { getStaff, getReview, checkSertif, uploadSertif, getSertif, deleteSertif, downloadSertif } = require('../controllers/staffController');
const router = express.Router();
const upload = require("../middleware/uploadSertif");
const authenticate = require('../middleware/authMiddleware');

router.get('/get', getStaff);
router.get('/get/review/:anggota', getReview);
router.get("/check-sertif/:nim", checkSertif);
router.get("/get/sertif", getSertif);
router.get("/sertif/download/:filename", authenticate, downloadSertif);
router.post("/upload-sertif", upload.array("files", 20), uploadSertif);
router.delete("/remove/sertif/:id", deleteSertif);


module.exports = router;