import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    makeStyles,
    Grid,
    DialogContent,
} from '@material-ui/core';
import { PermMedia, Close } from '@material-ui/icons';
import { connect } from 'react-redux';
import firebase from '../../firebase/firebase';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

const useStyles = makeStyles((theme) => ({
    dialogTitle: {
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
    },
    image: {
        height: 150,
        width: 150,
        borderRadius: 10,
        objectFit: 'cover',
        transition: '0.2s ease-in-out',
        '&:hover': {
            transform: 'scale(1.05)',
            cursor: 'pointer',
        },
    },
}));

const ChannelMediaDialog = ({ channel: { channel_id, channel_name } }) => {
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);

    useEffect(() => {
        // Set the url
        console.log(window.location.pathname);
        if (window.location.pathname === `/app/${channel_id}/media`)
            setOpen(true);
    }, [channel_id]);

    useEffect(() => {
        if (open) {
            // set images

            firebase
                .firestore()
                .collection('channels')
                .doc(channel_id)
                .collection('messages')
                .where('image', '>', '')
                .get()
                .then((snapshot) => {
                    const messageArr = [];
                    snapshot.forEach((childSnapshot) => {
                        messageArr.push(childSnapshot.data());
                    });
                    setImages(
                        messageArr.sort((a, b) => a.timestamp - b.timestamp)
                    );
                });
        }
    }, [open, channel_id]);

    const handleOpen = () => {
        window.history.pushState(null, null, `/app/${channel_id}/media`);
        setOpen(true);
    };

    const handleClose = () => {
        window.history.pushState(null, null, `/app/${channel_id}`);
        setOpen(false);
    };

    const [currentImage, setCurrentImage] = useState(0);
    const [viewerIsOpen, setViewerIsOpen] = useState(false);

    const openLightbox = (index) => {
        // setOpen(false);

        setCurrentImage(index);
        setViewerIsOpen(true);
    };

    const closeLightbox = () => {
        // setOpen(true);

        setCurrentImage(0);
        setViewerIsOpen(false);
    };

    const classes = useStyles();
    return (
        <>
            <IconButton onClick={handleOpen}>
                <PermMedia />
            </IconButton>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                style={{ zIndex: 100 }}
            >
                <DialogTitle className={classes.dialogTitle}>
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item>{channel_name}'s media</Grid>
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
                    <Grid
                        container
                        alignItems="center"
                        justify="center"
                        spacing={2}
                    >
                        {images.length > 0 ? (
                            images.map((message, index) => (
                                <Grid item key={message.timestamp}>
                                    <div>
                                        <img
                                            onClick={() => openLightbox(index)}
                                            src={message.image}
                                            alt=""
                                            className={classes.image}
                                        />
                                    </div>
                                </Grid>
                            ))
                        ) : (
                            <p>loading</p>
                        )}
                    </Grid>
                </DialogContent>
            </Dialog>
            <div
                style={{
                    zIndex: 10,
                    display: 'none',
                    height: 'calc(100vh - 48px)',
                }}
            >
                {viewerIsOpen && images.length > 0 && (
                    <div style={{ zIndex: 2000 }}>
                        <Lightbox
                            mainSrc={images[currentImage].image}
                            nextSrc={
                                images[(currentImage + 1) % images.length].image
                            }
                            prevSrc={
                                images[
                                    (currentImage + images.length - 1) %
                                        images.length
                                ].image
                            }
                            onCloseRequest={closeLightbox}
                            onMovePrevRequest={() =>
                                setCurrentImage(
                                    (currentImage + images.length - 1) %
                                        images.length
                                )
                            }
                            onMoveNextRequest={() =>
                                setCurrentImage(
                                    (currentImage + 1) % images.length
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    channel: state.channel,
});

export default connect(mapStateToProps)(ChannelMediaDialog);
