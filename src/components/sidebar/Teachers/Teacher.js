import React from 'react';
import { connect } from 'react-redux';
import {
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    List,
} from '@material-ui/core';
import TeacherAddClass from './TeacherAddClass';
import ClassRooms from './ClassRooms';

const Teacher = ({ teacher }) => {
    return (
        teacher && (
            <List>
                <ListItem>
                    <ListItemText primary="Your Classes" />
                    <ListItemSecondaryAction>
                        <TeacherAddClass />
                    </ListItemSecondaryAction>
                </ListItem>
                <ClassRooms />
            </List>
        )
    );
};

export default connect(
    (state) => ({
        teacher: state.user.teacher,
    }),
    {}
)(Teacher);
