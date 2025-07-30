const ac = require('../permissions/roles');

function authorize(action, resource) {
  return (req, res, next) => {
    const role = req.user?.role; // Memeriksa role dari req.user yang sudah terisi
    const username = req.user?.username;
    if (!role) return res.status(401).json({ message: 'Unauthorized' });

    // if (role === 'superadmin') {
    //   const permission = ac.can(role)['readAny'](resource);
    //   if (permission.granted) return next();
    // }

    const permission = ac.can(role)[action](resource); // Memeriksa izin berdasarkan role, action, dan resource
    if (!permission.granted) {
      return res.status(403).json({ message: 'Forbidden: No permission' });
    }
    if (action.includes('Own')) {
      return next();
    }
    next(); // Jika ada izin, lanjutkan ke handler berikutnya
  };
}

module.exports = authorize;