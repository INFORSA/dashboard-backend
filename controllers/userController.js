const db = require('../config/db');

exports.getUser = (req, res) => {
    const sql = 'SELECT user.*, role.nama_role FROM user JOIN role ON user.role = role.id_role ORDER BY user.role';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({
        data : result,
        total : result.length
      });
    });
  };

exports.getAnggota = (req, res) => {
    const sql = 'SELECT anggota.*, departemen.nama as nama_departemen FROM anggota JOIN departemen ON anggota.depart_id = departemen.id_depart ORDER BY anggota.depart_id';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send(result);
    });
  };

  exports.getRole = (req, res) => {
    const sql = 'SELECT * FROM role ORDER BY id_role';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send(result);
    });
  };

  exports.addRole = async (req, res) => {
    const {  nama_role } = req.body;
  
    try {
      // Cek apakah user sudah ada
      const sqlCheck = "SELECT * FROM role WHERE nama_role = ?";
      db.query(sqlCheck, [nama_role], async (err, result) => {
        if (err) {
          console.error("DB Error:", err); // Menampilkan error DB ke console
          return res.status(500).json({ message: "Gagal memeriksa role" });
        }
  
        if (result.length > 0) {
          return res.status(400).json({ message: "Role sudah terdaftar" });
        }

        const sqlInsert = "INSERT INTO role ( nama_role ) VALUES ( ? )";
        db.query(sqlInsert, [ nama_role ], (err, result) => {
          if (err) {
            console.error("DB Error:", err); // Menampilkan error DB ke console
            return res.status(500).json({ message: "Gagal menyimpan role" });
          }
  
          res.status(201).json({ message: "Tambah Role berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error); // Log error yang tidak terduga
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };  

  // STORE ROLE 
  exports.storeRole = async (req, res) => {
    const { id } = req.params;
    const sqlFind = "SELECT * FROM role WHERE id_role = ?";
    db.query(sqlFind, [id], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0)
        return res.status(404).json({ message: "Role tidak ditemukan" });

      res.json(rows[0]); 
    });
  };

  // UPDATE ROLE 
  exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { nama_role } = req.body;

    try {
      // Cek apakah role dengan id itu ada
      const sqlFind = "SELECT * FROM role WHERE id_role = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa role" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Role tidak ditemukan" });
        }

        // Cek duplikasi nama_role lain (optional)
        const sqlDup = "SELECT * FROM role WHERE nama_role = ? AND id_role = ?";
        db.query(sqlDup, [nama_role, id], (err, dup) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal memeriksa duplikasi" });
          }
          if (dup.length > 0) {
            return res.status(400).json({ message: "Nama role sudah digunakan" });
          }

          // Update
          const sqlUpdate = "UPDATE role SET nama_role = ? WHERE id_role = ?";
          db.query(sqlUpdate, [nama_role, id], (err) => {
            if (err) {
              console.error("DB Error:", err);
              return res.status(500).json({ message: "Gagal mengubah role" });
            }
            res.json({ message: "Update Role berhasil!" });
          });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

  // DELETE ROLE
  exports.deleteRole = async (req, res) => {
    const { id } = req.params;       

    try {
      const sqlFind = "SELECT * FROM role WHERE id_role = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa role" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Role tidak ditemukan" });
        }

        // Hapus
        const sqlDelete = "DELETE FROM role WHERE id_role = ?";
        db.query(sqlDelete, [id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal menghapus role" });
          }
          res.json({ message: "Hapus Role berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };
