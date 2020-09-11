import React from 'react';
import { Grid, makeStyles, Paper } from '@material-ui/core';
import UserChannels from '../sidebar/UserChannels';
import JoinChannelSidebar from '../sidebar/JoinChannelSidebar';
import PrivateChannels from './Friends/PrivateChannels';
import Teacher from '../sidebar/Teachers/Teacher';
const useStyles = makeStyles((theme) => ({
    sidebar: {
        width: 300,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: '#333',
        color: '#fff',
    },
    paper: {
        borderRadius: 0,
        height: 'calc(100vh - 48px)',
        overflow: 'auto',
        borderRight: theme.palette.paperOutline,
        '&::-webkit-scrollbar': {
            width: 7,
            [theme.breakpoints.down('xs')]: {
                width: 0,
            },
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            outline: '1px solid slategrey',

            borderRadius: 8,
        },
    },
}));

export const Sidebar = () => {
    const classes = useStyles();
    return (
        <Grid item>
            <Paper elevation={0} className={classes.paper}>
                <UserChannels />
                <JoinChannelSidebar />
                <Teacher />
                <PrivateChannels />
            </Paper>
        </Grid>
    );
};
