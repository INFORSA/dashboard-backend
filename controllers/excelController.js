const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const MONTHS_MAP = {
  januari:1,
  februari:2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12
};

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

    const results = [];

    for (const sheetName of workbook.SheetNames) {
      const lowerSheetName = sheetName.toLowerCase();
      if (!MONTHS_MAP[lowerSheetName]) {
        results.push({ sheet: sheetName, status: "skipped", message: "Nama sheet tidak sesuai bulan" });
        continue;
      }

      const month = MONTHS_MAP[lowerSheetName];
      const waktu = new Date(2025, month - 1, 1); // 1 Maret 2025, 1 April 2025, dst.

      const sheet = workbook.Sheets[sheetName];
      let lastNamaStaff = null;

      for (let row = 18; row <= 61; row++) { //sesuaikan baris maksimal anggota penilaian
        const namaCell = sheet[`C${row}`];
        const penilaiCell = sheet[`B${row}`];
        const nama_staff = namaCell?.v?.toString().trim() || lastNamaStaff;
        const penilai = penilaiCell?.v?.toString().trim();

        if (namaCell?.v) {
          lastNamaStaff = nama_staff; // simpan nama terakhir jika cell-nya punya isi
        }

        const nilaiMatriks = [];
        for (let i = 0; i < 7; i++) {
          const col = String.fromCharCode("D".charCodeAt(0) + i); // D to J
          const cell = sheet[`${col}${row}`];
          nilaiMatriks.push(parseFloat(cell?.v || 0));
        }

        if (!nama_staff || nilaiMatriks.some(isNaN)) {
          results.push({
            sheet: sheetName,
            nama: nama_staff || "-",
            status: "failed",
            message: "Data tidak lengkap"
          });
          continue;
        }

        // 1. Ambil pengurus_id dan anggota_id
        const [pengurus] = await new Promise((resolve, reject) => {
          db.query(
            "SELECT id_pengurus FROM pengurus WHERE keterangan = ?",
            [penilai],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
        });

        if (!pengurus) {
          results.push({
            nama: nama_staff,
            status: "failed",
            message: `Keterangan pengurus '${penilai}' tidak ditemukan`,
          });
          continue;
        }

        const [anggota] = await new Promise((resolve, reject) => {
          db.query("SELECT id_anggota FROM anggota WHERE nama_staff = ?", [nama_staff], (err, result) => {
            if (err) return reject(err);
              resolve(result);
          });
        });

        if (!anggota) {
          results.push({
            sheet: sheetName,
            nama: nama_staff,
            status: "failed",
            message: "Nama tidak ditemukan di tabel anggota"
          });
          continue;
        }

        // 2. Insert ke penilaian
        const penilaianResult = await new Promise((resolve, reject) => {
          db.query(
            "INSERT INTO penilaian (anggota_id, waktu, pengurus_id) VALUES (?, ?, ?)",
            [anggota.id_anggota, waktu, pengurus.id_pengurus],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
        });

        const penilaian_id = penilaianResult.insertId;

        // 3. Insert ke detail_penilaian
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

        results.push({
          sheet: sheetName,
          nama: nama_staff,
          status: "success",
          message: "Penilaian berhasil disimpan"
        });
      }
    }

    res.json({
      success: true,
      message: "Import penilaian dari semua sheet selesai",
      summary: results,
    });

  } catch (err) {
    console.error("Fatal error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
