const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.importExcel = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const results = [];

    for (let row = 2; row <= 94; row++) {
      const nimCell = sheet[`C${row}`];
      const usernameCell = sheet[`D${row}`];

      const nim = nimCell?.v?.toString().trim();
      const username = usernameCell?.v?.toString().trim();
      const depart_id = 1;
      const gender = null; // gender tidak tersedia

      if (!username || !nim || !depart_id) {
        results.push({ username: username || "-", status: "failed", message: "Data tidak lengkap" });
        continue;
      }

      // Cek apakah username sudah ada
      const [existingUser] = await new Promise((resolve, reject) => {
        db.query("SELECT * FROM anggota WHERE nama_staff = ?", [username], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      if (existingUser) {
        results.push({ username, status: "failed", message: "Nama sudah terdaftar" });
        continue;
      }

      try {
        const hashedPassword = await bcrypt.hash(nim, 10); // Password = NIM

        // Simpan ke user
        const userInsertResult = await new Promise((resolve, reject) => {
          db.query(
            "INSERT INTO user (username, password, role) VALUES (?, ?, ?)",
            [username, hashedPassword, 3],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
        });

        const userId = userInsertResult.insertId;

        // Simpan ke anggota
        await new Promise((resolve, reject) => {
          db.query(
            "INSERT INTO anggota (user_id, nama_staff, nim, gender, depart_id, gambar) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, username, nim, gender, depart_id, null],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });

        results.push({ username, status: "success", message: "Data berhasil disimpan" });
      } catch (insertErr) {
        console.error("Insert error:", insertErr);
        results.push({ username, status: "failed", message: "Gagal insert data" });
      }
    }

    res.json({
      success: true,
      message: "Import selesai",
      summary: results,
    });
  } catch (err) {
    console.error("Fatal error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};