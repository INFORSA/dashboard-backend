const express = require('express');
const router = express.Router();
const { login, registerAdmin, me, logout } = require('../controllers/authController');
const { registerStaff } = require('../controllers/registController');
const authenticate = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/auth', login);
router.post('/logout', logout);
router.get('/me', me);
router.get('/check-role', authenticate, (req, res) => {
    const role = req.user.role;
    res.json({ currentRole: role });
  });
router.post('/register/staff', upload.single('gambar'), registerStaff);
router.post('/register/admin', upload.none(), registerAdmin);
  

module.exports = router;
