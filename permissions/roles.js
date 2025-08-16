const AccessControl = require('accesscontrol');
const ac = new AccessControl();

ac.grant('user')
  .readOwn('profile');

ac.grant('staff')
  .extend('user')
  .updateOwn('profile')
  .readOwn('penilaian');

ac.grant('admin')
  .extend('staff')
  .createAny('penilaian')
  .updateAny('penilaian')
  .deleteAny('penilaian')
  .readAny('penilaian')
  .readAny('profile');

ac.grant('superadmin')
    .extend('admin')
    .readAny('departemen')
    .createAny('departemen')
    .updateAny('departemen')
    .deleteAny('departemen')
    .readAny('departemen');

ac.grant('dosen')
  .extend('user')
  .readAny('penilaian');

module.exports = ac;