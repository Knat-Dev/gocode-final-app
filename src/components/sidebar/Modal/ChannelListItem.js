import React from 'react';
import {
    ListItem,
    ListItemText,
    Typography,
    ListItemSecondaryAction,
    Tooltip,
    IconButton,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';

const ChannelListItem = ({ channel, joinChannel }) => {
    return (
        <ListItem>
            <ListItemText color="primary">
                <Typography variant="h6" color="primary">
                    {channel.channel_name}
                </Typography>
            </ListItemText>
            <ListItemSecondaryAction>
                <Tooltip placement="right" title="Join Channel">
                    <IconButton onClick={() => joinChannel(channel)}>
                        <Add color="primary" />
                    </IconButton>
                </Tooltip>
            </ListItemSecondaryAction>
        </ListItem>
    );
};

export default ChannelListItem;
