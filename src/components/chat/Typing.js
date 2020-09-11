import React, { useEffect } from 'react';
import { Fade, Grid, Typography, Box } from '@material-ui/core';
import { connect } from 'react-redux';
import { useState } from 'react';
import firebase from '../../firebase/firebase';

const Typing = ({ channel_id, uid, scrollBottom }) => {
    const [users, setUsers] = useState([]);
    const [sentence, setSentence] = useState('');
    const [names, setNames] = useState('');

    useEffect(() => {
        console.log(users);
        if (users && users.length > 0) {
            users.length === 1
                ? setSentence('is typing...')
                : setSentence('are typing...');
            if (users.length > 1) {
                let names = users.map((user) => {
                    return user.name;
                });
                var namesStr =
                    names.slice(0, -1).join(', ') + ' and ' + names.slice(-1);
                console.log(namesStr);
                setNames(namesStr);
            } else {
                setNames(users[0].name);
            }
        }
    }, [users]);

    useEffect(() => {
        if (channel_id && uid) {
            const typingRef = firebase
                .database()
                .ref('typing')
                .child(channel_id);
            let typingUsers = [];
            const child_added_listener = typingRef.on(
                'child_added',
                (snapshot) => {
                    if (snapshot.key !== uid) {
                        console.log(snapshot.val());
                        console.log(`${snapshot.key} is typing..`);

                        typingUsers = typingUsers.concat({
                            id: snapshot.key,
                            name: snapshot.val(),
                        });
                        setUsers(typingUsers);
                        console.log(typingUsers);
                    }
                }
            );

            const child_removed_listener = typingRef.on(
                'child_removed',
                (snap) => {
                    console.log(snap.val() + ' has stopped typing...');

                    const index = typingUsers.findIndex(
                        (user) => user.id === snap.key
                    );
                    if (index !== -1) {
                        typingUsers = typingUsers.filter(
                            (user) => user.id !== snap.key
                        );
                        setUsers(typingUsers);
                    }
                }
            );

            return () => {
                typingRef.off('child_added', child_added_listener);
                typingRef.off('child_removed', child_removed_listener);
                typingRef.child(uid).remove();
            };
        }
    }, [channel_id, uid]);

    useEffect(() => {
        if (channel_id && uid) {
            return () => {
                firebase
                    .database()
                    .ref('typing')
                    .child(channel_id)
                    .child(uid)
                    .remove();
            };
        }
    }, [channel_id, uid]);

    return (
        <Fade in={users.length > 0 ? true : false} timeout={200}>
            <Grid container alignItems="center" style={{ minHeight: 28 }}>
                <Grid item>
                    <div className="spinner">
                        <div className="bounce1"></div>
                        <div className="bounce2"></div>
                        <div className="bounce3"></div>
                    </div>
                </Grid>
                <Grid item>
                    <Box fontStyle="italic">
                        <Typography variant="subtitle2" color="textSecondary">
                            {names} {sentence}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Fade>
    );
};

const mapStateToProps = (state) => ({
    channel_id: state.channel.channel_id,
    uid: state.user.uid,
});

export default connect(mapStateToProps)(Typing);
