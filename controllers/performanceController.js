const db = require('../config/db');

exports.getStaff = (req, res) => {
  const sql = 'SELECT * FROM insevent ORDER BY Start_Date ASC';
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
              nilai_matriks_7, total_nilai 
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
  const sql = `SELECT * FROM view_perbandingan_penilaian WHERE nama_departemen = ?`;
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
