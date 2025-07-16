const multer = require("multer");
const path = require("path");

// Konfigurasi penyimpanan sertifikat
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/sertif")); // folder simpan sertif, pastikan folder ini ada
  },
  filename: function (req, file, cb) {
    // Simpan dengan nama asli, contoh: 2409116048.pdf
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdf = file.mimetype === "application/pdf";
  if (isPdf) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file PDF yang diperbolehkan!"));
  }
};

const uploadSertif = multer({ storage, fileFilter });

module.exports = uploadSertif;