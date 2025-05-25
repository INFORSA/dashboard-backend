const express = require("express");
const router = express.Router();
const uploadExcel = require("../middleware/uploadExcel");
const { importExcel } = require("../controllers/excelController");

router.post("/excel", uploadExcel.single("file"), importExcel);

module.exports = router;
