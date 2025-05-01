const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/auth', login);
router.get('/check-role', authenticate, (req, res) => {
    const role = req.user.role;
    res.json({ currentRole: role });
  });
router.post('/register', register);
  

module.exports = router;
