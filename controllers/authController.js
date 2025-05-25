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
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
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
  res.clearCookie('token');
  res.json({ message: 'Logout berhasil' });
};

exports.me = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Tidak ada token" });

  jwt.verify(token, "INFORSA", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    res.json({ username: decoded.username, role: decoded.role });
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
        if (role === "BPI"){
          roleChoosen = 1;
        }else{
          roleChoosen = 2;
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