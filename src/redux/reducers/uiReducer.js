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

const initialState = {
    drawerOpen: false,
    isMobile: false,
    accountDrawer: false,
    currentAccount: {
        displayName: '',
        uid: '',
        avatar: '',
    },
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case OPEN_DRAWER:
            return { ...state, drawerOpen: true };
        case CLOSE_DRAWER:
            return { ...state, drawerOpen: false };
        case SET_MOBILE:
            return { ...state, mobile: true };
        case SET_NOT_MOBILE:
            return { ...state, drawerOpen: false, mobile: false };
        case SET_ACCOUNT_DRAWER_OPEN:
            return { ...state, accountDrawer: true };
        case SET_ACCOUNT_DRAWER_CLOSE:
            return { ...state, accountDrawer: false };
        case SET_ACCOUNT:
            return { ...state, currentAccount: { ...payload } };
        case SET_USER_URL:
            return { ...state, userUrl: true };
        default:
            return state;
    }
};
