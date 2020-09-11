import React, { useState, useRef } from 'react';
import {
    Paper,
    FormControl,
    TextField,
    makeStyles,
    InputAdornment,
    IconButton,
    useTheme,
    useMediaQuery,
    Typography,
    Grid,
    Fade,
} from '@material-ui/core';
import firebase from '../../firebase/firebase';
import { Send } from '@material-ui/icons';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import EmojiPicker from './EmojiPicker';
import AddFile from './AddFile';
import Typing from './Typing';
import axios from 'axios';
import { unfurl } from 'unfurl.js';

const useStyles = makeStyles((theme) => ({
    paper: {
        borderRadius: 0,
        borderTop: theme.palette.paperOutline,
        zIndex: 0,
    },
    input: {
        padding: theme.spacing(0, 1, 1, 1),
    },
}));

const ChatInput = ({
    channel_id,
    uid,
    displayName,
    scrollBottom,
    isPrivate,
    messagesLoading,
    isClassRoom,
}) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const inputRef = useRef(null);

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));
    // const [errors,setErrors] = useState({});

    useEffect(() => {
        setMessage('');
        setSending(false);
    }, [channel_id]);

    const classes = useStyles();

    const validate = () => {
        return message ? true : false;
    };

    const sendMessage = () => {
        const user = firebase.auth().currentUser;
        const uid = user.uid;
        const displayName = user.displayName;
        const avatar = user.photoURL;
        var retext = require('retext');
        var emoji = require('retext-emoji');

        const parsedEmojisMessage = retext()
            .use(emoji, { convert: 'encode' })
            .processSync(message);

        const isLink = false;
        var url = String(parsedEmojisMessage);
        var matches =
            url.match(/\bhttps?::\/\/\S+/gi) || url.match(/\bhttps?:\/\/\S+/gi);

        // body contains at least one link, grabbing the first one
        if (matches !== null && matches[0]) {
            const url = matches[0];
            console.log(url);

            // unfurling
            axios
                .request({
                    url: 'http://localhost:5000/',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: { url },
                })
                .then((result) => {
                    console.log(result.data);
                    if (result.data && result.data.open_graph) {
                        const messageData = {
                            original_message: String(parsedEmojisMessage),
                            site_name: result.data.open_graph.site_name,
                            thumb:
                                result.data.open_graph.images &&
                                result.data.open_graph.images[0].url,
                            uri: matches[0],
                            title: result.data.open_graph.title,
                            description: result.data.open_graph.description,
                            uid,
                            displayName,
                            avatar,
                            timestamp: new Date().getTime(),
                        };

                        setMessage('');
                        setSending(true);
                        const batch = firebase.firestore().batch();

                        const messageSend = firebase
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
                            .doc();
                        batch.set(messageSend, {
                            message_id: messageSend.id,
                            ...messageData,
                        });

                        const incrementChannelMessagesCount = firebase
                            .firestore()
                            .collection(
                                isPrivate
                                    ? 'private_channels'
                                    : isClassRoom
                                    ? 'class_rooms'
                                    : 'channels'
                            )
                            .doc(channel_id);
                        batch.update(incrementChannelMessagesCount, {
                            message_count: firebase.firestore.FieldValue.increment(
                                1
                            ),
                        });

                        batch.commit().then(() => {
                            setSending(false);
                            const typingRef = firebase
                                .database()
                                .ref('typing')
                                .child(channel_id);
                            typingRef.child(uid).remove();
                        });
                    }
                })
                .catch((e) => console.error(e));
            return;
        }

        const messageData = {
            body: String(parsedEmojisMessage),
            uid,
            displayName,
            avatar,
            timestamp: new Date().getTime(),
        };
        setMessage('');

        setSending(true);
        const batch = firebase.firestore().batch();

        const messageSend = firebase
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
            .doc();
        batch.set(messageSend, { message_id: messageSend.id, ...messageData });

        const incrementChannelMessagesCount = firebase
            .firestore()
            .collection(
                isPrivate
                    ? 'private_channels'
                    : isClassRoom
                    ? 'class_rooms'
                    : 'channels'
            )
            .doc(channel_id);
        batch.update(incrementChannelMessagesCount, {
            message_count: firebase.firestore.FieldValue.increment(1),
        });

        batch.commit().then(() => {
            setSending(false);
        });
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (validate()) {
            sendMessage();
        }
    };

    const insertEmoji = (emoji) => {
        const newMessage = `${message} ${emoji} `;
        setMessage(newMessage);
        setTimeout(() => {
            inputRef.current.focus();
        }, 0);
    };
    useEffect(() => {
        console.log(`matches: ${matches}`);
    }, [matches]);

    // set typing
    const handleKeyUp = (e) => {
        const typingRef = firebase.database().ref('typing').child(channel_id);
        if (e && e.target && e.target.value && e.target.value.length >= 1) {
            typingRef.child(uid).set(displayName);
        } else if (e.target.value.length === 0) {
            typingRef.child(uid).remove();
        }
    };

    return (
        <Paper elevation={0} className={classes.paper}>
            <Typing scrollBottom={scrollBottom} />
            <form onSubmit={handleSend}>
                <FormControl fullWidth>
                    <TextField
                        onKeyUp={handleKeyUp}
                        inputRef={inputRef}
                        value={message}
                        autoFocus={true}
                        onChange={(e) => setMessage(e.target.value)}
                        color="primary"
                        variant="outlined"
                        className={classes.input}
                        placeholder="Type out a message..."
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <AddFile />
                                    <EmojiPicker insertEmoji={insertEmoji} />
                                    <IconButton
                                        disabled={sending ? true : false}
                                        onClick={handleSend}
                                        type="submit"
                                    >
                                        <Send />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </FormControl>
            </form>
        </Paper>
    );
};

const mapStateToProps = (state) => ({
    channel_id: state.channel.channel_id,
    uid: state.user.uid,
    displayName: state.user.displayName,
    messagesLoading: state.messages.loading,
    isClassRoom: state.channel.isClassRoom,
});

export default connect(mapStateToProps)(ChatInput);
