import {
    ADD_CACHED_USER,
    SET_FRIEND_REQUEST_PENDING,
    ADD_FRIEND_STATUS,
    ADD_USER_PROFILE,
} from '../types';

const initialState = {
    userPopovers: {},
    friendStatuses: {},
    userProfiles: {},
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case ADD_CACHED_USER:
            return {
                ...state,
                userPopovers: {
                    ...state.userPopovers,
                    [payload.nickname]: payload,
                },
            };
        case SET_FRIEND_REQUEST_PENDING:
            return {
                ...state,
                userPopovers: {
                    ...state.userPopovers,
                    [payload.nickname]: payload,
                },
            };
        case ADD_FRIEND_STATUS:
            return {
                ...state,
                friendStatuses: {
                    ...state.friendStatuses,
                    [payload.displayName]: payload.status,
                },
            };
        case ADD_USER_PROFILE:
            return {
                ...state,
                userProfiles: {
                    ...state.userProfiles,
                    [payload.uid]: payload,
                },
            };
        default:
            return state;
    }
};
