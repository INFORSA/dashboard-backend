const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.cookies.token; // Ambil token dari header Authorization

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'INFORSA'); // Dekode token menggunakan secret key
    req.user = decoded; // Simpan data user dalam req.user
    next(); // Lanjutkan ke middleware berikutnya
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
