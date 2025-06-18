const db = require('../config/db');

exports.getStaff = (req, res) => {
    const sql = 'SELECT * FROM anggota ORDER BY depart_id';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({
        data:result,
        total:result.length
      });
    });
  };