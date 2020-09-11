import {
    LOGIN,
    LOGOUT,
    SET_USER_NOTIFICATIONS,
    SET_USER_FRIENDS,
    SET_USER_PRIVATE_CHANNELS,
    SET_TEACHER,
    SET_USER_CLASS_ROOMS,
} from '../types';
import firebase from '../../firebase/firebase';
import {
    startSetSelectedChannel,
    setPrivateChannel,
    setClassRoom,
} from './channel';

export const login = (uid, displayName, photoURL) => (dispatch, getState) => {
    dispatch({
        type: LOGIN,
        payload: {
            uid,
            displayName,
            photoURL,
        },
    });
};

export const logout = () => (dispatch, getState) => {
    firebase
        .auth()
        .signOut()
        .then(() => {
            dispatch({
                type: LOGOUT,
            });
        });
};

export const setUserNotifications = () => (dispatch, getState) => {
    const uid = getState().user.uid;

    firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('notifications')
        .onSnapshot((snapshot) => {
            let notifications = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'removed') {
                    // console.log(
                    //     'This item will no longer be available: ',
                    //     change.doc.data()
                    // );
                    notifications = notifications.filter((notification) => {
                        return (
                            notification.notification_id !==
                            change.doc.data().notification_id
                        );
                    });
                    // console.log(notifications);
                    dispatch({
                        type: SET_USER_NOTIFICATIONS,
                        payload: notifications,
                    });
                }
            });
            if (!snapshot.empty) {
                snapshot.forEach((childSnapshot, i) => {
                    notifications.push(childSnapshot.data());
                });
                // console.log(notifications);
                dispatch({
                    type: SET_USER_NOTIFICATIONS,
                    payload: notifications,
                });
            }
        });
    // firebase
    //     .firestore()
    //     .collection('users')
    //     .doc(uid)
    //     .collection('friend-requests')
    //     .onSnapshot((snapshot) => {
    //         snapshot.docChanges().forEach((change) => {
    //             if (change.type === 'removed') {
    //                 {
    //                     console.log(
    //                         "friend request doesn't exist: ",
    //                         change.doc.data()
    //                     );
    //                     notifications = notifications.filter((notification) => {
    //                         return (
    //                             !notification.friendRequest ||
    //                             notification.uid !== change.doc.data().uid
    //                         );
    //                     });
    //                     dispatch({
    //                         type: SET_USER_NOTIFICATIONS,
    //                         payload: notifications,
    //                     });
    //                 }
    //             }
    //         });
    //         if (!snapshot.empty) {
    //             snapshot.forEach((childSnapshot) => {
    //                 notifications.push({
    //                     ...childSnapshot.data(),
    //                     friendRequest: true,
    //                 });
    //             });
    //             dispatch({
    //                 type: SET_USER_NOTIFICATIONS,
    //                 payload: notifications,
    //             });
    //         }
    //     });
    // firebase
    //     .firestore()
    //     .collection('users')
    //     .doc(uid)
    //     .collection('friends-pending')
    //     .onSnapshot((snapshot) => {
    //         snapshot.docChanges().forEach((change) => {
    //             if (change.type === 'removed') {
    //                 {
    //                     console.log(
    //                         'No longer pending, user cancelled his request:',
    //                         change.doc.data()
    //                     );
    //                     notifications = notifications.filter((notification) => {
    //                         return (
    //                             !notification.pending ||
    //                             notification.uid !== change.doc.data().uid
    //                         );
    //                     });
    //                     console.log('updated notifications!');
    //                     dispatch({
    //                         type: SET_USER_NOTIFICATIONS,
    //                         payload: notifications,
    //                     });
    //                 }
    //             }
    //         });
    //         if (!snapshot.empty) {
    //             console.log('updated notifications!');

    //             snapshot.forEach((childSnapshot) => {
    //                 notifications.push({
    //                     ...childSnapshot.data(),
    //                     pending: true,
    //                 });
    //             });

    //             dispatch({
    //                 type: SET_USER_NOTIFICATIONS,
    //                 payload: notifications,
    //             });
    //         }
    //     });
};

export const setUserFriends = () => (dispatch, getState) => {
    const { uid } = getState().user;
    firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('friends')
        .orderBy('displayName', 'asc')
        .onSnapshot((snapshot) => {
            let friends = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'removed') {
                    // console.log(
                    //     'This item will no longer be available: ',
                    //     change.doc.data()
                    // );
                    // console.log(notifications);
                    dispatch({
                        type: SET_USER_FRIENDS,
                        payload: friends.filter((friend) => {
                            console.log(friend.uid, change.doc.data().uid);
                            return friend.uid !== change.doc.data().uid;
                        }),
                    });
                }
            });
            if (!snapshot.empty) {
                snapshot.forEach((childSnapshot, i) => {
                    friends.push(childSnapshot.data());
                });
                // console.log(notifications);
                dispatch({
                    type: SET_USER_FRIENDS,
                    payload: friends,
                });
            }
        });
};

export const setUserPrivateChannels = () => (dispatch, getState) => {
    const { uid } = getState().user;
    firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('private_channels')
        .onSnapshot((snapshot) => {
            let arr = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'removed') {
                    // console.log(
                    //     'This item will no longer be available: ',
                    //     change.doc.data()
                    // );

                    const removedPrivateChannel = change.doc.data();
                    console.log(removedPrivateChannel);
                    const selectedChannelId = getState().channel.channel_id;

                    if (
                        selectedChannelId === removedPrivateChannel.channel_id
                    ) {
                        console.log('removed current channel');
                        const userChannels = getState().channels.userChannels;
                        const private_channels = getState().user.private_channels.filter(
                            (channel) =>
                                channel.channel_id !== selectedChannelId
                        );

                        if (private_channels.length > 0) {
                            console.log('test');
                            dispatch(setPrivateChannel(true));
                            dispatch(
                                startSetSelectedChannel(
                                    private_channels[0],
                                    true
                                )
                            );
                        } else if (userChannels.length > 0) {
                            console.log('hi');
                            dispatch(setPrivateChannel(false));
                            dispatch(
                                startSetSelectedChannel(userChannels[0], false)
                            );
                        }
                    }
                }
            });

            snapshot.forEach((childSnapshot) => {
                arr = arr.concat(childSnapshot.data());
                console.log(arr);
            });
            dispatch({
                type: SET_USER_PRIVATE_CHANNELS,
                payload: arr,
            });
            // if(arr.length>0)
            // {
            //     setPrivateChannel(true);
            //     startSetSelectedChannel(
            //         {
            //             ...privateChannelItem,
            //             channel_id: channel_id,
            //         },
            //         true
            //     );
            // }
        });
};

export const setTeacher = (uid) => (dispatch) => {
    return firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .get()
        .then((snap) => {
            if (snap.data().teacher) dispatch({ type: SET_TEACHER });
        });
};

export const setClassRooms = () => (dispatch, getState) => {
    const isTeacher = getState().user.teacher;
    const uid = getState().user.uid;
    if (isTeacher) {
        console.log('user is a teacher, fetching his channels');
        firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('class_rooms')
            .onSnapshot((snapshot) => {
                let arr = [];

                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'removed') {
                        // console.log(
                        //     'This item will no longer be available: ',
                        //     change.doc.data()
                        // );

                        const removedClassRoom = change.doc.data();
                        console.log(removedClassRoom);
                        const selectedChannelId = getState().channel.channel_id;

                        if (selectedChannelId === removedClassRoom.channel_id) {
                            console.log('removed current class room');
                            const userChannels = getState().channels
                                .userChannels;
                            const private_channels = getState().user
                                .private_channels;

                            const class_rooms = getState().user.class_rooms.filter(
                                (channel) =>
                                    channel.channel_id !== selectedChannelId
                            );

                            if (class_rooms.length > 0) {
                                console.log('test');
                                dispatch(setPrivateChannel(false));
                                dispatch(setClassRoom(true));
                                dispatch(
                                    startSetSelectedChannel(
                                        class_rooms[0],
                                        false,
                                        true
                                    )
                                );
                            } else if (userChannels.length > 0) {
                                console.log('hi');
                                dispatch(setPrivateChannel(false));
                                dispatch(setClassRoom(false));
                                dispatch(
                                    startSetSelectedChannel(
                                        userChannels[0],
                                        false
                                    )
                                );
                            } else if (private_channels.length > 0) {
                                console.log('hi');
                                dispatch(setPrivateChannel(true));
                                dispatch(setClassRoom(false));
                                dispatch(
                                    startSetSelectedChannel(
                                        userChannels[0],
                                        false
                                    )
                                );
                            }
                        }
                    }
                });

                snapshot.forEach((childSnapshot) => {
                    arr = arr.concat(childSnapshot.data());
                    console.log(arr);
                });
                dispatch({
                    type: SET_USER_CLASS_ROOMS,
                    payload: arr,
                });
            });
    }
};
