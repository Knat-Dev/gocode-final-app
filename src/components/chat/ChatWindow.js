import React, { useState, useEffect, useRef } from 'react';
import firebase from '../../firebase/firebase';
import MessageItem from './MessageItem';
import InfiniteScroll from 'react-infinite-scroller';
import {
    makeStyles,
    Grid,
    Typography,
    CircularProgress,
    Paper,
    IconButton,
    Drawer,
    Toolbar,
} from '@material-ui/core';
import { connect } from 'react-redux';
import {
    setInitialMessages,
    shiftMessagePage,
    concatMessages,
    setMessagesLoading,
} from '../../redux/actions/messages';
import ChatInput from './ChatInput';
import { ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    chat: {
        overflow: 'auto',
        flexGrow: 1,
        '&::-webkit-scrollbar': {
            width: 7,
            [theme.breakpoints.down('xs')]: {
                width: 0,
            },
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            outline: '1px solid slategrey',

            borderRadius: 8,
        },
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyChannels: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

const ChatWindow = ({
    channel_id,
    messagesLoading,
    channelMessages,
    setInitialMessages,
    shiftMessagePage,
    concatMessages,
    userChannels,
    uid,
    isPrivate,
    handleDrawerClose,
    drawerClassName,
    drawerPaperClassName,
    drawerHeaderClassName,
    drawerOpen,
    isClassRoom,
}) => {
    const classes = useStyles();

    const [hasMore, setHasMore] = useState(true);
    const [oldestMessageRef, setOldestMessageRef] = useState(null);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);

    // messages ref in database
    const scrollable = useRef(null);
    const chatBottom = useRef(null);

    const scrollBottom = () => {
        if (chatBottom.current) chatBottom.current.scrollIntoView();
    };

    // scroll bottom after channel completes loading
    useEffect(() => {
        if (!messagesLoading && userChannels.length !== 0)
            chatBottom.current.scrollIntoView();
    }, [messagesLoading]);

    // scroll bottom when resize happens (such as keyboard showing up on mobile browsers)
    useEffect(() => {
        const handleResize = () => {
            scrollBottom();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const listeners = [];
        if (channel_id) {
            const messagesRef = firebase
                .firestore()
                .collection(
                    isPrivate
                        ? 'private_channels'
                        : isClassRoom
                        ? 'class_rooms'
                        : 'channels'
                )
                .doc(channel_id)
                .collection('messages')
                .orderBy('timestamp', 'asc');

            let _start = null;
            let messages = [];
            const initialFetchAmount = 20;

            messagesRef
                .limitToLast(initialFetchAmount)
                .get()
                .then((snap) => {
                    if (!snap.empty) {
                        _start = snap.docs[snap.docs.length - 1];
                        setEnd(snap.docs[0]);
                        snap.forEach((childSnap) => {
                            messages.push({
                                message_id: childSnap.id,
                                ...childSnap.data(),
                            });
                        });
                        setInitialMessages(messages);
                        // chat doesn't have enough messages to paginate, keep it simple and realtime until refresh
                        if (snap.docs.length < initialFetchAmount)
                            setHasMore(false);
                        else setHasMore(true);
                        console.log('initial fetch');
                        const listner = messagesRef
                            .startAfter(_start)
                            .onSnapshot((snapshot) => {
                                const messageArr = [...messages];
                                const concat = [];
                                snapshot.forEach((childSnapshot) => {
                                    concat.push({
                                        message_id: childSnapshot.id,
                                        ...childSnapshot.data(),
                                    });
                                    messageArr.push({
                                        message_id: childSnapshot.id,
                                        ...childSnapshot.data(),
                                    });
                                });
                                console.log(concat);

                                if (messages.length !== messageArr.length) {
                                    console.log('concatting');
                                    concatMessages([concat[concat.length - 1]]);
                                    scrollBottom();
                                }

                                if (
                                    messages.length !== messageArr.length &&
                                    messageArr.length > 0 &&
                                    concat.length > 0
                                ) {
                                    const batch = firebase.firestore().batch();
                                    const incrementUserChannel = firebase
                                        .firestore()
                                        .collection('users')
                                        .doc(uid)
                                        .collection(
                                            isPrivate
                                                ? 'private_channels'
                                                : isClassRoom
                                                ? 'class_rooms'
                                                : 'channels'
                                        )
                                        .doc(channel_id)
                                        .collection('info')
                                        .doc('data');
                                    batch.update(incrementUserChannel, {
                                        message_count: firebase.firestore.FieldValue.increment(
                                            1
                                        ),
                                    });
                                    batch.commit();
                                }
                            });
                        listeners.push(listner);
                    } else {
                        // brand new room - no messages in it
                        listeners[1] = messagesRef.onSnapshot((snapshot) => {
                            const messageArr = [];
                            snapshot.forEach((childSnapshot) => {
                                messageArr.push({
                                    message_id: childSnapshot.id,
                                    ...childSnapshot.data(),
                                });
                            });
                            console.log(messageArr.length);
                            if (messageArr.length > 0) {
                                concatMessages([
                                    messageArr[messageArr.length - 1],
                                ]);
                                scrollBottom();
                                const batch = firebase.firestore().batch();
                                const incrementUserChannel = firebase
                                    .firestore()
                                    .collection('users')
                                    .doc(uid)
                                    .collection(
                                        isPrivate
                                            ? 'private_channels'
                                            : isClassRoom
                                            ? 'class_rooms'
                                            : 'channels'
                                    )
                                    .doc(channel_id)
                                    .collection('info')
                                    .doc('data');
                                batch.update(incrementUserChannel, {
                                    message_count: firebase.firestore.FieldValue.increment(
                                        1
                                    ),
                                });
                                batch.commit();
                            } else setInitialMessages([]);
                            setHasMore(false);
                        });
                    }
                });
            return () => {
                listeners.forEach((listener) => (listener ? listener() : null));
            };
        }
    }, [channel_id, isPrivate]);

    // called when scroll reach top, fetching 20 more messages.
    const loadMore = () => {
        if (hasMore) {
            console.log('Fetching more...');
            const messagesRef = firebase
                .firestore()
                .collection(isPrivate ? 'private_channels' : 'channels')
                .doc(channel_id)
                .collection('messages')
                .orderBy('timestamp', 'asc');

            if (end !== null) {
                messagesRef
                    .endBefore(end)
                    .limitToLast(20)
                    .get()
                    .then((snap) => {
                        if (!snap.empty) {
                            const earlierMessages = [];
                            snap.forEach((childSnap) =>
                                earlierMessages.push({
                                    message_id: childSnap.id,
                                    ...childSnap.data(),
                                })
                            );
                            console.log(
                                `shifting ${earlierMessages.length} items`
                            );
                            shiftMessagePage(earlierMessages);
                            if (snap.docs.length < 20) setHasMore(false);

                            setEnd(snap.docs[0]);
                        }
                    });
            }
        }
    };
    return messagesLoading ? (
        <div className={classes.loading}>
            <CircularProgress
                color="primary"
                size={45}
                style={{ marginBottom: 15 }}
            />
            <Typography variant="body1" color="primary">
                Loading Channel...
            </Typography>
        </div>
    ) : userChannels.length !== 0 ? (
        <>
            <div className={classes.chat} ref={scrollable} id="scrollable">
                <InfiniteScroll
                    isReverse
                    loadMore={loadMore}
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
                            className={classes.fetchingMore}
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
                                        style={{ marginBottom: '0.5rem' }}
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
                    <Grid
                        container
                        justify="center"
                        alignItems="center"
                        style={{ padding: '0.5rem' }}
                    >
                        {!hasMore && (
                            <Grid item>
                                <Typography variant="h6" color="primary">
                                    Chat started here...
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                    {channelMessages &&
                        channelMessages.length > 0 &&
                        channelMessages.map((message, index) => (
                            <MessageItem
                                key={message.message_id}
                                index={index}
                                message={message}
                                scrollBottom={scrollBottom}
                            />
                        ))}
                    <div ref={chatBottom} />
                </InfiniteScroll>
            </div>
            {!messagesLoading && (
                <ChatInput scrollBottom={scrollBottom} isPrivate={isPrivate} />
            )}
        </>
    ) : (
        <div className={classes.emptyChannels}>
            <Typography variant="body1" color="textSecondary">
                Start adding channels by pressing the plus sign on the channels
                menu (top left)
            </Typography>
        </div>
    );
};

const mapStateToProps = (state) => ({
    uid: state.user.uid,
    channel_id: state.channel.channel_id,
    userChannels: state.channels.userChannels,
    messagesLoading: state.messages.loading,
    channelMessages: state.messages.channelMessages,
    isClassRoom: state.channel.isClassRoom,
});

export default connect(mapStateToProps, {
    setInitialMessages,
    shiftMessagePage,
    concatMessages,
    setMessagesLoading,
})(ChatWindow);
