const db = require('../config/db');

exports.getStaff = (req, res) => {
  const sql = 'SELECT * FROM insevent ORDER BY Start_Date ASC';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getNilai = (req, res) => {
  const sql = `SELECT 
      p.id_penilaian,
      p.anggota_id,
      p.waktu,
      d.id_detail_penilaian,
      d.matriks_id,
      m.nama AS nama_matriks,
      m.bobot,
      d.nilai
    FROM 
      penilaian p
    JOIN 
      detail_penilaian d ON p.id_penilaian = d.penilaian_id
    JOIN 
      matriks_penilaian m ON d.matriks_id = m.id_matriks
    ORDER BY 
      p.anggota_id, p.waktu, m.id_matriks`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};
