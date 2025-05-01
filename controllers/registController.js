const bcrypt = require('bcrypt');
const db = require('../config/database'); // sesuaikan dengan file config DB kamu

exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cek apakah user sudah ada
    const sqlCheck = "SELECT * FROM user WHERE username = ?";
    db.query(sqlCheck, [username], async (err, result) => {
      if (result.length > 0) {
        return res.status(400).json({ message: "Username sudah terdaftar" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const sqlInsert = "INSERT INTO user (username, Password) VALUES (?, ?)";
      db.query(sqlInsert, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal menyimpan user" });
        }

        res.status(201).json({ message: "Registrasi berhasil!" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan" });
  }
};
