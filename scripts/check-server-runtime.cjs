// Reproduce the module loader used by the deployed server before publishing.
// jwks-rsa must remain compatible with a CommonJS-only loader.
require('firebase-admin/auth');
require('firebase-admin/firestore');
console.log('Firebase Admin: CommonJS OK');
