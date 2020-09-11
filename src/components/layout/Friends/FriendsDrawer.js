import React from 'react';
import { People } from '@material-ui/icons';
import {
    IconButton,
    Tooltip,
    Drawer,
    Toolbar,
    makeStyles,
    Typography,
} from '@material-ui/core';
const drawerWidth = '240px';
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        // width: `calc(100% - ${drawerWidth})`,
        // marginLeft: drawerWidth,
        // transition: theme.transitions.create(['margin', 'width'], {
        //     easing: theme.transitions.easing.easeOut,
        //     duration: theme.transitions.duration.enteringScreen,
        // }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        zIndex: 20,
        width: 'auto',
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'space-between',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: 0,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
}));

const FriendsDrawer = ({ size }) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <>
            <IconButton size={size} color="inherit" onClick={handleDrawerOpen}>
                <Tooltip title="Friends">
                    <People />
                </Tooltip>
            </IconButton>
            <Drawer
                onClose={handleDrawerClose}
                className={classes.drawer}
                variant="persistent"
                anchor="right"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <Toolbar variant="dense" />
                <div className={classes.drawerHeader}>
                    <Typography variant="h6">Friends</Typography>
                </div>
            </Drawer>
        </>
    );
};

export default FriendsDrawer;
