import {
    ADD_CACHED_USER,
    SET_FRIEND_REQUEST_PENDING,
    ADD_FRIEND_STATUS,
    ADD_USER_PROFILE,
} from '../types';

export const addCachedUser = (user) => (dispatch) => {
    dispatch({ type: ADD_CACHED_USER, payload: user });
};

export const setFriendRequestPending = (cond, displayName) => (
    dispatch,
    getState
) => {
    let user = getState().cache.userPopovers[displayName];
    user = { ...user, pending: cond };
    dispatch({
        type: SET_FRIEND_REQUEST_PENDING,
        payload: user,
    });
};

export const addFriendStatus = (displayName, status) => (dispatch) => {
    dispatch({ type: ADD_FRIEND_STATUS, payload: { displayName, status } });
};

export const addUserProfile = (uid, displayName, avatar) => (dispatch) => {
    dispatch({ type: ADD_USER_PROFILE, payload: { uid, displayName, avatar } });
};
