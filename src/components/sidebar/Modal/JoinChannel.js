import React, { useState, useEffect } from 'react';
import {
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    Typography,
    List,
    DialogContent,
    DialogTitle,
    Grid,
    CircularProgress,
    makeStyles,
} from '@material-ui/core';
import firebase from '../../../firebase/firebase';
import { Add } from '@material-ui/icons';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';
import ChannelListItem from './ChannelListItem';
import { useCallback } from 'react';

const useStyles = makeStyles((theme) => ({
    loading: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

const JoinChannel = ({ userChannels }) => {
    const [open, setOpen] = React.useState(false);
    const [channels, setChannels] = useState([]);
    const [empty, setEmpty] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // styles
    const classes = useStyles();

    const initialFetch = useCallback(() => {
        firebase
            .firestore()
            .collection('channels')
            .get()
            .then((snapshot) => {
                if (!snapshot.empty) {
                    const channelArr = [];
                    snapshot.forEach((childSnapshot) => {
                        channelArr.push(childSnapshot.data());
                    });
                    const subtractSubscribedChannels = channelArr.filter(
                        (x) => {
                            return !userChannels.some(
                                (channel) => channel.channel_id === x.channel_id
                            );
                        }
                    );
                    setChannels(subtractSubscribedChannels);
                    if (channelArr.length < 5) setHasMore(false);
                } else {
                    setHasMore(false);
                    setEmpty(true);
                }
            });
    }, [userChannels]);

    useEffect(() => {
        if (open === true) initialFetch();
    }, [open, initialFetch]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setChannels([]);
        setEmpty(false);
    };

    const handleJoinChannel = async (channel) => {
        const afterJoinChannels = channels.filter(
            (x) => x.channel_id !== channel.channel_id
        );
        const channel_id = channel.channel_id;
        const uid = firebase.auth().currentUser.uid;
        firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('channels')
            .doc(channel_id)
            .set(channel)
            .then(() => {
                console.log(
                    "channel successfully added to user's channel list"
                );
            });

        const channelDoc = firebase
            .firestore()
            .collection('channels')
            .doc(channel_id);
        try {
            const res = await firebase.firestore().runTransaction(async (t) => {
                const doc = await t.get(channelDoc);
                const message_count = doc.data().message_count;

                firebase
                    .firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('channels')
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

        setChannels(afterJoinChannels);
        if (afterJoinChannels.length === 0) setEmpty(true);
    };

    return (
        <>
            <ListItemSecondaryAction>
                <IconButton onClick={handleClickOpen}>
                    <Add />
                </IconButton>
            </ListItemSecondaryAction>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="form-dialog-title">
                    Join our awesome channels!
                </DialogTitle>

                <DialogContent
                    style={{ maxHeight: 150, overflow: 'auto' }}
                    id="scrollable"
                >
                    {empty ? (
                        <Grid container justify="center" alignItems="center">
                            <Typography variant="h6" color="primary">
                                No channels left..
                            </Typography>
                        </Grid>
                    ) : (
                        <InfiniteScroll
                            loadMore={() => {}}
                            hasMore={true}
                            pageStart={0}
                            threshold={1}
                            getScrollParent={() =>
                                document.getElementById('scrollable')
                            }
                            initialLoad={false}
                            useWindow={false}
                            loader={
                                <Grid
                                    key="loading-more"
                                    container
                                    direction="column"
                                    justify="center"
                                    alignItems="center"
                                >
                                    {hasMore && (
                                        <>
                                            <Typography
                                                variant="body1"
                                                color="secondary"
                                                style={{
                                                    marginBottom: '0.5rem',
                                                }}
                                            >
                                                Loading more...
                                            </Typography>
                                            <CircularProgress
                                                className={classes.loading}
                                                color="secondary"
                                                size={25}
                                            />
                                        </>
                                    )}
                                </Grid>
                            }
                        >
                            <List>
                                {channels.map((channel) => (
                                    <ChannelListItem
                                        key={channel.channel_id}
                                        channel={channel}
                                        joinChannel={handleJoinChannel}
                                    />
                                ))}
                            </List>
                        </InfiniteScroll>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default connect((state) => ({
    userChannels: state.channels.userChannels,
}))(JoinChannel);
