const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.importAnggota = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const results = [];

    for (let row = 2; row <= 139; row++) {
      const nimCell = sheet[`C${row}`];
      const usernameCell = sheet[`B${row}`];
      const departCell = sheet[`D${row}`];

      const nim = nimCell?.v?.toString().trim();
      const username = usernameCell?.v?.toString().trim();
      const depart_id = departCell?.v?.toString().trim();
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

exports.importUser = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[1]];

    const results = [];

    for (let row = 2; row <= 20; row++) {
      const nimCell = sheet[`C${row}`];
      const usernameCell = sheet[`B${row}`];
      const roleCell = sheet[`D${row}`];

      const nim = nimCell?.v?.toString().trim();
      const username = usernameCell?.v?.toString().trim();
      const role = roleCell?.v?.toString().trim();

      if (!username || !nim) {
        results.push({ username: username || "-", status: "failed", message: "Data tidak lengkap" });
        continue;
      }

      try {
        const hashedPassword = await bcrypt.hash(nim, 10); // Password = NIM

        // Simpan ke user
        await new Promise((resolve, reject) => {
          db.query(
            "INSERT INTO user (username, password, role) VALUES (?, ?, ?)",
            [username, hashedPassword, role],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
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

exports.importPenilaian = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    const results = [];
    const waktu = new Date(); // atau ambil dari Excel jika ada

    for (let row = 2; row <= 139; row++) {
      const namaCell = sheet[`A${row}`]; // misal kolom A = nama staff
      const nama_staff = namaCell?.v?.toString().trim();

      const nilaiMatriks = [];
      for (let i = 0; i < 7; i++) {
        const col = String.fromCharCode("B".charCodeAt(0) + i); // kolom B → H
        const cell = sheet[`${col}${row}`];
        nilaiMatriks.push(parseFloat(cell?.v || 0));
      }

      if (!nama_staff || nilaiMatriks.some(isNaN)) {
        results.push({ nama: nama_staff || "-", status: "failed", message: "Data tidak lengkap" });
        continue;
      }

      // 1. Ambil anggota_id
      const [anggota] = await new Promise((resolve, reject) => {
        db.query("SELECT id_anggota FROM anggota WHERE nama_staff = ?", [nama_staff], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      if (!anggota) {
        results.push({ nama: nama_staff, status: "failed", message: "Nama tidak ditemukan di tabel anggota" });
        continue;
      }

      // 2. Insert ke penilaian
      const penilaianResult = await new Promise((resolve, reject) => {
        db.query("INSERT INTO penilaian (anggota_id, waktu) VALUES (?, ?)", [anggota.id_anggota, waktu], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      const penilaian_id = penilaianResult.insertId;

      // 3. Insert ke detail_penilaian (loop matriks_id 1–7)
      for (let i = 0; i < 7; i++) {
        const matriks_id = i + 1;
        const nilai = nilaiMatriks[i];

        await new Promise((resolve, reject) => {
          db.query(
            "INSERT INTO detail_penilaian (penilaian_id, matriks_id, nilai) VALUES (?, ?, ?)",
            [penilaian_id, matriks_id, nilai],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }

      results.push({ nama: nama_staff, status: "success", message: "Penilaian berhasil disimpan" });
    }

    res.json({
      success: true,
      message: "Import penilaian selesai",
      summary: results,
    });

  } catch (err) {
    console.error("Fatal error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
