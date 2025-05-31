const db = require('../config/db');

exports.getStaff = (req, res) => {
  const sql = 'SELECT * FROM insevent ORDER BY Start_Date ASC';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getNilai = (req, res) => {
  const { depart } = req.params;
  const sql = `SELECT
              nama_anggota, nama_departemen, MONTHNAME(waktu) AS waktu,
              nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
              nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7, total_nilai FROM view_penilaian_anggota WHERE nama_departemen = ?`;
  db.query(sql, [depart], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};
