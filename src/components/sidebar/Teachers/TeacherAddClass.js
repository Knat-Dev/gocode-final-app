import React from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Grid,
    FormControl,
    TextField,
    useTheme,
} from '@material-ui/core';
import { Add, Close } from '@material-ui/icons';
import { useState } from 'react';
import firebase from '../../../firebase/firebase';

const TeacherAddClass = () => {
    const [open, setOpen] = React.useState(false);
    const [channelName, setChannelName] = useState('');
    const [errors, setErrors] = useState({});
    const theme = useTheme();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const validate = () => {
        const _errors = {};

        if (!channelName) _errors.channelName = 'Must not be empty';
        else if (channelName.length < 3)
            _errors.channelName = 'Must include at least 3 characters';
        if (Object.keys(_errors).length > 0) setErrors(_errors);
        return Object.keys(_errors).length === 0;
    };

    const createChannel = () => {
        if (validate()) {
            const currUser = firebase.auth().currentUser;

            const batch = firebase.firestore().batch();

            const channel = firebase
                .firestore()
                .collection('class_rooms')
                .doc();
            const channelItem = {
                teacher: currUser.uid,
                channel_id: channel.id,
                channel_name: channelName,
                message_count: 0,
            };
            batch.set(channel, channelItem);

            const teacherChannel = firebase
                .firestore()
                .collection('users')
                .doc(currUser.uid)
                .collection('class_rooms')
                .doc(channel.id);
            batch.set(teacherChannel, channelItem);

            batch.commit().then(async () => {
                const channelDoc = firebase
                    .firestore()
                    .collection('class_rooms')
                    .doc(channel.id);
                try {
                    const res = await firebase
                        .firestore()
                        .runTransaction(async (t) => {
                            const doc = await t.get(channelDoc);
                            const message_count = doc.data().message_count;

                            firebase
                                .firestore()
                                .collection('users')
                                .doc(currUser.uid)
                                .collection('class_rooms')
                                .doc(channel.id)
                                .collection('info')
                                .doc('data')
                                .set({ message_count });

                            return `Message count = ${message_count}`;
                        });
                    console.log('Transaction success', res);
                } catch (e) {
                    console.log('Transaction failure:', e);
                }
                handleClose();
            });
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
                    <Grid
                        style={{ width: '100%' }}
                        container
                        justify="space-between"
                        alignItems="center"
                    >
                        <Grid item>Create Class Room</Grid>
                        <Grid item>
                            <IconButton
                                color="inherit"
                                aria-label="close"
                                onClick={handleClose}
                            >
                                <Close />
                            </IconButton>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <TextField
                            autoFocus
                            error={errors.channelName ? true : false}
                            helperText={errors.channelName}
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            variant="outlined"
                            placeholder="Enter class name..."
                            label="Class Name"
                            InputLabelProps={{ shrink: true }}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={createChannel}
                        >
                            Create Channel
                        </Button>
                    </FormControl>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TeacherAddClass;
