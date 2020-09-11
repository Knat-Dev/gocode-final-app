import React from 'react';
import { IconButton, SwipeableDrawer } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { Sidebar } from './Sidebar';
import { connect } from 'react-redux';
import { closeDrawer, openDrawer } from '../../redux/actions/ui';

const MenuDrawer = ({ open, openDrawer, closeDrawer }) => {
    return (
        <>
            <IconButton color="inherit" onClick={openDrawer}>
                <Menu />
            </IconButton>
            <SwipeableDrawer
                anchor="left"
                open={open}
                onClose={closeDrawer}
                onOpen={openDrawer}
            >
                <div style={{ minWidth: 250 }}>
                    <Sidebar />
                </div>
            </SwipeableDrawer>
        </>
    );
};

const mapStateToProps = (state) => ({
    open: state.ui.drawerOpen,
});

const mapDispatchToProps = {
    openDrawer,
    closeDrawer,
};

export default connect(mapStateToProps, mapDispatchToProps)(MenuDrawer);
