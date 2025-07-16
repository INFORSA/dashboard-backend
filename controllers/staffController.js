const db = require('../config/db');
const fs = require("fs");
const path = require("path");

exports.getStaff = (req, res) => {
    const sql = 'SELECT * FROM anggota ORDER BY depart_id';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({
        data:result,
        total:result.length
      });
    });
  };

exports.getReview = (req, res) => {
    const { anggota } = req.params;
    const sql = `SELECT anggota.nama_staff AS nama_staff, MONTHNAME(review_staff.waktu) as waktu, user.username AS nama_reviewer, 
                review_staff.isi FROM review_staff JOIN anggota ON review_staff.anggota_id = anggota.id_anggota
                JOIN user ON review_staff.user_id = user.id_user WHERE anggota.nama_staff = ?`;
    db.query(sql, [anggota], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
  };

exports.checkSertif = (req, res) => {
  const { nim } = req.params;

  if (!nim) return res.status(400).json({ message: "NIM tidak ditemukan" });

  const filePath = path.join(__dirname, "../public/sertif", `${nim}.pdf`);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(200).json({
        avaible: false,
        message: "Sertifikat belum diupload",
      });
    } else {
      return res.status(200).json({ available: true, path: `/sertif/${nim}.pdf` });
    }
  });
};

exports.uploadSertif = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Tidak ada file yang diupload" });
  }

  const uploadedFiles = req.files.map(file => file.filename);
  console.log("Sertifikat yang diupload:", uploadedFiles);

  const values = uploadedFiles.map((filename) => [filename]);

  const insertSql = `INSERT INTO sertif (path) VALUES ? ON DUPLICATE KEY UPDATE path = VALUES(path)`;

  db.query(insertSql, [values], (err, result) => {
    if (err) {
      console.error("Gagal simpan ke database:", err);
      return res.status(500).json({ message: "Gagal menyimpan sertifikat ke database" });
    }

    return res.status(200).json({
      message: "Sertifikat berhasil diupload dan disimpan (termasuk yang diganti)",
      files: uploadedFiles,
    });
  });
};

exports.getSertif = (req, res) => {
  const sql = `SELECT * FROM sertif ORDER BY id_sertif DESC`;
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Gagal ambil sertif:", err);
      return res.status(500).json({ message: "Gagal mengambil data sertif" });
    }

    res.status(200).json({
      data: result,
      total: result.length
    });
  });
};

exports.deleteSertif = async (req, res) => {
    const { id } = req.params;       

    try {
      const sqlFind = "SELECT * FROM sertif WHERE id_sertif = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa sertif" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Sertif tidak ditemukan" });
        }

        // Hapus
        const sqlDelete = "DELETE FROM sertif WHERE id_sertif = ?";
        db.query(sqlDelete, [id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal menghapus sertif" });
          }
          res.json({ message: "Hapus sertif berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

exports.downloadSertif = (req, res) => {
  const filename = req.params.filename;
  const userNIM = req.user?.nim;
  const userRole = req.user?.role;

  const filePath = path.join(__dirname, '../uploads/sertif', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File tidak ditemukan." });
  }

  // Validasi: hanya izinkan jika filename sesuai dengan NIM user
  if (userRole !== "superadmin" && !filename.startsWith(userNIM)) {
    return res.status(403).json({ message: "Tidak diizinkan mengakses file ini." });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=" + filename);
  return res.sendFile(filePath);
};