import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Grid,
} from '@material-ui/core';
import JoinChannel from './Modal/JoinChannel';
import { connect } from 'react-redux';
import {
    startSetSelectedChannel,
    setPrivateChannel,
    setClassRoom,
} from '../../redux/actions/channel';
import { setMessagesLoading } from '../../redux/actions/messages';
import { startSetChannels } from '../../redux/actions/channels';
import { closeDrawer } from '../../redux/actions/ui';
import UserChannelListItem from './UserChannelListItem';

const UserChannels = ({
    channelsLoading,
    userChannels,
    selectedChannelId,
    startSetSelectedChannel,
    displayName,
    setMessagesLoading,
    closeDrawer,
    setPrivateChannel,
    startSetChannels,
    setClassRoom,
}) => {
    // const [oldPath, setOldPath] = useState('');
    // const [newPath, setNewPath] = useState('');

    const handleSelectChannel = (channel) => {
        if (selectedChannelId !== channel.channel_id) {
            const path = `/app/${channel.channel_id}`;
            window.history.pushState(null, null, path);
            setMessagesLoading();
            setPrivateChannel(false);
            setClassRoom(false);

            startSetSelectedChannel(channel, false);
            closeDrawer();
        }
    };

    return (
        <List>
            <ListItem>
                <ListItemText primary="Channels" />
                <JoinChannel />
            </ListItem>
            <div style={{ maxHeight: 350 }}>
                {!channelsLoading ||
                !displayName ||
                userChannels.length !== 0 ? (
                    userChannels.map((channel) => {
                        return (
                            <UserChannelListItem
                                key={channel.channel_id}
                                handleSelectChannel={handleSelectChannel}
                                channel={channel}
                                selectedChannelId={selectedChannelId}
                            />
                        );
                    })
                ) : (
                    <Grid container justify="center">
                        <CircularProgress
                            size={30}
                            color="primary"
                            style={{ padding: 10 }}
                        />
                    </Grid>
                )}
            </div>
        </List>
    );
};

const mapStateToProps = (state) => ({
    channelsLoading: state.channels.loading,
    userChannels: state.channels.userChannels,
    selectedChannelId: state.channel.channel_id,
    displayName: state.user.displayName,
});

export default connect(mapStateToProps, {
    startSetSelectedChannel,
    setMessagesLoading,
    startSetChannels,
    closeDrawer,
    setPrivateChannel,
    setClassRoom,
})(UserChannels);
