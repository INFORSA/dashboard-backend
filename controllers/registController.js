const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.registerStaff = async (req, res) => {
  const { username, password, nim, gender, depart_id } = req.body;
  const gambar = req.file?.filename; // File yang di-upload
  const year = new Date().getFullYear();

  try {
    // Cek apakah username sudah ada
    const sqlCheck = "SELECT * FROM user WHERE username = ?";
    db.query(sqlCheck, [username], async (err, result) => {
      if (err) return res.status(500).json({ message: "DB Error saat cek user" });
      if (result.length > 0) {
        return res.status(400).json({ message: "Username sudah terdaftar" });
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan ke tabel user
      const sqlInsertUser = "INSERT INTO user (username, password, role) VALUES (?, ?, ?)";
      db.query(sqlInsertUser, [username, hashedPassword, 3], (err, resultUser) => {
        if (err) {
          console.error("DB Error (anggota):", err);
          return res.status(500).json({ message: "Gagal menyimpan anggota" });
        }

        const userId = resultUser.insertId;

        // Simpan ke tabel anggota
        const sqlInsertAnggota = "INSERT INTO anggota (user_id, nama_staff, nim, gender, depart_id, gambar, periode) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(sqlInsertAnggota, [userId, username, nim, gender, depart_id, gambar, year], async (err) => {
          if (err) {
            console.error("DB Error (user):", err);
            return res.status(500).json({ message: "Gagal menyimpan anggota" });
          }

          res.status(201).json({ message: "Registrasi berhasil!" });
        });
      });
    });
  } catch (error) {
    console.error("Catch Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};