const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    const sql = 'SELECT anggota.*, departemen.keterangan as nama_departemen FROM anggota JOIN departemen ON anggota.depart_id = departemen.id_depart ORDER BY anggota.depart_id, anggota.nim ASC';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({
        data : result,
        total : result.length
      });
    });
  };

  // STORE ROLE 
  exports.storeUser = async (req, res) => {
    const { id } = req.params;
    const sqlFind = `
      SELECT u.id_user, u.username, u.role, p.dept_id, p.jabatan, p.keterangan
      FROM user u
      LEFT JOIN pengurus p ON u.id_user = p.user_id
      WHERE u.id_user = ?`;
    db.query(sqlFind, [id], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });

      res.json(rows[0]); 
    });
  };

  exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role, dept_id, jabatan, keterangan } = req.body;

    try {
      // Cek user sekali saja
      const sqlFind = `
        SELECT u.*, p.dept_id, p.jabatan, p.keterangan
        FROM user u
        LEFT JOIN pengurus p ON u.id_user = p.user_id
        WHERE u.id_user = ?
      `;
      db.query(sqlFind, [id], async (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa User" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const currentUser = rows[0];

        // Cek apakah username berubah
        if (username !== currentUser.username) {
          // Cek duplikasi username
          const sqlDup = "SELECT * FROM user WHERE username = ? AND id_user != ?";
          const dupCheck = await new Promise((resolve, reject) => {
            db.query(sqlDup, [username, id], (err, dup) => {
              if (err) return reject(err);
              resolve(dup);
            });
          });
          if (dupCheck.length > 0) {
            return res.status(400).json({ message: "Username sudah digunakan" });
          }
        }

        // Update user (jika username atau role berubah)
        if (username !== currentUser.username || role !== currentUser.role) {
          const sqlUpdateUser = "UPDATE user SET username = ?, role = ? WHERE id_user = ?";
          await new Promise((resolve, reject) => {
            db.query(sqlUpdateUser, [username, role, id], (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        }

        // Update / Insert pengurus hanya jika role BPH
        if (role === 2 || role === "BPH") {
          if (currentUser.dept_id) {
            // Sudah ada pengurus → update
            const sqlUpdatePengurus = `
              UPDATE pengurus
              SET dept_id = ?, jabatan = ?, keterangan = ?
              WHERE user_id = ?
            `;
            await new Promise((resolve, reject) => {
              db.query(sqlUpdatePengurus, [dept_id, jabatan, keterangan, id], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          } else {
            // Belum ada → insert
            const sqlInsertPengurus = `
              INSERT INTO pengurus (user_id, dept_id, jabatan, keterangan)
              VALUES (?, ?, ?, ?)
            `;
            await new Promise((resolve, reject) => {
              db.query(sqlInsertPengurus, [id, dept_id, jabatan, keterangan], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          }
        }

        res.json({ message: "Update berhasil!" });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };


  exports.updateUsername = async (req, res) => {
    const { usernameLama, usernameBaru, role } = req.body;
    console.log(usernameLama, usernameBaru, role);

    try {
      // Cek apakah role dengan id itu ada
      const sqlFind = "SELECT * FROM user WHERE username = ?";
      db.query(sqlFind, [usernameLama], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa User" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Cek duplikasi nama_role lain (optional)
        const sqlDup = "SELECT * FROM user WHERE username = ?";
        db.query(sqlDup, [usernameBaru], (err, dup) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal memeriksa duplikasi" });
          }
          if (dup.length > 0) {
            return res.status(400).json({ message: "Nama sudah digunakan" });
          }

          // Update
          const sqlUpdate = "UPDATE user SET username = ? WHERE username = ?";
          db.query(sqlUpdate, [usernameBaru, usernameLama], (err) => {
            if (err) {
              console.error("DB Error:", err);
              return res.status(500).json({ message: "Gagal mengubah Username" });
            }
             const newToken = jwt.sign({ username: usernameBaru, role: role }, "INFORSA", {
              expiresIn: "1h",
            });

            res.cookie("token", newToken, {
              httpOnly: true,
              secure: true,
              sameSite: "None",
              maxAge: 60 * 60 * 1000,
            });
            res.json({ message: "Update User berhasil!" });
          });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

  exports.updateAnggota = (req, res) => {
    const { id } = req.params;
    const { username, nim, gender, departemen } = req.body;

    // Cek apakah anggota dengan ID tersebut ada
    const sqlFind = "SELECT * FROM anggota WHERE user_id = ?";
    db.query(sqlFind, [id], (err, rows) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Gagal memeriksa data anggota" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ message: "Anggota tidak ditemukan" });
      }

      // Cek duplikasi NIM untuk anggota lain (jika perlu)
      const sqlDup = "SELECT * FROM anggota WHERE nim = ? AND user_id != ?";
      db.query(sqlDup, [nim, id], (err, dup) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa duplikasi NIM" });
        }
        if (dup.length > 0) {
          return res.status(400).json({ message: "NIM sudah digunakan oleh anggota lain" });
        }

        // Lanjut update
        const sqlUpdate = `
          UPDATE anggota 
          SET nama_staff = ?, nim = ?, gender = ?, depart_id = ? 
          WHERE user_id = ?
        `;
        db.query(sqlUpdate, [username, nim, gender, departemen, id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal mengubah data anggota" });
          }
          res.json({ message: "Update data anggota berhasil!" });
        });
      });
    });
  };

  // STORE ANGGOTA 
  exports.storeAnggota = async (req, res) => {
    const { id } = req.params;
    const sqlFind = "SELECT * FROM anggota WHERE user_id = ?";
    db.query(sqlFind, [id], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0)
        return res.status(404).json({ message: "Role tidak ditemukan" });

      res.json(rows[0]); 
    });
  };

  exports.deleteUser = async (req, res) => {
    const { id } = req.params;       

    try {
      const sqlFind = "SELECT * FROM user WHERE id_user = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa user" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Hapus
        const sqlDelete = "DELETE FROM user WHERE id_user = ?";
        db.query(sqlDelete, [id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal menghapus user" });
          }
          res.json({ message: "Hapus User berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

  exports.getAnggotaByNama = (req, res) => {
      const { nama } = req.params;
      const sql = 'SELECT anggota.*, departemen.keterangan as nama_departemen, departemen.nilai as nilai FROM anggota JOIN departemen ON anggota.depart_id = departemen.id_depart WHERE nama_staff = ? ORDER BY anggota.depart_id, anggota.nim  ASC';
      db.query(sql, [nama], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
      });
    };

  exports.getUserByNama = (req, res) => {
      const { nama } = req.params;
      const sql = `SELECT * FROM user WHERE username = ?`;
      db.query(sql, [nama], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send(result);
      });
    };

  exports.getAnggotaByDepart = (req, res) => {
    const { depart } = req.params;
    const sql = 'SELECT anggota.*, departemen.keterangan as nama_departemen, departemen.nama as depart FROM anggota JOIN departemen ON anggota.depart_id = departemen.id_depart WHERE departemen.nama = ? ORDER BY anggota.depart_id, anggota.nim ASC';
    db.query(sql, [depart], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({
          data : result,
          total : result.length
        });
    });
  };

  exports.getInti = (req, res) => {
    const sql = 'SELECT DISTINCT penilai FROM view_penilaian_departemen';
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

  //PASWORD
  exports.changePassword = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Tidak ada token" });

    jwt.verify(token, "INFORSA", async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Token tidak valid" });

      const { username } = decoded;
      const { passwordLama, passwordBaru, konfirmasiPassword } = req.body;
      // console.log(passwordLama, passwordBaru, konfirmasiPassword)

      if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
        return res.status(400).json({ message: "Lengkapi semua field" });
      }

      if (passwordBaru !== konfirmasiPassword) {
        return res.status(400).json({ message: "Konfirmasi password tidak cocok" });
      }

      db.query("SELECT * FROM user WHERE username = ?", [username], async (err, result) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal mengambil data user" });
        }

        const user = result[0];
        const match = await bcrypt.compare(passwordLama, user.password);

        if (!match) {
          return res.status(400).json({ message: "Password lama salah" });
        }

        const hashedPassword = await bcrypt.hash(passwordBaru, 10);
        db.query("UPDATE user SET password = ? WHERE username = ?", [hashedPassword, username], (err) => {
          if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ message: "Gagal memperbarui password" });
          }

          res.json({ message: "Password berhasil diperbarui" });
        });
      });
    });
  };
