import React, { useState } from 'react';
import {
    Tooltip,
    IconButton,
    Dialog,
    useTheme,
    DialogTitle,
    Grid,
    DialogContent,
    FormControl,
    Typography,
    TextField,
    Button,
} from '@material-ui/core';
import firebase from '../../firebase/firebase';
import { Add, Close } from '@material-ui/icons';

const AdminAddChannel = ({ size }) => {
    const [open, setOpen] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [errors, setErrors] = useState({});

    const theme = useTheme();
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
    };

    const validate = () => {
        const _errors = {};

        if (!channelName) _errors.channelName = 'Must not be empty';
        else if (channelName.length < 3)
            _errors.channelName = 'Must include at least 3 characters';

        return Object.keys(_errors).length === 0;
    };

    const createChannel = () => {
        if (validate()) {
            const currUser = firebase.auth().currentUser;

            const channel = firebase.firestore().collection('channels').doc();
            const channelItem = {
                admin: currUser.uid,
                channel_id: channel.id,
                channel_name: channelName,
                message_count: 0,
            };
            channel.set(channelItem).then(() => {
                handleClose();
            });
        }
    };

    return (
        <>
            <Tooltip title="Add New Channel">
                <IconButton
                    size={size}
                    color="inherit"
                    onClick={handleClickOpen}
                >
                    <Add />
                </IconButton>
            </Tooltip>
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
                        <Grid item>Create Public Channel</Grid>
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
                            error={errors.email ? true : false}
                            helperText={errors.email}
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            variant="outlined"
                            placeholder="Enter channel name..."
                            label="Channel Name"
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

export default AdminAddChannel;
