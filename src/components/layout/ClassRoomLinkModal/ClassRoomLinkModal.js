import React, { useState } from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    InputAdornment,
    Tooltip,
    FormControl,
} from '@material-ui/core';
import { AttachFile, FileCopy } from '@material-ui/icons';
import { connect } from 'react-redux';
import { useRef } from 'react';

const ClassRoomLinkModal = ({ channel_id }) => {
    const inputRef = useRef(null);
    const address = useRef(`http://localhost:3000/invite/${channel_id}`);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
    };

    const copyToClipboard = () => {
        inputRef.current.select();
        document.execCommand('copy');
    };

    return (
        <>
            <IconButton onClick={handleClickOpen}>
                <AttachFile />
            </IconButton>
            <Dialog
                onClose={handleClose}
                aria-labelledby="simple-dialog-title"
                open={open}
            >
                <DialogTitle id="simple-dialog-title">
                    Share this link to add new members
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <TextField
                            multiline={true}
                            inputRef={inputRef}
                            value={address.current}
                            label="With normal TextField"
                            id="standard-start-adornment"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Copy to clipboard">
                                            <IconButton
                                                size="small"
                                                onClick={copyToClipboard}
                                            >
                                                <FileCopy />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </FormControl>
                </DialogContent>
            </Dialog>
        </>
    );
};

const mapStateToProps = (state) => ({
    channel_id: state.channel.channel_id,
});

export default connect(mapStateToProps)(ClassRoomLinkModal);
