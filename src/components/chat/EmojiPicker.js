import React, { useState } from 'react';
import Picker, { SKIN_TONE_MEDIUM_LIGHT } from 'emoji-picker-react';
import { IconButton, Popover } from '@material-ui/core';
import { SentimentSatisfiedOutlined } from '@material-ui/icons';

const EmojiPicker = ({ insertEmoji }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const onEmojiClick = (event, emojiObject) => {
        handleClose();
        insertEmoji(emojiObject.emoji);
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <IconButton
                aria-describedby={id}
                variant="contained"
                onClick={handleClick}
            >
                <SentimentSatisfiedOutlined />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
            >
                <Picker
                    disableAutoFocus
                    onEmojiClick={onEmojiClick}
                    skinTone={SKIN_TONE_MEDIUM_LIGHT}
                />
            </Popover>
        </>
    );
};

export default EmojiPicker;
