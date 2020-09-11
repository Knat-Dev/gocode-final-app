import React, { useEffect } from 'react';
import { Button } from '@material-ui/core';
import firebase from '../../firebase/firebase';
import { connect } from 'react-redux';
import { setFriendRequestPending } from '../../redux/actions/cache';
import { useState } from 'react';
import { acceptFriendRequest } from '../../util/helperFunctions';
import {
    startSetSelectedChannel,
    setPrivateChannel,
} from '../../redux/actions/channel';

const AddFriend = ({
    userPopovers,
    senderId,
    userData,
    setFriendRequestPending,
    notifications,
    user,
    friends,
    startSetSelectedChannel,
    userChannels,
    private_channels,
    selectedChannelId,
    setPrivateChannel,
    accountDrawer,
    currentAccount,
}) => {
    const [requestSent, setRequestSent] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [alreadyFriends, setAlreadyFriends] = useState(false);

    // useEffect(() => {
    //     setRequestPending(
    //         userPopovers[userData.nickname] &&
    //             userPopovers[userData.nickname].pending
    //     );
    // }, [userPopovers]);

    useEffect(() => {
        const notificArr = notifications.filter((notification) => {
            return (
                notification.from === user.uid &&
                notification.to === userData.uid
            );
        });
        console.log(notificArr);
        console.log(notificArr.length === 0);
        setRequestSent(notificArr.length === 0 ? false : true);
    }, [user.notifications, notifications, user.uid, userData.uid]);

    useEffect(() => {
        const notificArr = notifications.filter((notification) => {
            return (
                notification.from === userData.uid &&
                notification.to === user.uid &&
                (notification.type === 'friend-request' ||
                    notification.type === 'awaiting-friendship-request')
            );
        });
        setRequestPending(notificArr.length >= 1 ? true : false);
    }, [user.notifications, notifications, user.uid, userData.uid]);

    useEffect(() => {
        if (accountDrawer && currentAccount.uid) {
            const friendArr = friends.filter(
                (friend) => friend.uid === currentAccount.uid
            );
            console.log(friendArr);
            setAlreadyFriends(friendArr.length === 1 ? true : false);
        }
    }, [currentAccount, friends, accountDrawer]);

    const handleDeleteRequest = () => {
        const batch = firebase.firestore().batch();
        const DeleteAwaitingRequest = firebase
            .firestore()
            .collection('users')
            .doc(senderId)
            .collection('notifications')
            .doc(
                `awaiting-friendship-request_from_${senderId}_to_${userData.uid}`
            );
        batch.delete(DeleteAwaitingRequest);

        const DeleteFriendRequest = firebase
            .firestore()
            .collection('users')
            .doc(userData.uid)
            .collection('notifications')
            .doc(`friend-request_from_${senderId}_to_${userData.uid}`);
        batch.delete(DeleteFriendRequest);

        batch.commit();
    };

    const handleSendRequest = () => {
        const user = firebase.auth().currentUser;
        const batch = firebase.firestore().batch();
        const awaitingRequest = firebase
            .firestore()
            .collection('users')
            .doc(senderId)
            .collection('notifications')
            .doc(
                `awaiting-friendship-request_from_${senderId}_to_${userData.uid}`
            );
        const requestObject = {
            notification_id: awaitingRequest.id,
            to_displayName: userData.nickname,
            to: userData.uid,
            from_displayName: user.displayName,
            from: senderId,
            type: 'awaiting-friendship-request',
            timestamp: new Date().getTime(),
            avatar: userData.avatar,
            read: false,
        };
        batch.set(awaitingRequest, requestObject);

        const friendRequest = firebase
            .firestore()
            .collection('users')
            .doc(userData.uid)
            .collection('notifications')
            .doc(`friend-request_from_${senderId}_to_${userData.uid}`);
        const friendRequestObject = {
            notification_id: friendRequest.id,
            to_displayName: userData.nickname,
            to: userData.uid,
            from_displayName: user.displayName,
            from: senderId,
            type: 'friend-request',
            timestamp: new Date().getTime(),
            avatar: user.photoURL,
            read: false,
        };
        batch.set(friendRequest, friendRequestObject);

        batch.commit();
    };

    // const handleClick = () => {
    //     console.log('Sending a friend request...');
    //     const user = firebase.auth().currentUser;
    //     const friendRequest = {
    //         uid: user.uid,
    //         displayName: user.displayName,
    //         timestamp: new Date().getTime(),
    //         avatar: user.photoURL,
    //         read: false,
    //     };

    //     const batch = firebase.firestore().batch();
    //     const friendRequestSend = firebase
    //         .firestore()
    //         .collection('users')
    //         .doc(userData.uid)
    //         .collection('friend-requests')
    //         .doc(senderId);
    //     batch.set(friendRequestSend, friendRequest);

    //     const request = {
    //         uid: userData.uid,
    //         displayName: userData.nickname,
    //         timestamp: new Date().getTime(),
    //         avatar: userData.avatar,
    //         read: false,
    //     };
    //     const friendRequestPending = firebase
    //         .firestore()
    //         .collection('users')
    //         .doc(senderId)
    //         .collection('friends-pending')
    //         .doc(userData.uid);
    //     batch.set(friendRequestPending, request);

    //     batch.commit();
    //     setFriendRequestPending(true, userData.nickname);
    // };

    // const handleRemoveRequest = () => {
    //     console.log('Cacelling request...');
    //     const user = firebase.auth().currentUser;

    //     const batch = firebase.firestore().batch();

    //     const friendRequestToDelete = firebase
    //         .firestore()
    //         .collection('users')
    //         .doc(userData.uid)
    //         .collection('friend-requests')
    //         .doc(senderId);
    //     batch.delete(friendRequestToDelete);

    //     const deleteFriendRequestPending = firebase
    //         .firestore()
    //         .collection('users')
    //         .doc(senderId)
    //         .collection('friends-pending')
    //         .doc(userData.uid);
    //     batch.delete(deleteFriendRequestPending);

    //     batch.commit();
    //     setFriendRequestPending(false, userData.nickname);
    // };

    const unfriend = () => {
        const privateChannelId =
            senderId < userData.uid
                ? `${senderId}_${userData.uid}`
                : `${userData.uid}_${senderId}`;

        const batch = firebase.firestore().batch();
        const deleteFriendRequestNotification = firebase
            .firestore()
            .collection('users')
            .doc(senderId)
            .collection('friends')
            .doc(userData.uid);

        batch.delete(deleteFriendRequestNotification);

        const deleteawaitingRequest = firebase
            .firestore()
            .collection('users')
            .doc(userData.uid)
            .collection('friends')
            .doc(senderId);

        batch.delete(deleteawaitingRequest);

        const deletePastFriendshipNotification1 = firebase
            .firestore()
            .collection('users')
            .doc(userData.uid)
            .collection('notifications')
            .doc(`friends_${userData.uid}_${senderId}`);
        batch.delete(deletePastFriendshipNotification1);

        const deletePastFriendshipNotification2 = firebase
            .firestore()
            .collection('users')
            .doc(senderId)
            .collection('notifications')
            .doc(`friends_${senderId}_${userData.uid}`);
        batch.delete(deletePastFriendshipNotification2);

        const deletePrivateChatFriend1 = firebase
            .firestore()
            .collection('users')
            .doc(userData.uid)
            .collection('private_channels')
            .doc(privateChannelId);
        batch.delete(deletePrivateChatFriend1);

        const deletePrivateChatFriend2 = firebase
            .firestore()
            .collection('users')
            .doc(senderId)
            .collection('private_channels')
            .doc(privateChannelId);
        batch.delete(deletePrivateChatFriend2);

        // const deletePrivateChatPerma = firebase
        //     .firestore()
        //     .collection('private_channels')
        //     .doc(privateChannelId);
        // batch.delete(deletePrivateChatPerma);

        batch.commit().then(() => {});
    };

    return (
        <>
            {alreadyFriends ? (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={unfriend}
                    // onClick={handleRemoveRequest}
                >
                    UNFRIEND
                </Button>
            ) : requestPending ? (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={() => {
                        acceptFriendRequest(senderId, userData);
                    }}
                    // onClick={handleRemoveRequest}
                >
                    ACCEPT
                </Button>
            ) : requestSent ? (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleDeleteRequest}
                    // onClick={handleRemoveRequest}
                >
                    CANCEL REQUEST
                </Button>
            ) : (
                <Button
                    color="primary"
                    variant="contained"
                    onClick={handleSendRequest}
                    // onClick={handleClick}
                >
                    ADD FRIEND
                </Button>
            )}
        </>
    );
};

const mapStateToProps = (state) => ({
    userPopovers: state.cache.userPopovers,
    notifications: state.user.notifications,
    user: state.user,
    friends: state.user.friends,
    selectedChannelId: state.channel.channel_id,
    channels: state.channels.userChannels,
    private_channels: state.user.private_channels,
    accountDrawer: state.ui.accountDrawer,
    currentAccount: state.ui.currentAccount,
});

export default connect(mapStateToProps, {
    setFriendRequestPending,
    startSetSelectedChannel,
    setPrivateChannel,
})(AddFriend);
