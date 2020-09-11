import React, { useState } from 'react';
import {
    Grid,
    Avatar,
    makeStyles,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Box,
    CircularProgress,
    Fade,
    Tooltip,
    Toolbar,
    Badge,
} from '@material-ui/core';
import { uuid } from 'uuidv4';
import mime from 'mime-types';
import { connect } from 'react-redux';
import { Check, Close, ExitToApp, CloudUpload } from '@material-ui/icons';
import { useEffect } from 'react';
import firebase from '../../firebase/firebase';
import { addUserProfile } from '../../redux/actions/cache';
import { setAccount, setAccountDrawer } from '../../redux/actions/ui';
import { logout, login } from '../../redux/actions/user';
import { useRef } from 'react';
import AddFriend from '../friends/AddFriend';

const useStyles = makeStyles((theme) => ({
    avatar: {
        width: 200,
        height: 200,
    },
    buttonProgress: {
        color: theme.palette.primary.main,
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

const Account = ({
    setAccountDrawer,
    logout,
    loggedInUid,
    addUserProfile,
    drawerOpen,
    setAccount,
    currentAccount: { uid, displayName, avatar },
    currentAccount,
    login,
}) => {
    const [updateDescription, setUpdateDescription] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [description, setDescription] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [storageRef] = useState(firebase.storage().ref());
    const [, setUploadState] = useState('');
    const [, setUploadType] = useState('image');
    const [uploadTask, setUploadTask] = useState(null);
    const [, setPercentUploaded] = useState(0);

    const classes = useStyles();

    useEffect(() => {
        if (currentAccount.uid) {
            // console.log(currentAccount.uid);
            return firebase
                .firestore()
                .collection('users')
                .doc(currentAccount.uid)
                .onSnapshot((snap) => {
                    if (snap.exists && snap.data().description) {
                        setDescription(snap.data().description);
                        setUserAvatar(snap.data().avatar);
                    }
                });
        }
    }, [currentAccount]);

    useEffect(() => {
        if (window.location.pathname.includes('users')) {
            console.log('hi');
            return firebase
                .firestore()
                .collection('users')
                .doc(
                    window.location.pathname.split('/')[
                        window.location.pathname.split('/').length - 1
                    ]
                )
                .onSnapshot((snap) => {
                    if (snap.exists) {
                        const uid = snap.data().uid;
                        const displayName = snap.data().nickname;
                        const avatar = snap.data().avatar;
                        setAccount(uid, displayName, avatar);
                        addUserProfile(uid, displayName, avatar);
                        if (snap.data().description)
                            setDescription(snap.data().description);
                    }
                });
        }
    }, [drawerOpen, addUserProfile, setAccount]);

    const handleSaveAboutInformation = () => {
        setLoading(true);
        firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .update({ description })
            .then(() => {
                setUpdateDescription(false);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (uploadTask !== null && displayName !== null)
            uploadTask.on(
                'state_changed',
                (snap) => {
                    const percentUploaded =
                        Math.round(snap.bytesTransferred / snap.totalBytes) *
                        100;
                    setPercentUploaded(percentUploaded);
                },
                (err) => {
                    console.log(err);
                    setUploadTask(null);
                    setUploadState('error');
                },
                () => {
                    uploadTask.snapshot.ref
                        .getDownloadURL()
                        .then((downloadUrl) => {
                            console.log(downloadUrl);
                            firebase
                                .firestore()
                                .collection('users')
                                .doc(loggedInUid)
                                .update({ avatar: downloadUrl })
                                .then(() => {
                                    return firebase
                                        .auth()
                                        .currentUser.updateProfile({
                                            photoURL: downloadUrl,
                                        });
                                })
                                .then(() => {
                                    console.log('updated');
                                    setAccount(
                                        loggedInUid,
                                        displayName,
                                        downloadUrl
                                    );
                                    login(
                                        loggedInUid,
                                        displayName,
                                        downloadUrl
                                    );
                                });
                        });
                }
            );
    }, [uploadTask, displayName, loggedInUid, login, setAccount]);

    const openFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const sendFile = (e) => {
        const file = e.target.files[0];
        const fileName = file.name;
        if (
            ['image/jpeg', 'image/png', 'image/gif'].includes(
                mime.lookup(fileName)
            )
        ) {
            const metadata = { contentType: mime.lookup(fileName) };
            console.log(metadata);
            const extension = mime.extension(metadata.contentType);
            const filePath = `users/public/${loggedInUid}/images/${uuid()}.${extension}`;
            setUploadState('uploading');
            setUploadTask(storageRef.child(filePath).put(file, metadata));
            setUploadType('image');
        } else {
            console.log('file type not supported, choose an image for now');
        }
    };

    return (
        <div style={{ height: '100%' }}>
            <Toolbar variant="dense">
                <Grid container justify="flex-end">
                    <IconButton onClick={() => setAccountDrawer(false)}>
                        <Close />
                    </IconButton>
                </Grid>
            </Toolbar>
            <Grid
                container
                justify="center"
                alignItems="center"
                style={{ height: 'calc(100% - 48px)' }}
                direction="column"
            >
                <Grid item>
                    <Badge
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        overlap="circle"
                        badgeContent={
                            uid === loggedInUid && (
                                <Tooltip
                                    title="Change Avatar"
                                    placement="right"
                                    arrow
                                >
                                    <IconButton
                                        onClick={openFileInput}
                                        size="small"
                                        style={{
                                            backgroundColor: 'rgb(0,0,0,0.2)',
                                        }}
                                    >
                                        <CloudUpload />
                                    </IconButton>
                                </Tooltip>
                            )
                        }
                    >
                        <Avatar className={classes.avatar}>
                            <Fade in={imageLoaded}>
                                <img
                                    onLoad={() => setImageLoaded(true)}
                                    src={userAvatar}
                                    alt=""
                                    style={{ width: 200, height: 200 }}
                                />
                            </Fade>
                        </Avatar>
                    </Badge>
                </Grid>
                <Grid item>
                    <Typography variant="h5">{displayName}</Typography>
                </Grid>
                <Grid item>
                    {updateDescription && uid === loggedInUid ? (
                        <TextField
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            disabled={loading}
                                            onClick={() =>
                                                setUpdateDescription(false)
                                            }
                                        >
                                            <Close />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            disabled={loading}
                                            onClick={handleSaveAboutInformation}
                                        >
                                            <Check />
                                            {loading && (
                                                <CircularProgress
                                                    size={24}
                                                    className={
                                                        classes.buttonProgress
                                                    }
                                                />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    ) : (
                        <Box width={350} fontStyle="italic">
                            <Typography
                                onClick={() =>
                                    uid === loggedInUid &&
                                    setUpdateDescription(true)
                                }
                                variant="subtitle2"
                                color="textSecondary"
                                style={{
                                    cursor:
                                        uid === loggedInUid
                                            ? 'pointer'
                                            : 'auto',
                                }}
                                align="center"
                            >
                                {!description
                                    ? 'Click here to add information about yourself'
                                    : description}
                            </Typography>
                        </Box>
                    )}
                </Grid>
                {uid === loggedInUid && (
                    <Grid item>
                        <Tooltip title="Logout" aria-label="Logout" arrow>
                            <IconButton onClick={logout}>
                                <ExitToApp />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                )}
                {uid !== loggedInUid && (
                    <AddFriend
                        userData={{
                            uid: uid,
                            nickname: displayName,
                            avatar: avatar,
                        }}
                        senderId={loggedInUid}
                    />
                )}
            </Grid>
            <input
                hidden
                type="file"
                ref={fileInputRef}
                onChange={sendFile}
                accept="image/jpeg,image/gif,image/png"
            />
        </div>
    );
};

const mapStateToProps = (state) => ({
    channel_id: state.channel.channel_id,
    userProfiles: state.cache.userProfiles,
    drawerOpen: state.ui.accountDrawer,
    loggedInUid: state.user.uid,
    currentAccount: state.ui.currentAccount,
});

export default connect(mapStateToProps, {
    addUserProfile,
    setAccount,
    setAccountDrawer,
    logout,
    login,
})(Account);
