const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// const realtime = admin.database();

module.exports = { admin, db };
