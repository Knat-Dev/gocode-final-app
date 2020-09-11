import {
    OPEN_DRAWER,
    CLOSE_DRAWER,
    SET_MOBILE,
    SET_NOT_MOBILE,
    SET_ACCOUNT_DRAWER_OPEN,
    SET_ACCOUNT_DRAWER_CLOSE,
    SET_ACCOUNT,
    SET_USER_URL,
} from '../types';

export const openDrawer = () => (dispatch) => {
    dispatch({
        type: OPEN_DRAWER,
    });
};

export const closeDrawer = () => (dispatch) => {
    dispatch({
        type: CLOSE_DRAWER,
    });
};

export const setMobile = () => (dispatch) => {
    dispatch({
        type: SET_MOBILE,
    });
};

export const setNotMobile = () => (dispatch) => {
    dispatch({
        type: SET_NOT_MOBILE,
    });
};

export const setAccountDrawer = (val) => (dispatch) => {
    if (val) {
        dispatch({ type: SET_ACCOUNT_DRAWER_OPEN });
    } else {
        dispatch({ type: SET_ACCOUNT_DRAWER_CLOSE });
    }
};

export const setAccount = (uid, displayName, avatar) => (dispatch) => {
    dispatch({ type: SET_ACCOUNT, payload: { uid, displayName, avatar } });
};

export const setUserUrl = () => (dispatch) => {
    dispatch({ type: SET_USER_URL });
};
