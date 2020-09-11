import React, { Fragment } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({
    isAuthenticated,
    hasDisplayName,
    component: Component,
    ...rest
}) => {
    return (
        <Fragment>
            <Route
                {...rest}
                render={(props) =>
                    isAuthenticated ? (
                        hasDisplayName ? (
                            <Component {...props} />
                        ) : (
                            <div>
                                <Redirect to="/updateProfile" />
                                <Component {...props} />
                            </div>
                        )
                    ) : (
                        <Redirect to="/login" />
                    )
                }
            />
        </Fragment>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: !!state.user.uid,
    hasDisplayName: !!state.user.displayName,
});

export default connect(mapStateToProps)(PrivateRoute);
