import React from 'react';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import {
    Typography,
    CircularProgress,
    Box,
    Button,
    Grid,
    Chip,
    Avatar,
} from '@material-ui/core';
import firebase from '../../firebase/firebase';
import { useState } from 'react';
import { Check } from '@material-ui/icons';

const Invite = ({ history, match, userLoggedIn, uid }) => {
    const [channel, setChannel] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [joining, setJoining] = useState(false);

    // Checking link
    useEffect(() => {
        console.log('Invite page');
        if (userLoggedIn) {
            console.log('user logged in, checing invite link');
            firebase
                .firestore()
                .collection('class_rooms')
                .where('channel_id', '==', match.params.channelId)
                .get()
                .then((snapshot) => {
                    if (!snapshot.empty) {
                        const foundChannel = snapshot.docs[0].data();
                        return firebase
                            .firestore()
                            .collection('users')
                            .where('uid', '==', foundChannel.teacher)
                            .get()
                            .then((snap) => {
                                if (!snap.empty) {
                                    setTeacher(snap.docs[0].data());
                                    setChannel(foundChannel);
                                    setIsValid(true);
                                    setValidating(false);
                                }
                            });
                    }
                    setValidating(false);
                })
                .catch((e) => console.error(e));
        } else {
            console.log('not logged in!!');
            setValidating(false);
        }
    }, [match.params.channelId, userLoggedIn]);

    // if link valid
    // useEffect(() => {
    //     if (isValid) {
    //         console.log('link is valid');
    //     }
    // }, [isValid]);

    const joinClassRoom = () => {
        firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('class_rooms')
            .doc(channel.channel_id)
            .set(channel)
            .then(() => {
                firebase
                    .firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('class_rooms')
                    .doc(channel.channel_id)
                    .collection('info')
                    .doc('data')
                    .set({ message_count: channel.message_count });
                history.push('/app');
            });
    };

    if (validating) {
        return (
            <Box
                height="calc(100vh - 48px)"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <CircularProgress size={100} thickness={2} color="primary" />
                <Typography color="textPrimary" align="center" variant="h6">
                    Validating invite link, hold on
                </Typography>
            </Box>
        );
    }

    if (!isValid) {
        return (
            <Box
                height="calc(100vh - 48px)"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Typography variant="h4" color="error">
                    Oopsie!
                </Typography>
                <div style={{ maxWidth: 300, marginTop: 15 }}>
                    <Typography
                        color="textPrimary"
                        align="center"
                        variant="body1"
                    >
                        The link you've entered is invalid, please contact your
                        teacher for the correct link.
                    </Typography>
                </div>
            </Box>
        );
    }

    return (
        <Box
            height="calc(100vh - 48px)"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Box display="flex" flexDirection="column" justifyContent="center">
                <Typography
                    align="center"
                    variant="h4"
                    color="textPrimary"
                    style={{ marginBottom: 25 }}
                >
                    {`Join classroom now!`}
                </Typography>
                <Grid container alignItems="center">
                    {/* Channel Name */}
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary">
                            Channel Name
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                            {channel.channel_name}
                        </Typography>
                    </Grid>
                    {/* Teacher's contact */}
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary">
                            Teacher's Contact
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                            {teacher.email}
                        </Typography>
                    </Grid>
                    {/* Teacher */}
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary">
                            Teacher's Name
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Chip
                            avatar={
                                <Avatar alt="Avatar" src={teacher.avatar} />
                            }
                            label={teacher.nickname}
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
                <Button
                    onClick={joinClassRoom}
                    style={{ marginTop: 25, backgroundColor: '#0acf63' }}
                    endIcon={<Check />}
                >
                    Join Classroom
                </Button>
            </Box>
        </Box>
    );
};

const mapStateToProps = (state) => ({
    userLoggedIn: !!state.user.uid,
    uid: state.user.uid,
});

export default connect(mapStateToProps)(Invite);
