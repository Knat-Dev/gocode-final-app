const functions = require('firebase-functions');
const { db } = require('./admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.deleteMessagesOnPrivateChannelDelete = functions
    .region('europe-west3')
    .firestore.document('users/{channel_id}')
    .onUpdate((change, context) => {
        if (change.before.data().avatar !== change.after.data().avatar) {
            const batch = db.batch();

            return db
                .collectionGroup('messages')
                .where('displayName', '==', change.before.data().nickname)
                .get()
                .then((data) => {
                    console.log(data.docs.length);

                    const batchArray = [];
                    batchArray.push(db.batch());
                    let operationCounter = 0;
                    let batchIndex = 0;

                    data.forEach((documentSnapshot) => {
                        // update document data here...
                        batchArray[batchIndex].update(documentSnapshot.ref, {
                            avatar: change.after.data().avatar,
                        });
                        operationCounter++;

                        if (operationCounter === 499) {
                            batchArray.push(firestore.batch());
                            batchIndex++;
                            operationCounter = 0;
                        }
                    });

                    batchArray.forEach(async (batch) => await batch.commit());

                    // data.forEach((doc) => {
                    //     batch.update(doc.ref, {
                    //         avatar: change.after.data().avatar,
                    //     });

                    //     // console.log(doc.data());
                    // });
                    // return batch.commit();
                });
        } else return true;
    });
