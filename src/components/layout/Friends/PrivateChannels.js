import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { setUserPrivateChannels } from '../../../redux/actions/user';
import { ListItem, ListItemText, List } from '@material-ui/core';
import { setMessagesLoading } from '../../../redux/actions/messages';
import {
    startSetSelectedChannel,
    setPrivateChannel,
    setClassRoom,
} from '../../../redux/actions/channel';
import { closeDrawer } from '../../../redux/actions/ui';
import PrivateChannelItem from './PrivateChannelItem';

const PrivateChannels = ({
    private_channels,
    selectedChannelId,
    setUserPrivateChannels,
    setMessagesLoading,
    startSetSelectedChannel,
    closeDrawer,
    setPrivateChannel,
    isPrivate,
    setClassRoom,
}) => {
    useEffect(() => {
        setUserPrivateChannels();
    }, [setUserPrivateChannels]);

    const handleSelectChannel = (channel) => {
        if (selectedChannelId !== channel.channel_id) {
            const path = `/app/${channel.channel_id}`;
            window.history.pushState(null, null, path);
            setMessagesLoading();
            setClassRoom(false);
            setPrivateChannel(true);
            startSetSelectedChannel(channel, true);
            closeDrawer();
        }
    };

    return (
        private_channels &&
        private_channels.length !== 0 && (
            <List>
                <ListItem>
                    <ListItemText primary="Direct Messages" />
                </ListItem>
                {private_channels.map((channel) => (
                    <PrivateChannelItem
                        key={channel.channel_id}
                        channel={channel}
                        handleSelectChannel={handleSelectChannel}
                    />
                ))}
            </List>
        )
    );
};

const mapStateToProps = (state) => ({
    private_channels: state.user.private_channels,
    selectedChannelId: state.channel.channel_id,
    isPrivate: state.channel.isPrivate,
});

export default connect(mapStateToProps, {
    setUserPrivateChannels,
    setMessagesLoading,
    startSetSelectedChannel,
    closeDrawer,
    setPrivateChannel,
    setClassRoom,
})(PrivateChannels);
