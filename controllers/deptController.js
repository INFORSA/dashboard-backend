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