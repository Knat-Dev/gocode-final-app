import firebase from '../firebase/firebase';

export const acceptFriendRequest = (to, userData) => {
    const batch = firebase.firestore().batch();
    const deleteFriendRequestNotification = firebase
        .firestore()
        .collection('users')
        .doc(to)
        .collection('notifications')
        .doc(`friend-request_from_${userData.uid}_to_${to}`);

    batch.delete(deleteFriendRequestNotification);

    const deleteawaitingRequest = firebase
        .firestore()
        .collection('users')
        .doc(userData.uid)
        .collection('notifications')
        .doc(`awaiting-friendship-request_from_${userData.uid}_to_${to}`);

    batch.delete(deleteawaitingRequest);

    const user = firebase.auth().currentUser;
    const receiver = {
        displayName: user.displayName,
        uid: to,
        avatar: user.photoURL,
    };
    const addFriendOnReceiverEnd = firebase
        .firestore()
        .collection('users')
        .doc(userData.uid)
        .collection('friends')
        .doc(to);

    batch.set(addFriendOnReceiverEnd, receiver);

    const sender = {
        displayName: userData.nickname,
        uid: userData.uid,
        avatar: userData.avatar,
    };
    const addFriendOnSenderEnd = firebase
        .firestore()
        .collection('users')
        .doc(to)
        .collection('friends')
        .doc(userData.uid);

    batch.set(addFriendOnSenderEnd, sender);

    // send notification to other user
    const notificationRef = firebase
        .firestore()
        .collection('users')
        .doc(userData.uid)
        .collection('notifications')
        .doc(`friends_${userData.uid}_${to}`);
    const notification = {
        notification_id: notificationRef.id,
        displayName: user.displayName,
        type: 'friends',
        timestamp: new Date().getTime(),
        avatar: user.photoURL,
        read: false,
    };
    batch.set(notificationRef, notification);
    batch.commit();
};
