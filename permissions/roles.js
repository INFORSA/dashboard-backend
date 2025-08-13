const AccessControl = require('accesscontrol');
const db = require('../config/db');

async function loadAccessControl() {
  const ac = new AccessControl();

  const [roles] = await db.promise().query('SELECT * FROM role');
  const [permissions] = await db.promise().query('SELECT * FROM permissions');
  const [rolePermissions] = await db.promise().query('SELECT * FROM role_permissions');

  // console.log(roles)
  // console.log(permissions)
  // console.log(rolePermissions)

  // Mapping role → permission list
  const roleMap = {};
  rolePermissions.forEach(rp => {
    const role = roles.find(r => r.id_role === rp.role_id)?.nama_role;
    const perm = permissions.find(p => p.id_permission === rp.permission_id);

    if (!role || !perm) return;

    // Gabungkan action + possession
    const grantAction = perm.action + perm.possession.charAt(0).toUpperCase() + perm.possession.slice(1); // read + Own = readOwn

    if (!roleMap[role]) roleMap[role] = [];
    roleMap[role].push({
      resource: perm.resource,
      action: grantAction
    });
  });

  // Masukkan ke AccessControl
  Object.keys(roleMap).forEach(role => {
    roleMap[role].forEach(perm => {
      ac.grant(role)[perm.action](perm.resource);
    });
  });
  // console.log(ac)
  return ac;
}

module.exports = loadAccessControl;