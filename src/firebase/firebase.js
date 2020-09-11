import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import config from './config';

firebase.initializeApp(config);
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
        console.log('Woohoo! Multi-Tab Persistence!');
    })
    .catch(function (err) {
        if (err.code === 'failed-precondition') {
            console.log('hi');
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
        } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }
    });

export { firebase as default };
