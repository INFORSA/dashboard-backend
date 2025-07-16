const express = require('express');
const { getUser, getAnggota, getRole, addRole, updateRole, deleteRole, storeRole, getAnggotaByDepart, getAnggotaByNama, deleteUser, storeUser, storeAnggota, getInti, getUserByNama, updateUser, updateAnggota, changePassword, updateUsername } = require('../controllers/userController');
const router = express.Router();
const upload = require('../middleware/upload');
const authenticate = require('../middleware/authMiddleware');

router.get('/get', getUser);
router.get('/get/user/:nama', getUserByNama);
router.get('/store/:id', storeUser);
router.put("/update/:id", upload.none(), updateUser);
router.put("/update-username", upload.none(), updateUsername);
router.delete("/remove/:id", deleteUser);
router.post("/change-password", authenticate, changePassword);

router.get('/get/anggota', getAnggota);
router.get('/get/anggota/:nama', getAnggotaByNama);
router.get('/get/anggota/dept/:depart', getAnggotaByDepart);
router.get('/store/anggota/:id', storeAnggota);
router.put("/update/anggota/:id", upload.none(), updateAnggota);

router.get('/get/bpi', getInti);

router.get('/get/role', getRole);
router.get('/get/role/:id', storeRole);
router.post('/add/role', upload.none(), addRole);
router.put("/update/role/:id", upload.none(), updateRole);
router.delete("/remove/role/:id", deleteRole);


module.exports = router;