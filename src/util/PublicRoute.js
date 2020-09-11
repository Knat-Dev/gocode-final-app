import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

function PublicRoute({ isAuthenticated, component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            exact
            component={(props) =>
                !isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/app" />
                )
            }
        />
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: !!state.user.uid,
});

export default connect(mapStateToProps)(PublicRoute);
