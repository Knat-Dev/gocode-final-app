import React from 'react';
import {
    ListItem,
    Typography,
    Avatar,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import { PersonAdd, Clear } from '@material-ui/icons';
import { useEffect } from 'react';
import firebase from '../../../firebase/firebase';
import { addCachedUser } from '../../../redux/actions/cache';
import { connect } from 'react-redux';
import { useState } from 'react';
import { acceptFriendRequest } from '../../../util/helperFunctions';

const NotificationItem = ({ notification, addCachedUser, userPopovers }) => {
    const [userData, setUserData] = useState(null);
    const {
        type,
        from_displayName: fromDisplayName,
        to_displayName: toDisplayName,
        from,
        to,
        avatar,
        displayName,
    } = notification;

    useEffect(() => {
        if (type === 'friend-request') {
            if (!userPopovers.hasOwnProperty(fromDisplayName))
                firebase
                    .firestore()
                    .collection('users')
                    .doc(from)
                    .get()
                    .then((snapshot) => {
                        if (snapshot.exists) {
                            const data = snapshot.data();
                            addCachedUser(data);
                            setUserData(data);
                        }
                    });
            else setUserData(userPopovers[fromDisplayName]);
        }
    }, [type, addCachedUser, from, fromDisplayName, userPopovers]);

    return (
        <ListItem>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={avatar} style={{ marginRight: 8 }} />
                <Typography
                    variant="body2"
                    style={{ marginRight: 4, width: type === '' }}
                >
                    {type === 'friend-request'
                        ? `You have a friend request from ${fromDisplayName}`
                        : type === 'awaiting-friendship-request'
                        ? `Your friend request to ${toDisplayName} is pending approval`
                        : `You and ${displayName} are now friends`}
                </Typography>
                {type === 'friend-request' && (
                    <div style={{ display: 'flex' }}>
                        <div style={{ marginLeft: 10 }}>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                    acceptFriendRequest(to, userData)
                                }
                            >
                                <Tooltip arrow title="Accept Request">
                                    <PersonAdd />
                                </Tooltip>
                            </IconButton>
                        </div>
                        <div>
                            <IconButton size="small" color="primary">
                                <Tooltip arrow title="Decline Request">
                                    <Clear />
                                </Tooltip>
                            </IconButton>
                        </div>
                    </div>
                )}
            </div>
        </ListItem>
    );
};

const mapStateToProps = (state) => ({
    userPopovers: state.cache.userPopovers,
});

export default connect(mapStateToProps, { addCachedUser })(NotificationItem);
