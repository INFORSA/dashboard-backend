const express = require('express');
const { getUser, getAnggota, getRole, addRole, updateRole, deleteRole, storeRole } = require('../controllers/userController');
const router = express.Router();
const upload = require('../middleware/upload');

router.get('/get', getUser);
router.get('/get/anggota', getAnggota);
router.get('/get/role', getRole);
router.get('/get/role/:id', storeRole);
router.post('/add/role', upload.none(), addRole);
router.put("/update/role/:id", upload.none(), updateRole);
router.delete("/remove/role/:id", deleteRole);

module.exports = router;