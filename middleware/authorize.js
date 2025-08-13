const loadAccessControl = require('../permissions/roles');

let acInstance = null;

// Load AC global sekali saat server start
async function getAC() {
  if (!acInstance) {
    acInstance = await loadAccessControl();
  }
  return acInstance;
}

function authorize(action, resource) {
  return async (req, res, next) => {
    const ac = await getAC(); // pakai global instance
    const role = req.user?.role?.toLowerCase();
    if (!role) return res.status(401).json({ message: 'Unauthorized' });

    const permission = ac.can(role)[action]?.(resource);

    // console.log('Authorize check:', { role, action, resource, permission });

    if (!permission || !permission.granted) {
      return res.status(403).json({ message: 'Forbidden: No permission' });
    }

    next();
  };
}

module.exports = authorize;