import React, { useState, useRef, useEffect } from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    useTheme,
    Typography,
    DialogContent,
    Grid,
    ButtonGroup,
    DialogActions,
} from '@material-ui/core';
import { Add, Close, CloudUpload, AttachFile } from '@material-ui/icons';
import mime from 'mime-types';
import firebase from '../../firebase/firebase';
import { uuid } from 'uuidv4';
import { connect } from 'react-redux';

const AddFile = ({ channel_id, isPrivate, isClassRoom }) => {
    const theme = useTheme();
    // States
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [storageRef, setStorageRef] = useState(firebase.storage().ref());
    const [uploadState, setUploadState] = useState('');
    const [uploadType, setUploadType] = useState('image');
    const [uploadTask, setUploadTask] = useState(null);
    const [percentUploaded, setPercentUploaded] = useState(0);

    // Refs
    const fileInputRef = useRef(null);
    const imageTypes = useRef(['image/jpeg', 'image/png', 'image/gif']).current;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
    };

    const handleOpenFileInput = () => {
        fileInputRef.current.click();
    };

    const handleFileChanged = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
        }
    };

    const getEllipsisFileName = () => {
        if (file.name.length >= 24) {
            let ellipsisFileName = '';
            ellipsisFileName +=
                file.name.slice(0, 12) +
                '...' +
                file.name.slice(file.name.length - 12, file.name.length);
            return ellipsisFileName;
        } else return file.name;
    };

    const sendImageMessage = (downloadUrl) => {
        console.log('hi');
        const currentUser = firebase.auth().currentUser;
        const displayName = currentUser.displayName;
        const uid = currentUser.uid;
        const avatar = currentUser.photoURL;
        const ref = firebase
            .firestore()
            .collection(
                isPrivate
                    ? 'private_channels'
                    : isClassRoom
                    ? 'class_rooms'
                    : 'channels'
            )
            .doc(channel_id)
            .collection('messages');
        const message = {
            avatar,
            timestamp: new Date().getTime(),
            displayName,
            image: downloadUrl,
            uid,
        };
        ref.add(message);
    };

    useEffect(() => {
        if (uploadTask !== null)
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
                            if (uploadType === 'image')
                                sendImageMessage(downloadUrl, channel_id);
                            const incrementChannelMessagesCount = firebase
                                .firestore()
                                .collection(
                                    isPrivate
                                        ? 'private_channels'
                                        : isClassRoom
                                        ? 'class_rooms'
                                        : 'channels'
                                )
                                .doc(channel_id)
                                .update({
                                    message_count: firebase.firestore.FieldValue.increment(
                                        1
                                    ),
                                })
                                .then(() => {
                                    handleClose();
                                });
                        });
                }
            );
    }, [uploadTask]);

    const sendFile = () => {
        if (file) {
            const fileName = file.name;
            console.log(fileName);

            // Handle images
            if (imageTypes.includes(mime.lookup(fileName))) {
                const metadata = { contentType: mime.lookup(fileName) };
                console.log(metadata);
                const extension = mime.extension(metadata.contentType);
                const filePath = `chat/public/${channel_id}/images/${uuid()}.${extension}`;
                setUploadState('uploading');
                setUploadTask(storageRef.child(filePath).put(file, metadata));
                setFile(null);
                setUploadType('image');
            } else {
                console.log('file type not supported, choose an image for now');
            }
        }
    };

    return (
        <>
            <IconButton onClick={handleClickOpen}>
                <Add />
            </IconButton>
            <Dialog
                onClose={handleClose}
                aria-labelledby="simple-dialog-title"
                open={open}
                maxWidth="sm"
            >
                <DialogTitle
                    style={{
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                    }}
                >
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item>Upload Files!</Grid>
                        <Grid item>
                            <IconButton
                                color="inherit"
                                aria-label="close"
                                onClick={handleClose}
                                style={{ marginLeft: 40 }}
                            >
                                <Close />
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <input
                        accept="image/png,image/gif,image/jpeg"
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChanged}
                    />
                    <div style={{ flex: 1, whiteSpace: 'nowrap' }}></div>
                    {file ? (
                        getEllipsisFileName()
                    ) : (
                        <Typography variant="body1" color="inherit">
                            Choose a file..
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <IconButton onClick={handleOpenFileInput}>
                        <AttachFile />
                    </IconButton>
                    <IconButton
                        disabled={file === null ? true : false}
                        onClick={sendFile}
                    >
                        <CloudUpload />
                    </IconButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

const mapStateToProps = (state) => ({
    channel_id: state.channel.channel_id,
    isPrivate: state.channel.isPrivate,
    isClassRoom: state.channel.isClassRoom,
});

export default connect(mapStateToProps)(AddFile);
