const db = require('../config/db');

exports.getUser = (req, res) => {
    const sql = 'SELECT user.*, role.nama_role FROM user JOIN role ON user.role = role.id_role ORDER BY user.role';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send(result);
    });
  };

exports.getAnggota = (req, res) => {
    const sql = 'SELECT anggota.*, departemen.nama as nama_departemen FROM anggota JOIN departemen ON anggota.depart_id = departemen.id_depart ORDER BY anggota.depart_id';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send(result);
    });
  };