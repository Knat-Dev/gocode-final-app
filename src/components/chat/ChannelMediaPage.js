import React, { useEffect, useState } from 'react';
import {
    makeStyles,
    IconButton,
    Drawer,
    Toolbar,
    Typography,
    Grid,
} from '@material-ui/core';
import { PhotoAlbum, ChevronRight } from '@material-ui/icons';
import firebase from '../../firebase/firebase';
import { connect } from 'react-redux';

const drawerWidth = 'calc(100vw - 300px)';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        zIndex: theme.zIndex.appBar - 1,
        width: 'auto',
        flexShrink: 0,
    },
    drawerPaper: {
        backgroundColor: '#EFEDF2',
        width: drawerWidth,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'space-between',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
}));

const ChannelMediaPage = ({ channel_id, isPrivate }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState([]);

    useEffect(() => {
        if (open) {
            // set images

            firebase
                .firestore()
                .collection(isPrivate ? 'private_channels' : 'channels')
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
                        messageArr
                            .sort((a, b) => a.timestamp - b.timestamp)
                            .map((message) => ({
                                original: message.image,
                                thumbnail: message.image,
                            }))
                    );
                });
        }
    }, [open, channel_id, isPrivate]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <>
            <IconButton onClick={handleDrawerOpen}>
                <PhotoAlbum />
            </IconButton>
            <Drawer
                onClose={handleDrawerClose}
                className={classes.drawer}
                variant="persistent"
                anchor="right"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <Toolbar variant="dense" />
                <div className={classes.drawerHeader}>
                    <Typography variant="h5" color="primary">
                        Channel Media
                    </Typography>
                    <IconButton color="primary" onClick={handleDrawerClose}>
                        <ChevronRight />
                    </IconButton>
                </div>

                <Grid container justify="center">
                    {images.map((image, i) => (
                        <Grid key={i} item>
                            <img
                                width={300}
                                height={300}
                                // onClick={() => openLightbox(index)}
                                src={image.original}
                                alt=""
                                style={{
                                    objectFit: 'cover',
                                    padding: 4,
                                    borderRadius: 5,
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Drawer>
        </>
    );
};

const mapStateToProps = (state) => ({
    channel_id: state.channel.channel_id,
    isPrivate: state.channel.isPrivate,
});

export default connect(mapStateToProps)(ChannelMediaPage);
