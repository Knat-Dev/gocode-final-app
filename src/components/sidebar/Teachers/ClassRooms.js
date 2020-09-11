import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { MenuBook } from '@material-ui/icons';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
    setClassRoom,
    setPrivateChannel,
    startSetSelectedChannel,
} from '../../../redux/actions/channel';
import { setMessagesLoading } from '../../../redux/actions/messages';
import { closeDrawer } from '../../../redux/actions/ui';
import { setClassRooms } from '../../../redux/actions/user';

const ClassRooms = ({
    setPrivateChannel,
    setMessagesLoading,
    selectedChannelId,
    setClassRoom,
    classRooms,
    uid,
    teacher,
    setClassRooms,
    startSetSelectedChannel,
}) => {
    useEffect(() => {
        if (uid && teacher && selectedChannelId) {
            setClassRooms();
        }
    }, [uid, teacher, selectedChannelId, setClassRooms]);

    const handleSelectChannel = (channel) => {
        if (selectedChannelId !== channel.channel_id) {
            const path = `/app/${channel.channel_id}`;
            window.history.pushState(null, null, path);
            setMessagesLoading();
            setPrivateChannel(false);
            setClassRoom(true);
            startSetSelectedChannel(channel, false, true);
            closeDrawer();
        }
    };

    return (
        <>
            {classRooms.length > 0 &&
                classRooms.map((room) => (
                    <ListItem
                        key={room.channel_id}
                        button
                        selected={
                            selectedChannelId === room.channel_id ? true : false
                        }
                        onClick={() => handleSelectChannel(room)}
                    >
                        <ListItemIcon>
                            <MenuBook />
                        </ListItemIcon>
                        <ListItemText primary={room.channel_name} />
                    </ListItem>
                ))}
        </>
    );
};

export default connect(
    (state) => ({
        selectedChannelId: state.channel.channel_id,
        uid: state.user.uid,
        teacher: state.user.teacher,
        classRooms: state.user.class_rooms,
    }),
    {
        setClassRooms,
        setMessagesLoading,
        setPrivateChannel,
        setClassRoom,
        startSetSelectedChannel,
        closeDrawer,
    }
)(ClassRooms);
