import React, { useState } from 'react';
import { Notifications, NotificationsNone } from '@material-ui/icons';
import {
    IconButton,
    Popover,
    makeStyles,
    Badge,
    ListItem,
    ListItemText,
    Typography,
} from '@material-ui/core';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import firebase from '../../../firebase/firebase';
import NotificationItem from './NotificationItem';

const useStyles = makeStyles((theme) => ({
    popover: {
        width: 350,
    },
}));

const NotificationPanel = ({ user, size }) => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);

    const { notifications } = user;
    const [unreadNotifications, setUnreadNotifications] = useState(
        notifications.filter((not) => !not.read).length
    );
    useEffect(() => {
        setUnreadNotifications(notifications.filter((not) => !not.read).length);
    }, [user, notifications]);

    useEffect(() => {
        if (anchorEl !== null && unreadNotifications > 0) {
            console.log('hi');
            let unreadNotificationsIds = notifications
                .filter((not) => !not.read)
                .map((not) => {
                    return not.notification_id;
                });
            console.log(unreadNotificationsIds.length);
            const batch = firebase.firestore().batch();

            unreadNotificationsIds.forEach((not) => {
                const ref = firebase
                    .firestore()
                    .collection('users')
                    .doc(user.uid)
                    .collection('notifications')
                    .doc(not);
                batch.update(ref, { read: true });
            });

            batch.commit().then(() => {
                console.log('updated to read');
            });
        }
    }, [anchorEl, user, notifications, unreadNotifications]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <IconButton
                size={size}
                aria-describedby={id}
                color="inherit"
                onClick={handleClick}
            >
                <Badge badgeContent={unreadNotifications} color="error">
                    {unreadNotifications > 0 ? (
                        <Notifications />
                    ) : (
                        <NotificationsNone />
                    )}
                </Badge>
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <div className={classes.popover}>
                    <>
                        {notifications.length > 0 ? (
                            notifications.map((notification, i) => (
                                <NotificationItem
                                    key={i}
                                    notification={notification}
                                />
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText>
                                    <Typography align="center">
                                        Notification panel empty
                                    </Typography>
                                </ListItemText>
                            </ListItem>
                        )}
                    </>
                </div>
            </Popover>
        </>
    );
};

const mapStateToProps = (state) => ({
    user: state.user,
});

export default connect(mapStateToProps)(NotificationPanel);
