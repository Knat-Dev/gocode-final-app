import React, { useEffect } from 'react';
import {
    Badge,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    makeStyles,
} from '@material-ui/core';
import firebase from '../../../firebase/firebase';
import { useState } from 'react';
import {
    startSetSelectedChannel,
    setPrivateChannel,
    setClassRoom,
} from '../../../redux/actions/channel';
import { connect } from 'react-redux';
import { closeDrawer } from '../../../redux/actions/ui';
import { setMessagesLoading } from '../../../redux/actions/messages';
import { addFriendStatus } from '../../../redux/actions/cache';

const useStyles = makeStyles((theme) => ({
    avatar: {
        width: theme.spacing(6),
        height: theme.spacing(6),
    },
    onlineBadge: {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            zIndex: 5000,
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: `$ripple infinite 1.4s cubic-bezier(0.17, 0.68, 0.35, 0.74)`,
            border: '1.4px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2)',
            opacity: 0,
        },
    },
    offlineBadge: {
        backgroundColor: '#8f8f8f',
        color: '#8f8f8f',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 'auto',
            left: 'auto',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    awayBadge: {
        backgroundColor: '#fcba03',
        color: '#fcba03',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 'auto',
            left: 'auto',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid currentColor',
            content: '""',
        },
    },
}));

const FriendListItem = ({
    private_channels,
    friend,
    startSetSelectedChannel,
    selectedChannelId,
    setPrivateChannel,
    closeDrawer,
    setMessagesLoading,
    addFriendStatus,
    setClassRoom,
}) => {
    const classes = useStyles();
    const [state, setState] = useState('offline');

    useEffect(() => {
        const { displayName, uid } = friend;
        const connectionsRef = firebase.database().ref(`connections/${uid}`);
        let status = '';
        const listener = connectionsRef.on('value', (snapshot) => {
            if (snapshot.val() === null) {
                status = 'offline';
                setState(status);
                addFriendStatus(displayName, status);
            } else {
                const arr = Object.values(snapshot.val());
                let away = 0;
                const len = arr.length;
                arr.forEach((item) => {
                    if (item.state === 'away') away++;
                });
                if (away === len) {
                    status = 'away';
                    setState(status);
                    addFriendStatus(displayName, status);
                } else {
                    status = 'online';
                    setState(status);
                    addFriendStatus(displayName, status);
                }
            }
        });
        return () => {
            connectionsRef.off('value', listener);
        };
    }, [addFriendStatus, friend]);

    const createOrJoinPrivateChannel = () => {
        const [u1, u2] = selectedChannelId.split('_');

        if (private_channels && friend.uid !== u1 && friend.uid !== u2) {
            let count = 0;
            private_channels.forEach((channel) => {
                const [u1, u2] = channel.channel_id.split('_');

                if (
                    u1 === friend.uid ||
                    (u2 === friend.uid &&
                        channel.channel_id !== selectedChannelId)
                ) {
                    setMessagesLoading();
                    setClassRoom(false);
                    setPrivateChannel(true);
                    startSetSelectedChannel(channel, true);
                    closeDrawer();
                    count++;
                }
            });
            if (count !== 1) {
                console.log('creating channel');
                const { uid, displayName } = firebase.auth().currentUser;
                const channel_id =
                    uid < friend.uid
                        ? `${uid}_${friend.uid}`
                        : `${friend.uid}_${uid}`;

                const privateChannelItem = {
                    admin: uid,
                    channel_name: friend.displayName,
                    message_count: 0,
                };

                const batch = firebase.firestore().batch();

                const privateChannel = firebase
                    .firestore()
                    .collection('private_channels')
                    .doc(channel_id);
                batch.set(privateChannel, {
                    ...privateChannelItem,
                    channel_id,
                });

                const channelInitiator = {
                    admin: uid,
                    channel_id,
                    channel_name: friend.displayName,
                    message_count: 0,
                };

                const channelReceiver = {
                    admin: uid,
                    channel_id,
                    channel_name: displayName,
                    message_count: 0,
                };

                const initiatorChannel = firebase
                    .firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('private_channels')
                    .doc(channel_id);
                batch.set(initiatorChannel, channelInitiator);

                const receiverChannel = firebase
                    .firestore()
                    .collection('users')
                    .doc(friend.uid)
                    .collection('private_channels')
                    .doc(channel_id);
                batch.set(receiverChannel, channelReceiver);

                batch.commit().then(async () => {
                    const channelDoc = firebase
                        .firestore()
                        .collection('private_channels')
                        .doc(channel_id);
                    try {
                        const res = await firebase
                            .firestore()
                            .runTransaction(async (t) => {
                                const doc = await t.get(channelDoc);
                                console.log('tested');
                                const message_count = doc.data().message_count;

                                firebase
                                    .firestore()
                                    .collection('users')
                                    .doc(uid)
                                    .collection('private_channels')
                                    .doc(channel_id)
                                    .collection('info')
                                    .doc('data')
                                    .set({ message_count });

                                firebase
                                    .firestore()
                                    .collection('users')
                                    .doc(friend.uid)
                                    .collection('private_channels')
                                    .doc(channel_id)
                                    .collection('info')
                                    .doc('data')
                                    .set({ message_count });

                                return `Message count = ${message_count}`;
                            });
                        console.log('Transaction success', res);
                    } catch (e) {
                        console.log('Transaction failure:', e);
                    }
                });
            }
        }
    };

    return (
        <ListItem
            button
            onClick={createOrJoinPrivateChannel}
            selected={
                friend.uid === String(selectedChannelId).split('_')[0] ||
                friend.uid === String(selectedChannelId).split('_')[1]
                    ? true
                    : false
            }
        >
            <ListItemAvatar>
                {state === 'online' ? (
                    <Badge
                        color="secondary"
                        variant="dot"
                        overlap="circle"
                        classes={{ badge: classes.onlineBadge }}
                        badgeContent=" "
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    >
                        <Avatar
                            className={classes.avatar}
                            alt=""
                            src={friend.avatar}
                        />
                    </Badge>
                ) : state === 'offline' ? (
                    <Badge
                        color="secondary"
                        variant="dot"
                        overlap="circle"
                        classes={{ badge: classes.offlineBadge }}
                        badgeContent=" "
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    >
                        <Avatar
                            className={classes.avatar}
                            alt=""
                            src={friend.avatar}
                        />
                    </Badge>
                ) : (
                    <Badge
                        color="secondary"
                        variant="dot"
                        overlap="circle"
                        classes={{ badge: classes.awayBadge }}
                        badgeContent=" "
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    >
                        <Avatar
                            className={classes.avatar}
                            alt=""
                            src={friend.avatar}
                        />
                    </Badge>
                )}
            </ListItemAvatar>
            <ListItemText>{friend.displayName}</ListItemText>
        </ListItem>
    );
};

const mapStateToProps = (state) => ({
    private_channels: state.user.private_channels,
    selectedChannelId: state.channel.channel_id,
});
export default connect(mapStateToProps, {
    startSetSelectedChannel,
    setMessagesLoading,
    setPrivateChannel,
    closeDrawer,
    addFriendStatus,
    setClassRoom,
})(FriendListItem);
