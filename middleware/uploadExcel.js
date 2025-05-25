const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // menyimpan file di memory buffer
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
    cb(null, true);
  } else {
    cb(new Error("Format file harus .xlsx"), false);
  }
};

const uploadExcel = multer({ storage, fileFilter });

module.exports = uploadExcel;
