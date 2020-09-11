import React from 'react';
import { Typography } from '@material-ui/core';
import { connect } from 'react-redux';
import { addCachedUser, addUserProfile } from '../../redux/actions/cache';
import { setAccountDrawer, setAccount } from '../../redux/actions/ui';

const UserProfilePopover = ({
    message,
    addCachedUser,
    userPopovers,
    displayName,
    uid,
    setAccountDrawer,
    accountDrawer,
    setAccount,
    addUserProfile,
}) => {
    const avatar = message.avatar;
    // Popover stuff
    const [anchorEl] = React.useState(null);

    const handleClick = (event) => {
        // if (message.displayName !== displayName)
        //     setAnchorEl(event.currentTarget);
        setAccountDrawer(true);
        setAccount(message.uid, message.displayName, avatar);
        addUserProfile(message.uid, message.displayName, avatar);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    // End Popover stuff

    // useEffect(() => {
    //     if (
    //         open &&
    //         userPopovers &&
    //         message &&
    //         !userPopovers.hasOwnProperty(message.displayName)
    //     ) {
    //         console.log('hey');
    //         let user;
    //         firebase
    //             .firestore()
    //             .collection('users')
    //             .where('nickname', '==', message.displayName)
    //             .limit(1)
    //             .get()
    //             .then((snapshot) => {
    //                 user = snapshot.docs[0].data();
    //                 console.log(user);
    //                 return firebase
    //                     .firestore()
    //                     .collection('users')
    //                     .doc(uid)
    //                     .collection('friends-pending')
    //                     .limit(1)
    //                     .get();
    //                 // .limit(1).
    //             })
    //             .then((snapshot) => {
    //                 if (snapshot.empty) user.pending = false;
    //                 else user.pending = true;
    //                 addCachedUser(user);
    //                 setUserData(user);
    //             });
    //     } else if (open) {
    //         console.log(
    //             'User was already shown, showing cached data inside state'
    //         );
    //         setUserData(userPopovers[message.displayName]);
    //     }
    // }, [open]);

    return (
        <>
            <Typography
                aria-describedby={id}
                onClick={handleClick}
                variant="body1"
                color="primary"
                style={{
                    paddingBottom: message.image ? 8 : 0,
                    cursor: 'pointer',
                }}
            >
                {message.displayName}
            </Typography>

            {/* <Popover
                id={id}
                open={displayName !== message.displayName && open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Grid
                    container
                    style={{ padding: 10 }}
                    justify="center"
                    alignItems="flex-start"
                    direction="column"
                >
                    {userData !== null && (
                        <>
                            <Grid item style={{ width: '100%' }}>
                                <Grid
                                    container
                                    justify="space-between"
                                    alignItems="center"
                                >
                                    <Grid item>
                                        <Typography
                                            variant="h5"
                                            color="primary"
                                        >
                                            {message.displayName}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton
                                            onClick={handleClose}
                                            color="primary"
                                        >
                                            <Close />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                {userData && (
                                    <Typography variant="body1">
                                        <Typography
                                            component="span"
                                            color="textSecondary"
                                        >
                                            Registered on{' '}
                                        </Typography>
                                        {moment(
                                            userData.registration_date
                                        ).format('MMMM D, YYYY')}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item style={{ width: '100%' }}>
                                <FormControl fullWidth margin="dense">
                                    <AddFriend
                                        userData={userData}
                                        senderId={uid}
                                    />
                                </FormControl>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Popover> */}
        </>
    );
};

const mapStateToProps = (state) => ({
    userPopovers: state.cache.userPopovers,
    displayName: state.user.displayName,
    uid: state.user.uid,
    accountDrawer: state.ui.accountDrawer,
});

export default connect(mapStateToProps, {
    addCachedUser,
    setAccountDrawer,
    setAccount,
    addUserProfile,
})(UserProfilePopover);
