const db = require('../config/db');

exports.getStaff = (req, res) => {
  const sql = 'SELECT * FROM insevent ORDER BY Start_Date ASC';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getMatriks = (req, res) => {
  const sql = 'SELECT * FROM matriks_penilaian';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getNilai = (req, res) => {
  const { depart, month } = req.params;
  const sql = `SELECT nama_anggota, nama_departemen, MONTHNAME(waktu) AS waktu,
              SUM(nilai_matriks_1) AS nilai_matriks_1, 
              SUM(nilai_matriks_2) AS nilai_matriks_2, 
              SUM(nilai_matriks_3) AS nilai_matriks_3,
              SUM(nilai_matriks_4) AS nilai_matriks_4, 
              SUM(nilai_matriks_5) AS nilai_matriks_5, 
              SUM(nilai_matriks_6) AS nilai_matriks_6, 
              SUM(nilai_matriks_7) AS nilai_matriks_7, SUM(total_nilai) AS total_nilai 
              FROM view_penilaian_anggota WHERE nama_departemen = ?
              AND MONTH(waktu) = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())
              GROUP BY nama_anggota, nama_departemen, waktu
              ORDER BY nama_anggota`;
  db.query(sql, [depart, month], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getNilaiByPenilai = (req, res) => {
  const { depart, month, penilai } = req.params;
  const sql = `SELECT nama_anggota, nama_departemen, MONTHNAME(waktu) AS waktu,
              nilai_matriks_1, 
              nilai_matriks_2, 
              nilai_matriks_3,
              nilai_matriks_4, 
              nilai_matriks_5, 
              nilai_matriks_6, 
              nilai_matriks_7, 
              id_detail_matriks_1, id_detail_matriks_2, id_detail_matriks_3,
              id_detail_matriks_4, id_detail_matriks_5,
              id_detail_matriks_6, id_detail_matriks_7, total_nilai 
              FROM view_penilaian_anggota WHERE nama_departemen = ?
              AND MONTH(waktu) = ? AND penilai = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())`;
  db.query(sql, [depart, month, penilai], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getAllNilai = (req, res) => {
  const { month } = req.params;
  const sql = `SELECT
              nama_anggota, nama_departemen, MONTHNAME(waktu) AS waktu,  
              SUM(nilai_matriks_1) AS nilai_matriks_1, 
              SUM(nilai_matriks_2) AS nilai_matriks_2, 
              SUM(nilai_matriks_3) AS nilai_matriks_3,
              SUM(nilai_matriks_4) AS nilai_matriks_4, 
              SUM(nilai_matriks_5) AS nilai_matriks_5, 
              SUM(nilai_matriks_6) AS nilai_matriks_6, 
              SUM(nilai_matriks_7) AS nilai_matriks_7, SUM(total_nilai) AS total_nilai FROM view_penilaian_anggota
              WHERE MONTH(waktu) = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())
              GROUP BY nama_anggota, nama_departemen, waktu
              ORDER BY nama_anggota`;
  db.query(sql, [month], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getMaxNilai = (req, res) => {
  const { month } = req.params;
  const sql = `WITH ranked_penilaian AS (
                SELECT 
                    nama_anggota,
                    nama_departemen,
                    MONTHNAME(waktu) AS waktu,
                    SUM(total_nilai) AS total_nilai,
                    ROW_NUMBER() OVER (
                        PARTITION BY nama_departemen 
                        ORDER BY SUM(total_nilai) DESC
                    ) AS rn
                FROM view_penilaian_anggota
                WHERE MONTH(waktu) = ?
                  AND YEAR(waktu) = YEAR(CURRENT_DATE())
                GROUP BY nama_anggota, nama_departemen, MONTHNAME(waktu)
            )

            SELECT nama_anggota, nama_departemen, waktu, total_nilai
            FROM ranked_penilaian
            WHERE rn = 1`;
  db.query(sql, [ month ], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  })
}

exports.getLineChart = (req, res) => {
  const sql = `SELECT * FROM view_performa_inforsa WHERE SUBSTRING(bulan, 1, 6) = YEAR(CURRENT_DATE())`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getLineChart2 = (req, res) => {
  const { depart } = req.params;
  const sql = `SELECT * FROM view_penilaian_bulanan WHERE nama_departemen = ? AND SUBSTRING(bulan, 1, 6) = YEAR(CURRENT_DATE())`;
  db.query(sql, [depart], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getPersonalLineChart = (req, res) => {
  const nama = req.user.username;
  const sql = `SELECT
              nama_anggota, nama_departemen, MONTHNAME(waktu) AS bulan, MONTH(waktu) AS urutan_bulan, 
              SUM(total_nilai) AS total_nilai FROM view_penilaian_anggota
              WHERE YEAR(waktu) = YEAR(CURRENT_DATE()) AND nama_anggota = ? 
              GROUP BY nama_anggota, nama_departemen, bulan, urutan_bulan
              ORDER BY urutan_bulan ASC`;
  db.query(sql, [nama], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getPersonalNilai = (req, res) => {
  const nama = req.user.username;
  const sql = `SELECT
              nama_anggota, nama_departemen, MONTHNAME(waktu) AS waktu,  
              SUM(nilai_matriks_1) AS nilai_matriks_1, 
              SUM(nilai_matriks_2) AS nilai_matriks_2, 
              SUM(nilai_matriks_3) AS nilai_matriks_3,
              SUM(nilai_matriks_4) AS nilai_matriks_4, 
              SUM(nilai_matriks_5) AS nilai_matriks_5, 
              SUM(nilai_matriks_6) AS nilai_matriks_6, 
              SUM(nilai_matriks_7) AS nilai_matriks_7, SUM(total_nilai) AS total_nilai FROM view_penilaian_anggota
              WHERE YEAR(waktu) = YEAR(CURRENT_DATE()) AND nama_anggota = ? 
              GROUP BY nama_anggota, nama_departemen, waktu
              HAVING SUM(nilai_matriks_1) > 0 OR
              SUM(nilai_matriks_2) > 0 OR
              SUM(nilai_matriks_3) > 0 OR
              SUM(nilai_matriks_4) > 0 OR
              SUM(nilai_matriks_5) > 0 OR
              SUM(nilai_matriks_6) > 0 OR
              SUM(nilai_matriks_7) > 0
              ORDER BY nama_anggota`;
  db.query(sql, [nama], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getRadarChart = (req, res) => {
  const { depart } = req.params;
  const sql = `SELECT * FROM vw_penilaian_anggota_per_departemen WHERE nama_departemen = ? ORDER BY rata_rata DESC LIMIT 5`;
  db.query(sql, [depart], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getBarChart = (req, res) => {
  const { depart } = req.params;
  const sql = `SELECT
              nama_anggota, nama_departemen,
              nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
              nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7, total_nilai FROM view_penilaian_anggota WHERE nama_departemen = ? 
              AND MONTH(waktu) = MONTH(CURRENT_DATE()) AND YEAR(waktu) = YEAR(CURRENT_DATE())`;
  db.query(sql, [depart], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.updateNilai = (req, res) => {
  const { id, nilai } = req.body;

  // Validasi input
  if (!id || typeof nilai === 'undefined') {
    return res.status(400).json({ error: "ID dan nilai diperlukan" });
  }

  const sql = "UPDATE detail_penilaian SET nilai = ? WHERE id_detail_penilaian = ?";

  db.query(sql, [nilai, id], (err, result) => {
    if (err) {
      console.error("❌ Gagal update nilai:", err);
      return res.status(500).json({ error: "Gagal update nilai" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ID tidak ditemukan" });
    }

    res.status(200).json({ message: "✅ Nilai berhasil diperbarui" });
  });
};

exports.addMatriks = async (req, res) => {
    const {  nama_matriks, bobot } = req.body;
  
    try {
      // Cek apakah user sudah ada
      const sqlCheck = "SELECT * FROM matriks_penilaian WHERE nama = ?";
      db.query(sqlCheck, [nama_matriks], async (err, result) => {
        if (err) {
          console.error("DB Error:", err); // Menampilkan error DB ke console
          return res.status(500).json({ message: "Gagal memeriksa matriks" });
        }
  
        if (result.length > 0) {
          return res.status(400).json({ message: "Matriks sudah terdaftar" });
        }

        const sqlInsert = "INSERT INTO matriks_penilaian ( nama, bobot ) VALUES ( ?, ? )";
        db.query(sqlInsert, [ nama_matriks, bobot ], (err, result) => {
          if (err) {
            console.error("DB Error:", err); // Menampilkan error DB ke console
            return res.status(500).json({ message: "Gagal menyimpan matriks" });
          }
  
          res.status(201).json({ message: "Tambah Matriks berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error); // Log error yang tidak terduga
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };  

  // STORE ROLE 
  exports.storeMatriks = async (req, res) => {
    const { id } = req.params;
    const sqlFind = "SELECT * FROM matriks_penilaian WHERE id_matriks = ?";
    db.query(sqlFind, [id], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0)
        return res.status(404).json({ message: "Matrik tidak ditemukan" });

      res.json(rows[0]); 
    });
  };

  // UPDATE ROLE 
  exports.updateMatriks = async (req, res) => {
    const { id, nama, bobot } = req.body;

    try {
      // Cek apakah role dengan id itu ada
      const sqlFind = "SELECT * FROM matriks_penilaian WHERE id_matriks = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa matriks" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Matriks tidak ditemukan" });
        }

        // Update
        const sqlUpdate = "UPDATE matriks_penilaian SET nama = ?, bobot = ? WHERE id_matriks = ?";
        db.query(sqlUpdate, [nama, bobot, id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal mengubah matriks" });
          }
          res.json({ message: "Update Matriks berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

  // DELETE ROLE
  exports.deleteMatriks = async (req, res) => {
    const { id } = req.params;       

    try {
      const sqlFind = "SELECT * FROM matriks_penilaian WHERE id_matriks = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa matriks" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Matriks tidak ditemukan" });
        }

        // Hapus
        const sqlDelete = "DELETE FROM matriks_penilaian WHERE id_matriks = ?";
        db.query(sqlDelete, [id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal menghapus matriks" });
          }
          res.json({ message: "Hapus Matriks berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };