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

exports.addDept = async (req, res) => {
    const {  nama, keterangan, nilai } = req.body;
    try {
      // Cek apakah user sudah ada
      const sqlCheck = "SELECT * FROM departemen WHERE nama = ?";
      db.query(sqlCheck, [nama], async (err, result) => {
        if (err) {
          console.error("DB Error:", err); // Menampilkan error DB ke console
          return res.status(500).json({ message: "Gagal memeriksa Departemen" });
        }
  
        if (result.length > 0) {
          return res.status(400).json({ message: "Departemen sudah terdaftar" });
        }

        const sqlInsert = "INSERT INTO departemen ( nama, keterangan, nilai ) VALUES ( ?, ?, ? )";
        db.query(sqlInsert, [ nama, keterangan, nilai ], (err, result) => {
          if (err) {
            console.error("DB Error:", err); // Menampilkan error DB ke console
            return res.status(500).json({ message: "Gagal menyimpan Departemen" });
          }
  
          res.status(201).json({ message: "Tambah Departemen berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error); // Log error yang tidak terduga
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };  

// STORE DEPT
exports.storeDept = async (req, res) => {
  const { id } = req.params;
  const sqlFind = "SELECT * FROM departemen WHERE id_depart = ?";
  db.query(sqlFind, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    if (rows.length === 0)
      return res.status(404).json({ message: "Departemen tidak ditemukan" });

    res.json(rows[0]); 
  });
  };

// UPDATE DEPT
exports.updateDept = async (req, res) => {
  const { id, nama, keterangan, nilai } = req.body;

  try {
    // Cek apakah role dengan id itu ada
    const sqlFind = "SELECT * FROM departemen WHERE id_depart = ?";
    db.query(sqlFind, [id], (err, rows) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Gagal memeriksa Departemen" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ message: "Departemen tidak ditemukan" });
      }
      
      // Update
      const sqlUpdate = "UPDATE departemen SET nama = ?, keterangan = ?, nilai = ? WHERE id_depart = ?";
      db.query(sqlUpdate, [nama, keterangan, nilai, id], (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal mengubah Departemen" });
        }
        res.json({ message: "Update Departemen berhasil!" });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
  };

// DELETE DEPT
exports.deleteDept = async (req, res) => {
  const { id } = req.params;       

  try {
    const sqlFind = "SELECT * FROM departemen WHERE id_depart = ?";
    db.query(sqlFind, [id], (err, rows) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Gagal memeriksa Departemen" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ message: "Departemen tidak ditemukan" });
      }

      // Hapus
      const sqlDelete = "DELETE FROM departemen WHERE id_depart = ?";
      db.query(sqlDelete, [id], (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal menghapus Departemen" });
        }
        res.json({ message: "Hapus Departemen berhasil!" });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
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

exports.getReview = (req, res) => {
    const { depart, month } = req.params;
    const sql = `SELECT review_depart.id_review ,departemen.nama AS nama_departemen, review_depart.waktu, user.username AS nama_reviewer, 
                review_depart.isi FROM review_depart JOIN departemen ON review_depart.depart_id = departemen.id_depart 
                JOIN user ON review_depart.user_id = user.id_user WHERE departemen.nama = ? AND MONTHNAME(waktu) = ?`;
    db.query(sql, [depart, month], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
    });
  };

exports.addReview = async (req, res) => {
  const { userLogin, target, month, isi } = req.body;
//   console.log(userLogin, target, month, isi);
  try {
    
    // Cek apakah sudah ada review di bulan yang sama
    const checkSql = `
      SELECT * FROM review_depart 
      WHERE user_id = ? AND depart_id = ? AND MONTHNAME(waktu) = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())
    `;

    db.query(checkSql, [userLogin, target, month], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error saat cek review:", checkErr);
        return res.status(500).json({ message: "Gagal memeriksa review" });
      }

      // Jika sudah ada, update review-nya
      if (checkResult.length > 0) {
        const updateSql = `
          UPDATE review_depart 
          SET isi = ?, updated_at = NOW() 
          WHERE user_id = ? AND depart_id = ? AND MONTHNAME(waktu) = ?
        `;
        db.query(updateSql, [isi, userLogin, target, month], (updateErr) => {
          if (updateErr) {
            console.error("Error saat update review:", updateErr);
            return res.status(500).json({ message: "Gagal memperbarui review" });
          }

          return res.status(200).json({ message: "Review berhasil diperbarui" });
        });

      } else {
        // Jika belum ada, insert review baru
        const bulanKeAngka = {
            January: "01",
            February: "02",
            March: "03",
            April: "04",
            May: "05",
            June: "06",
            July: "07",
            August: "08",
            September: "09",
            October: "10",
            November: "11",
            December: "12",
        };

        const monthNumber = bulanKeAngka[month];
        if (!monthNumber) {
            return res.status(400).json({ message: "Nama bulan tidak valid" });
        }

        const year = new Date().getFullYear();
        const waktu = `${year}-${monthNumber}-01`;
        const insertSql = `
          INSERT INTO review_depart (user_id, depart_id, waktu, isi) 
          VALUES (?, ?, ?, ?)
        `;
        db.query(insertSql, [userLogin, target, waktu, isi], (insertErr) => {
          if (insertErr) {
            console.error("Error saat insert review:", insertErr);
            return res.status(500).json({ message: "Gagal menambahkan review" });
          }

          return res.status(201).json({ message: "Review berhasil ditambahkan" });
        });
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.deleteReview = async (req, res) => {
    const { id } = req.params;       

    try {
      const sqlFind = "SELECT * FROM review_depart WHERE id_review = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa review" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Review tidak ditemukan" });
        }

        // Hapus
        const sqlDelete = "DELETE FROM review_depart WHERE id_review = ?";
        db.query(sqlDelete, [id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal menghapus review" });
          }
          res.json({ message: "Hapus review berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };