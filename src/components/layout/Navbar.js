import React, { useEffect, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Grid,
    Typography,
    Button,
    Tooltip,
    IconButton,
    useTheme,
    useMediaQuery,
    makeStyles,
    Drawer,
} from '@material-ui/core';
import { People, ChevronRight, AccountCircle } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../../redux/actions/user';
import firebase from '../../firebase/firebase';
import AdminAddChannel from '../chat/AdminAddChannel';
import MenuDrawer from './MenuDrawer';
import NotificationPanel from './Notifications/NotificationPanel';
import FriendsList from './Friends/FriendsList';
import { setAccountDrawer, setAccount } from '../../redux/actions/ui';

const drawerWidth = '300px';
const useStyles = makeStyles((theme) => ({
    appbar: {
        position: 'relative',
        zIndex: theme.zIndex.drawer + 1,
    },
    root: {
        display: 'flex',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: 'auto',
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
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

const Navbar = ({
    isAuthenticated,
    logout,
    setAccountDrawer,
    accountDrawer,
    setAccount,
    uid,
    displayName,
    avatar,
}) => {
    const [isAdmin, setIsAdmin] = useState(false);

    //Drawer
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    //Drawer end

    useEffect(() => {
        if (open) {
            const handleKey = (e) => {
                if (e.key === 'Escape') setOpen(false);
            };

            window.addEventListener('keyup', handleKey);
            return () => {
                window.removeEventListener('keyup', handleKey);
            };
        }
    }, [open]);

    const classes = useStyles();
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (isAuthenticated) {
            const user = firebase.auth().currentUser;
            firebase
                .firestore()
                .collection('users')
                .doc(user.uid)
                .get()
                .then((snapshot) => {
                    if (snapshot.data() && snapshot.data().admin)
                        setIsAdmin(snapshot.data().admin);
                });
        }
    }, [isAuthenticated]);

    return (
        <>
            <AppBar
                elevation={0}
                position="absolute"
                className={classes.appbar}
            >
                <Toolbar variant="dense">
                    <Grid container justify="space-between" alignItems="center">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {matches && <MenuDrawer />}
                            <Typography
                                variant="h5"
                                color="inherit"
                                component={Link}
                                to="/app"
                                style={{
                                    textDecoration: 'none',
                                    marginLeft: 15,
                                }}
                            >
                                Mastery
                            </Typography>
                        </div>
                        <div>
                            {isAuthenticated && isAdmin && <AdminAddChannel />}
                            {isAuthenticated ? (
                                <>
                                    <NotificationPanel size={'medium'} />
                                    <IconButton
                                        size={'medium'}
                                        color="inherit"
                                        onClick={() =>
                                            open
                                                ? handleDrawerClose()
                                                : handleDrawerOpen()
                                        }
                                    >
                                        <Tooltip title="Friends">
                                            <People />
                                        </Tooltip>
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            !accountDrawer &&
                                                setAccount(
                                                    uid,
                                                    displayName,
                                                    avatar
                                                );
                                            accountDrawer
                                                ? setAccountDrawer(false)
                                                : setAccountDrawer(true);
                                        }}
                                    >
                                        <AccountCircle />
                                    </IconButton>
                                    {/* <IconButton
                                        size={'medium'}
                                        color="inherit"
                                        onClick={logout}
                                    >
                                        <ExitToApp />
                                    </IconButton> */}
                                </>
                            ) : (
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/login"
                                >
                                    Login
                                </Button>
                            )}
                        </div>
                    </Grid>
                </Toolbar>
            </AppBar>
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

                    <IconButton onClick={handleDrawerClose}>
                        <ChevronRight />
                    </IconButton>
                </div>
                <FriendsList />
            </Drawer>
        </>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: !!state.user.uid,
    accountDrawer: state.ui.accountDrawer,
    uid: state.user.uid,
    displayName: state.user.displayName,
    avatar: state.user.photoURL,
});

export default connect(mapStateToProps, {
    logout,
    setAccountDrawer,
    setAccount,
})(Navbar);
