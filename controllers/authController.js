const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.login = (req, res) => {
    const { username, password } = req.body;
      const sqlSelect = "SELECT user.*, role.nama_role FROM user JOIN role ON user.role = role.id_role WHERE user.username = ?";
      db.query(sqlSelect, [username], async (err, result) => {
        if (err) {
          console.error('Server error:', err);
          res.status(500).send('Server error');
          return;
        }
    
        if (result.length > 0) {
          const user = result[0];
          // Memeriksa kecocokan password
          try {
            const match = await bcrypt.compare(password, user.password);
    
            if (match) {
              // Password cocok, buat token JWT
              const token = jwt.sign({ username: user.username, role: user.nama_role }, 'INFORSA', { expiresIn: '1h' });
              res.cookie('token', token, {
                httpOnly: true,

                //Local
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: 'strict',

                //Tes Production
                secure: true,
                sameSite: 'None',
                
                maxAge: 60 * 60 * 1000,
              });
              res.json({ message: 'Login sukses'});
            } else {
              // Password tidak cocok
              res.status(401).json({ message: 'Invalid username or password' });
            }
          } catch (error) {
            console.error('Error comparing passwords:', error);
            res.status(500).send('Server error');
          }
        } else {
          // User tidak ditemukan
          res.status(401).json({ message: 'Invalid username or password' });
        }
    });
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,   
    sameSite: 'none',
  });
  res.json({ message: 'Logout berhasil' });
};

exports.me = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Tidak ada token" });

  jwt.verify(token, "INFORSA", async(err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    const { username, role } = decoded;

    if(role === "admin"){
      const sql = `
        SELECT departemen.nama AS nama_departemen, pengurus.keterangan AS keterangan
        FROM user 
        LEFT JOIN pengurus ON user.id_user = pengurus.user_id
        LEFT JOIN departemen ON pengurus.dept_id = departemen.id_depart
        WHERE user.username = ?
        LIMIT 1
      `;

      db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal mengambil data departemen" });

        const departemen = results[0]?.nama_departemen || null;
        const keterangan = results[0]?.keterangan || null;
        return res.json({ username, role, departemen, keterangan });
      });
    }else{
      res.json({ username, role });
    }
  });
};

exports.registerAdmin = async (req, res) => {
    const { username, password, role } = req.body;
  
    try {
      // Cek apakah user sudah ada
      const sqlCheck = "SELECT * FROM user WHERE username = ?";
      db.query(sqlCheck, [username], async (err, result) => {
        if (err) {
          console.error("DB Error:", err); // Menampilkan error DB ke console
          return res.status(500).json({ message: "Gagal memeriksa user" });
        }
  
        if (result.length > 0) {
          return res.status(400).json({ message: "Username sudah terdaftar" });
        }
  
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        var roleChoosen = 1;
        if (role === "BPI" || role === "MPKO"){
          roleChoosen = 1;
        }else if(role === "BPH"){
          roleChoosen = 2;
        }else{
          roleChoosen = 4
        }
        const sqlInsert = "INSERT INTO user (username, password, role) VALUES (?, ?, ?)";
        db.query(sqlInsert, [username, hashedPassword, roleChoosen], (err, result) => {
          if (err) {
            console.error("DB Error:", err); // Menampilkan error DB ke console
            return res.status(500).json({ message: "Gagal menyimpan user" });
          }
  
          res.status(201).json({ message: "Registrasi berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error); // Log error yang tidak terduga
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };  