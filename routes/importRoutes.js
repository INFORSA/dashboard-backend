const express = require("express");
const router = express.Router();
const uploadExcel = require("../middleware/uploadExcel");
const { importAnggota, importUser, importPenilaian, importPenilaianDept } = require("../controllers/excelController");

router.post("/excel/anggota", uploadExcel.single("file"), importAnggota);
router.post("/excel/user", uploadExcel.single("file"), importUser);
router.post("/excel/penilaian/staff", uploadExcel.single("file"), importPenilaian);
router.post("/excel/penilaian/departemen", uploadExcel.single("file"), importPenilaianDept);

module.exports = router;
