import React from 'react';
import { Switch, Router } from 'react-router';
import Home from '../pages/Home';
import { createBrowserHistory } from 'history';

import Login from '../pages/Login';
import { Grid } from '@material-ui/core';
import Navbar from '../layout/Navbar';
import UpdateProfile from '../pages/UpdateProfile';
import PrivateRoute from '../../util/PrivateRoute';
import PublicRoute from '../../util/PublicRoute';
import Invite from '../pages/Invite';

export const history = createBrowserHistory();

export default () => {
    return (
        <Router history={history}>
            <Grid item>
                <Grid item>
                    <Navbar />
                </Grid>
                <Switch>
                    <PrivateRoute exact path="/app" component={Home} />
                    <PrivateRoute
                        path="/app/:channelId/:media"
                        component={Home}
                    />
                    <PrivateRoute path="/app/:channelId" component={Home} />
                    <PrivateRoute path="/users/:uid" component={Home} />
                    <PrivateRoute
                        exact
                        path="/invite/:channelId"
                        component={Invite}
                    />

                    <PublicRoute exact path="/login" component={Login} />
                    <PrivateRoute
                        exact
                        path="/updateProfile"
                        component={UpdateProfile}
                    />
                </Switch>
            </Grid>
        </Router>
    );
};
