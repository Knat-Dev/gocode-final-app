import React from 'react';
import { connect } from 'react-redux';
import { List } from '@material-ui/core';
import FriendListItem from './FriendListItem';

const FriendsList = ({ friends }) => {
    return (
        <List>
            {friends &&
                friends.length > 0 &&
                friends.map((friend) => (
                    <FriendListItem key={friend.uid} friend={friend} />
                ))}
        </List>
    );
};

const mapStateToProps = (state) => ({
    friends: state.user.friends,
});

export default connect(mapStateToProps)(FriendsList);
