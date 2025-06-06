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
  const sql = `SELECT
              penilai, nama_anggota, nama_departemen, MONTHNAME(waktu) AS waktu,
              nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
              nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7, total_nilai FROM view_penilaian_anggota WHERE nama_departemen = ?
              AND MONTH(waktu) = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())`;
  db.query(sql, [depart, month], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getAllNilai = (req, res) => {
  const { month } = req.params;
  const sql = `SELECT
              penilai, nama_anggota, nama_departemen, MONTHNAME(waktu) AS waktu,
              nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
              nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7, total_nilai FROM view_penilaian_anggota
              WHERE MONTH(waktu) = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())`;
  db.query(sql, [month], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

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
