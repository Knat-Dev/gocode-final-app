import React, { useState, useEffect } from 'react';
import {
    makeStyles,
    Grid,
    Avatar,
    Paper,
    Divider,
    Typography,
    Fade,
    Popover,
    Grow,
    Slide,
} from '@material-ui/core';
import moment from 'moment';
import { connect } from 'react-redux';
import UserProfilePopover from '../layout/UserProfilePopover';
import firebase from '../../firebase/firebase';

const useStyles = makeStyles((theme) => ({
    messageContainer: {
        padding: theme.spacing(2),
        color: 'white',
    },
    avatar: {
        width: theme.spacing(6),
        height: theme.spacing(6),
    },
    avatarElevation: {
        marginLeft: ({ messageOwner }) =>
            !messageOwner ? theme.spacing(2) : 0,
        marginRight: ({ messageOwner }) =>
            messageOwner ? theme.spacing(2) : 0,
        width: theme.spacing(6),
        height: theme.spacing(6),
        borderRadius: theme.spacing(6) / 2,
    },
    messageBody: {
        borderRadius: 10,
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        wordWrap: 'break-word',
        minWidth: 150,
        maxWidth: 400,
    },
    image: {
        padding: 0,
        margin: 0,
        height: 150,
        width: 150,
        borderRadius: 10,
        objectFit: 'cover',
        opacity: 0,
        // transition: theme.transitions.create(
        //     ['border-color', 'color', 'opacity'],
        //     { duration: theme.transitions.duration.complex }
        // ),
        // '&:hover': {
        //     background: 'none',
        //     borderColor: '#eee',
        //     color: '#333',
        //     opacity: 1,
        // },
    },
    imageHover: {
        zIndex: 10000000000,
        transition: theme.transitions.create(
            ['border-color', 'color', 'opacity', 'transform'],
            { duration: theme.transitions.duration.complex }
        ),
        '&:hover': {
            transform: 'scale(1.1)',
        },
    },
    linkThumb: {
        marginRight: theme.spacing(2),
        height: 150,
        width: 'auto',
        objectFit: 'cover',
        [theme.breakpoints.down('xs')]: {
            height: 60,
        },
    },
    linkMessage: {
        [theme.breakpoints.down('xs')]: {
            width: 125,
            wordBreak: 'break-word',
        },
    },
}));

const MessageItem = ({
    index,
    message,
    displayName,
    scrollBottom,
    messages,
}) => {
    const messageOwner = message.displayName === displayName ? true : false;
    const [avatar, setAvatar] = useState(message.avatar);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [updatedTime, setUpdatedTime] = useState(
        moment(message.timestamp).fromNow()
    );
    const classes = useStyles({
        messageOwner,
    });

    useEffect(() => {
        return firebase
            .firestore()
            .collection('users')
            .doc(message.uid)
            .onSnapshot((snap) => {
                setAvatar(snap.data().avatar);
            });
    }, []);

    // useEffect(() => {
    //     scrollBottom();
    // }, [imageLoaded]);

    // moment time update every minute
    useEffect(() => {
        const id = setInterval(() => {
            setUpdatedTime(moment(message.timestamp).fromNow());
        }, 60000);
        return () => {
            clearInterval(id);
        };
    }, []);

    // get link full message and parse into jsx
    const parseFullMessage = (text) => {
        const httpsRegex = /(https?:\/\/[^\s]+)/g;
        const https = text.replace(httpsRegex, '');
        if (https) return https;
        const httpRegex = /(http?:\/\/[^\s]+)/g;
        return text.replace(httpRegex, '');
    };

    return (
        <Grow in={true} timeout={(150 * (messages.length - index + 1)) % 3000}>
            <Fade
                in={true}
                timeout={(150 * (messages.length - index + 1)) % 3000}
            >
                <Grid
                    wrap="nowrap"
                    container
                    direction="row"
                    className={classes.messageContainer}
                    justify={messageOwner ? 'flex-start' : 'flex-end'}
                >
                    {messageOwner && (
                        <Grid item>
                            <Paper
                                elevation={3}
                                className={classes.avatarElevation}
                            >
                                <Avatar
                                    className={classes.avatar}
                                    src={avatar}
                                />
                            </Paper>
                        </Grid>
                    )}
                    <Grid item>
                        <Grid container direction="column">
                            <Grid item>
                                <UserProfilePopover message={message} />
                            </Grid>
                            <Grid item>
                                {message.body ? (
                                    <Paper className={classes.messageBody}>
                                        {message.body}
                                        <Divider
                                            variant="inset"
                                            style={{
                                                marginTop: 8,
                                                marginBottom: 8,
                                            }}
                                        />
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                            >
                                                {updatedTime}
                                            </Typography>
                                        </div>
                                    </Paper>
                                ) : message.image ? (
                                    <div className={classes.imageHover}>
                                        <Fade in={imageLoaded}>
                                            <img
                                                alt=""
                                                onLoad={() =>
                                                    setImageLoaded(true)
                                                }
                                                src={message.image}
                                                className={classes.image}
                                            />
                                        </Fade>
                                    </div>
                                ) : (
                                    <Fade in={imageLoaded}>
                                        <div>
                                            <div
                                                style={{
                                                    paddingBottom: 10,
                                                    display: 'flex',
                                                    alignItems: 'baseline',
                                                }}
                                            >
                                                <div
                                                    className={
                                                        classes.linkMessage
                                                    }
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="textPrimary"
                                                    >
                                                        {parseFullMessage(
                                                            message.original_message
                                                        )}
                                                    </Typography>
                                                </div>
                                                <Typography
                                                    component="a"
                                                    href={message.uri}
                                                    target="_blank"
                                                    color="primary"
                                                    style={{
                                                        marginLeft: 5,
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    - View on{' '}
                                                    {message.site_name}
                                                </Typography>
                                            </div>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                }}
                                            >
                                                <div>
                                                    <a
                                                        href={message.uri}
                                                        target="_blank"
                                                    >
                                                        <img
                                                            alt=""
                                                            onLoad={() =>
                                                                setImageLoaded(
                                                                    true
                                                                )
                                                            }
                                                            src={message.thumb}
                                                            className={
                                                                classes.linkThumb
                                                            }
                                                        />
                                                    </a>
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <div
                                                        className={
                                                            classes.linkMessage
                                                        }
                                                    >
                                                        <Typography
                                                            component="a"
                                                            href={message.uri}
                                                            target="_blank"
                                                            variant="body1"
                                                            color="primary"
                                                            style={{
                                                                textDecoration:
                                                                    'none',
                                                                width: 150,
                                                            }}
                                                        >
                                                            {message.title}
                                                        </Typography>
                                                    </div>
                                                    <div
                                                        className={
                                                            classes.linkMessage
                                                        }
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            color="textSecondary"
                                                        >
                                                            {
                                                                message.description
                                                            }
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Fade>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                    {!messageOwner && (
                        <Grid item>
                            <Paper
                                elevation={3}
                                className={classes.avatarElevation}
                            >
                                <Avatar
                                    className={classes.avatar}
                                    src={avatar}
                                />
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Fade>
        </Grow>
    );
};

const mapStateToProps = (state) => ({
    displayName: state.user.displayName,
    messages: state.messages.channelMessages,
});

export default connect(mapStateToProps)(MessageItem);
