import React, { useState } from 'react';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Badge,
    SvgIcon,
} from '@material-ui/core';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import firebase from '../../firebase/firebase';

const UserChannelListItem = ({
    uid,
    handleSelectChannel,
    channel,
    selectedChannelId,
}) => {
    const [total, setTotal] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        return firebase
            .firestore()
            .collection('channels')
            .doc(channel.channel_id)
            .onSnapshot((snap) => {
                setUnreadMessages(snap.data().message_count - total);
            });
    }, [total, channel.channel_id]);

    useEffect(() => {
        if (selectedChannelId && uid) {
            return firebase
                .firestore()
                .collection('users')
                .doc(uid)
                .collection('channels')
                .doc(channel.channel_id)
                .collection('info')
                .doc('data')
                .onSnapshot(async (snap) => {
                    const data = await snap.data();
                    if (data && data.message_count)
                        setTotal(data.message_count);
                });
        }
    }, [selectedChannelId, channel.channel_id, uid]);

    return (
        <ListItem
            button
            onClick={() => handleSelectChannel(channel)}
            selected={channel.channel_id === selectedChannelId ? true : false}
        >
            <ListItemIcon>
                <SvgIcon>
                    <path d="M 21.5625 8.625 L 21.5625 5.75 L 17.964844 5.75 L 18.683594 0 L 15.808594 0 L 15.089844 5.75 L 9.34375 5.75 L 10.0625 0 L 7.1875 0 L 6.46875 5.75 L 1.4375 5.75 L 1.4375 8.625 L 6.109375 8.625 L 5.390625 14.375 L 1.4375 14.375 L 1.4375 17.25 L 5.03125 17.25 L 4.3125 23 L 7.1875 23 L 7.90625 17.25 L 13.65625 17.25 L 12.9375 23 L 15.8125 23 L 16.53125 17.25 L 21.5625 17.25 L 21.5625 14.375 L 16.890625 14.375 L 17.605469 8.625 Z M 14.015625 14.375 L 8.265625 14.375 L 8.984375 8.625 L 14.730469 8.625 Z M 14.015625 14.375 " />{' '}
                </SvgIcon>
            </ListItemIcon>
            <ListItemText>{channel.channel_name}</ListItemText>
            <ListItemSecondaryAction>
                <Badge
                    color={'primary'}
                    badgeContent={unreadMessages >= 0 ? unreadMessages : null}
                />
            </ListItemSecondaryAction>
        </ListItem>
    );
};

const mapStateToProps = (state) => ({
    uid: state.user.uid,
});

export default connect(mapStateToProps)(UserChannelListItem);
