const express = require("express");
const router = express.Router();
const uploadExcel = require("../middleware/uploadExcel");
const { importAnggota, importUser, importPenilaian } = require("../controllers/excelController");

router.post("/excel/anggota", uploadExcel.single("file"), importAnggota);
router.post("/excel/user", uploadExcel.single("file"), importUser);
router.post("/excel/penilaian", uploadExcel.single("file"), importPenilaian);

module.exports = router;
