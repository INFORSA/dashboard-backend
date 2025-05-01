const db = require('../config/db');

exports.getAll = (req, res) => {
  const sql = 'SELECT * FROM insevent ORDER BY Start_Date ASC';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

// exports.getLomba = (req, res) => {
//   const sql = \"SELECT * FROM insevent WHERE Jenis_Event = 'Lomba' ORDER BY Start_Date ASC\";
//   db.query(sql, (err, result) => {
//     if (err) return res.status(500).send(err);
//     res.send(result);
//   });
// };

exports.getPeserta = (req, res) => {
  const sql = `SELECT p.Email, p.Nama_Lengkap, e.Nama_Event, p.Asal_Instansi
               FROM peserta_insevent p
               JOIN insevent e ON p.ID_Event = e.ID_Event
               ORDER BY p.ID_Event ASC`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};
