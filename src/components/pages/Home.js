import React, { useEffect, useState } from 'react';
import {
    Grid,
    useTheme,
    useMediaQuery,
    Box,
    Paper,
    Typography,
    makeStyles,
    Drawer,
    Toolbar,
    Badge,
    Tooltip,
    IconButton,
} from '@material-ui/core';
import { usePageVisibility } from 'react-page-visibility';
import { Sidebar } from '../layout/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import { connect } from 'react-redux';
import { startSetChannels } from '../../redux/actions/channels';
import {
    startSetSelectedChannel,
    setPrivateChannel,
    setClassRoom,
} from '../../redux/actions/channel';
import {
    setMobile,
    setNotMobile,
    setAccountDrawer,
} from '../../redux/actions/ui';
import ChannelMediaDialog from '../chat/ChannelMediaDialog';
import ChannelMediaPage from '../chat/ChannelMediaPage';
import firebase from '../../firebase/firebase';
import Account from '../layout/Account';
import { AttachFile } from '@material-ui/icons';
import ClassRoomLinkModal from '../layout/ClassRoomLinkModal/ClassRoomLinkModal';

const useStyles = makeStyles((theme) => ({
    onlineBadge: {
        backgroundColor: '#44b700',
    },
    offlineBadge: {
        backgroundColor: '#8f8f8f',
    },
    awayBadge: { backgroundColor: '#fcba03' },
    appbar: {
        position: 'relative',
        zIndex: theme.zIndex.drawer + 1,
    },
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
        width: 'auto',
        flexShrink: 0,
    },

    accountDrawerPaper: {
        width: '100%',
        height: '100%',
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

// Private route, only accessible after signup and profile update
const Home = ({
    messagesLoading,
    channelName,
    match,
    startSetChannels,
    userChannels,
    startSetSelectedChannel,
    channel_id,
    channel_teacher,
    setMobile,
    setNotMobile,
    isPrivate,
    private_channels,
    setPrivateChannel,
    friendStatuses,
    setAccountDrawer,
    accountDrawer,
    user: { uid, displayName },
    accountDrawerUserUid,
    setClassRoom,
    classRooms,
    isClassRoom,
}) => {
    const [prevPath, setPrevPath] = useState('');
    const classes = useStyles();
    const [firstRender, setFirstRender] = useState(true);
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    let isVisible = usePageVisibility();

    useEffect(() => {
        console.log(window.location.pathname.includes('users'));
        const account_uid = window.location.pathname.split('/')[
            window.location.pathname.split('/').length - 1
        ];
        if (window.location.pathname.includes('users')) {
            window.history.pushState(null, null, `/users/${account_uid}`);
            setAccountDrawer(true);
            setPrevPath(`/app/${channel_id}`);
        }
    }, [channel_id, setAccountDrawer]);

    useEffect(() => {
        if (accountDrawer && accountDrawerUserUid) {
            console.log(accountDrawerUserUid);
            const handleKey = (e) => {
                if (e.key === 'Escape') setAccountDrawer(false);
            };
            setPrevPath(window.location.pathname);
            const path = `/users/${accountDrawerUserUid}`;
            window.history.pushState(null, null, path);

            window.addEventListener('keyup', handleKey);
            return () => {
                window.removeEventListener('keyup', handleKey);
            };
        } else if (!accountDrawer) {
            window.history.pushState(null, null, prevPath);
        }
    }, [accountDrawer]);

    useEffect(() => {
        if (displayName && uid) {
            let con = null;
            const connectionsRef = firebase
                .database()
                .ref(`connections/${uid}`);
            const listener = firebase
                .database()
                .ref('.info/connected')
                .on('value', (snap) => {
                    if (snap.val() == false || !snap.exists()) return;
                    con = connectionsRef.push();
                    con.onDisconnect()
                        .remove()
                        .then(() => {
                            if (channel_id) {
                                firebase
                                    .database()
                                    .ref('typing')
                                    .child(channel_id)
                                    .child(uid)
                                    .remove();
                            }
                        });
                    if (isVisible)
                        con.set({
                            state: 'online',
                            last_changed: new Date().getTime(),
                        });
                    else
                        con.set({
                            state: 'away',
                            last_changed: new Date().getTime(),
                        });
                });
            return () => {
                if (con) con.remove();
                connectionsRef.off('value', listener);
            };
        }
    }, [isVisible]);

    // useEffect(() => {
    //     if (channel_id) {
    //         return () => {

    //         };
    //     }
    // }, [channel_id, uid]);

    useEffect(() => {
        if (channelName) console.log(channelName);
    }, [channelName]);

    useEffect(() => {
        startSetChannels();
    }, []);

    useEffect(() => {
        if (mobile) setMobile();
        else setNotMobile();
    }, [mobile]);

    useEffect(() => {
        const { channelId } = match.params;
        console.log(channelId);
        if (
            channel_id !== undefined &&
            channelId !== channel_id &&
            firstRender
        ) {
            setFirstRender(false);
            let foundChannel = null;
            const isChannelFound = userChannels.some((channel) => {
                if (channel.channel_id === channelId) {
                    foundChannel = channel;
                    return channel;
                }
            });
            let isPrivateChannelFound = null;
            if (!isChannelFound) {
                isPrivateChannelFound = private_channels.some((channel) => {
                    if (channel.channel_id === channelId) {
                        foundChannel = channel;
                        return channel;
                    }
                });
            }
            let isClassRoom = null;
            if (!foundChannel) {
                isClassRoom = classRooms.some((channel) => {
                    if (channel.channel_id === channelId) {
                        foundChannel = channel;
                        return channel;
                    }
                });
            }

            if (isChannelFound || isPrivateChannelFound || isClassRoom) {
                console.log('found a channel with id: ' + channelId);
                console.log(foundChannel);
                if (isPrivateChannelFound) {
                    setClassRoom(false);
                    setPrivateChannel(true);
                } else if (isClassRoom) {
                    setPrivateChannel(false);
                    setClassRoom(true);
                } else {
                    setPrivateChannel(false);
                    setClassRoom(false);
                }
                console.log(foundChannel);
                startSetSelectedChannel(
                    foundChannel,
                    isPrivateChannelFound ? true : false,
                    isClassRoom ? true : false
                );
            }
        } else if (channelId === channel_id) {
            setFirstRender(false);
        }
    }, [
        channel_id,
        classRooms,
        firstRender,
        match.params,
        private_channels,
        setClassRoom,
        setPrivateChannel,
        startSetSelectedChannel,
        userChannels,
    ]);

    return (
        <>
            <Grid
                item
                style={{
                    display: 'flex',
                    flex: 1,
                    overflow: 'auto',
                }}
            >
                <Grid container>
                    {!mobile && (
                        <Grid
                            item
                            style={{
                                width: 300,
                            }}
                        >
                            <Grid container direction="column">
                                <Sidebar />
                            </Grid>
                        </Grid>
                    )}
                    <Grid
                        item
                        style={{
                            flex: 1,
                        }}
                    >
                        <Box
                            height="calc(100vh - 48px)"
                            width="100%"
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                        >
                            {!messagesLoading && userChannels.length > 0 && (
                                <Paper
                                    elevation={0}
                                    style={{
                                        zIndex: 1,
                                        // boxShadow: `rgb(76 76 76) 0px 8px 8px -7px`,
                                        borderRadius: 0,
                                        padding: theme.spacing(1),
                                        color: theme.palette.primary,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderBottom:
                                            theme.palette.paperOutline,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {isPrivate && (
                                            <Badge
                                                badgeContent=" "
                                                color="primary"
                                                style={{ margin: `0 20px` }}
                                                classes={{
                                                    badge:
                                                        friendStatuses[
                                                            channelName
                                                        ] === 'away'
                                                            ? classes.awayBadge
                                                            : friendStatuses[
                                                                  channelName
                                                              ] === 'online'
                                                            ? classes.onlineBadge
                                                            : classes.offlineBadge,
                                                }}
                                            />
                                        )}
                                        <Box fontStyle="italic">
                                            <Typography variant="h5">
                                                {isPrivate ? '@' : '#'}
                                                {channelName}
                                            </Typography>
                                        </Box>
                                    </div>
                                    <div>
                                        {channel_teacher === uid &&
                                            isClassRoom && (
                                                <ClassRoomLinkModal />
                                            )}
                                        <ChannelMediaDialog />
                                        <ChannelMediaPage />
                                    </div>
                                </Paper>
                            )}

                            <ChatWindow isPrivate={isPrivate} />
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
            <Drawer
                onClose={() => setAccountDrawer(false)}
                className={classes.drawer}
                variant="persistent"
                anchor="bottom"
                open={accountDrawer}
                classes={{
                    paper: classes.accountDrawerPaper,
                }}
            >
                <Toolbar variant="dense" />
                {accountDrawer && <Account />}
            </Drawer>
        </>
    );
};

const mapStateToProps = (state) => ({
    channelName: state.channel.channel_name,
    channel_id: state.channel.channel_id,
    channel_teacher: state.channel.teacher,
    messagesLoading: state.messages.loading,
    userChannels: state.channels.userChannels,
    private_channels: state.user.private_channels,
    classRooms: state.user.class_rooms,
    isPrivate: state.channel.isPrivate,
    isClassRoom: state.channel.isClassRoom,
    user: state.user,
    friendStatuses: state.cache.friendStatuses,
    accountDrawer: state.ui.accountDrawer,
    accountDrawerUserUid: state.ui.currentAccount.uid,
});

export default connect(mapStateToProps, {
    startSetChannels,
    startSetSelectedChannel,
    setMobile,
    setNotMobile,
    setPrivateChannel,
    setAccountDrawer,
    setClassRoom,
})(Home);
