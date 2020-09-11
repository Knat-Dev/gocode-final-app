import React, { useState, useEffect } from 'react';
import firebase from '../../../firebase/firebase';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Badge,
    makeStyles,
} from '@material-ui/core';
import { ArrowForward } from '@material-ui/icons';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) => ({
    onlineBadge: {
        backgroundColor: '#44b700',
        width: 40,
        borderRadius: 15,
        width: 28,
        height: 14,
        borderRadius: 7,
    },
    offlineBadge: {
        backgroundColor: '#8f8f8f',
        width: 40,
        borderRadius: 15,
        width: 28,
        height: 14,
        borderRadius: 7,
    },
    awayBadge: {
        backgroundColor: '#fcba03',
        width: 28,
        height: 14,
        borderRadius: 7,
    },
}));

const PrivateChannelItem = ({
    channel,
    selectedChannelId,
    uid,
    handleSelectChannel,
    friendStatuses,
}) => {
    const classes = useStyles();
    const [total, setTotal] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        return firebase
            .firestore()
            .collection('private_channels')
            .doc(channel.channel_id)
            .onSnapshot((snap) => {
                setUnreadMessages(snap.data().message_count - total);
            });
    }, [total]);

    useEffect(() => {
        if (selectedChannelId) {
            return firebase
                .firestore()
                .collection('users')
                .doc(uid)
                .collection('private_channels')
                .doc(channel.channel_id)
                .collection('info')
                .doc('data')
                .onSnapshot(async (snap) => {
                    const data = await snap.data();
                    if (data && data.message_count)
                        setTotal(data.message_count);
                });
        }
    }, [selectedChannelId]);

    return (
        <ListItem
            key={channel.channel_id}
            button
            onClick={() => handleSelectChannel(channel)}
            selected={channel.channel_id === selectedChannelId ? true : false}
        >
            <ListItemIcon>
                <Badge
                    variant="dot"
                    badgeContent=" "
                    style={{ margin: `0 20px` }}
                    classes={{
                        badge:
                            friendStatuses[channel.channel_name] === 'away'
                                ? classes.awayBadge
                                : friendStatuses[channel.channel_name] ===
                                  'online'
                                ? classes.onlineBadge
                                : classes.offlineBadge,
                    }}
                />
            </ListItemIcon>
            <ListItemText>{channel.channel_name}</ListItemText>
            <ListItemSecondaryAction>
                <Badge
                    color={'primary'}
                    badgeContent={unreadMessages >= 0 ? unreadMessages : 0}
                />
            </ListItemSecondaryAction>
        </ListItem>
    );
};

const mapStateToProps = (state) => ({
    selectedChannelId: state.channel.channel_id,
    uid: state.user.uid,
    friendStatuses: state.cache.friendStatuses,
});

export default connect(mapStateToProps)(PrivateChannelItem);
