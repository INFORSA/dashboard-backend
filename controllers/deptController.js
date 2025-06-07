const db = require('../config/db');

exports.getDept = (req, res) => {
    const sql = 'SELECT * FROM departemen';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({
            data : result,
            total : result.length
        });
    });
  };
exports.getPengurus = (req, res) => {
    const sql = 'SELECT p.*, d.nama as dept FROM pengurus AS p JOIN departemen AS d ON p.dept_id = d.id_depart';
    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({
            data : result,
            total : result.length
        });
    });
  };