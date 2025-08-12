const db = require('../config/db');
const fs = require("fs");
const path = require("path");

exports.getStaff = (req, res) => {
    const sql = 'SELECT * FROM anggota ORDER BY anggota_id';
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
    const sql = `SELECT review_staff.id_review, anggota.nama_staff AS nama_staff, MONTHNAME(review_staff.waktu) as waktu, user.username AS nama_reviewer, 
                review_staff.isi FROM review_staff JOIN anggota ON review_staff.anggota_id = anggota.id_anggota
                JOIN user ON review_staff.user_id = user.id_user WHERE anggota.nama_staff = ?`;
    db.query(sql, [anggota], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
  };

exports.addReview = async (req, res) => {
  const { userLogin, target, month, isi } = req.body;
  // console.log(userLogin, target, month, isi);
  try {
    
    // Cek apakah sudah ada review di bulan yang sama
    const checkSql = `
      SELECT * FROM review_staff 
      WHERE user_id = ? AND anggota_id = ? AND MONTHNAME(waktu) = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())
    `;

    db.query(checkSql, [userLogin, target, month], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error saat cek review:", checkErr);
        return res.status(500).json({ message: "Gagal memeriksa review" });
      }

      // Jika sudah ada, update review-nya
      if (checkResult.length > 0) {
        const updateSql = `
          UPDATE review_staff 
          SET isi = ?, updated_at = NOW() 
          WHERE user_id = ? AND anggota_id = ? AND MONTHNAME(waktu) = ?
        `;
        db.query(updateSql, [isi, userLogin, target, month], (updateErr) => {
          if (updateErr) {
            console.error("Error saat update review:", updateErr);
            return res.status(500).json({ message: "Gagal memperbarui review" });
          }

          return res.status(200).json({ message: "Review berhasil diperbarui" });
        });

      } else {
        // Jika belum ada, insert review baru
        const bulanKeAngka = {
            January: "01",
            February: "02",
            March: "03",
            April: "04",
            May: "05",
            June: "06",
            July: "07",
            August: "08",
            September: "09",
            October: "10",
            November: "11",
            December: "12",
        };

        const monthNumber = bulanKeAngka[month];
        if (!monthNumber) {
            return res.status(400).json({ message: "Nama bulan tidak valid" });
        }

        const year = new Date().getFullYear();
        const waktu = `${year}-${monthNumber}-01`;
        const insertSql = `
          INSERT INTO review_staff (user_id, anggota_id, waktu, isi) 
          VALUES (?, ?, ?, ?)
        `;
        db.query(insertSql, [userLogin, target, waktu, isi], (insertErr) => {
          if (insertErr) {
            console.error("Error saat insert review:", insertErr);
            return res.status(500).json({ message: "Gagal menambahkan review" });
          }

          return res.status(201).json({ message: "Review berhasil ditambahkan" });
        });
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
  };

exports.deleteReview = async (req, res) => {
    const { id } = req.params;       

    try {
      const sqlFind = "SELECT * FROM review_staff WHERE id_review = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa review" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Review tidak ditemukan" });
        }

        // Hapus
        const sqlDelete = "DELETE FROM review_staff WHERE id_review = ?";
        db.query(sqlDelete, [id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal menghapus review" });
          }
          res.json({ message: "Hapus review berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

exports.checkSertif = (req, res) => {
  const { nim } = req.params;

  if (!nim) {
    return res.status(400).json({ message: "NIM tidak ditemukan" });
  }

  const filename = `${nim}.pdf`;

  const sql = "SELECT * FROM sertif WHERE path = ?";
  db.query(sql, [filename], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }

    if (result.length === 0) {
      return res.status(200).json({
        available: false,
        message: "Sertifikat belum diupload",
      });
    } else {
      return res.status(200).json({
        available: true,
        path: `/sertif/${filename}`,
      });
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