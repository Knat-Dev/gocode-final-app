import {
    LOGIN,
    LOGOUT,
    SET_USER_NOTIFICATIONS,
    SET_USER_FRIENDS,
    SET_USER_PRIVATE_CHANNELS,
    SET_TEACHER,
    SET_USER_CLASS_ROOMS,
} from '../types';

const initialState = {
    uid: '',
    displayName: '',
    photoURL: '',
    teacher: false,
    notifications: [],
    private_channels: [],
    class_rooms: [],
    friends: [],
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case LOGIN:
            return {
                ...state,
                uid: payload.uid,
                displayName: payload.displayName,
                photoURL: payload.photoURL,
            };
        case LOGOUT:
            return { ...initialState };
        case SET_USER_NOTIFICATIONS:
            return {
                ...state,
                notifications: payload.sort(
                    (a, b) => b.timestamp - a.timestamp
                ),
            };
        case SET_USER_FRIENDS:
            return {
                ...state,
                friends: payload.sort((a, b) => a.displayName - b.displayName),
            };
        case SET_USER_PRIVATE_CHANNELS:
            return {
                ...state,
                private_channels: payload.sort(
                    (a, b) => a.channel_name - b.channel_name
                ),
            };
        case SET_USER_CLASS_ROOMS:
            return {
                ...state,
                class_rooms: payload.sort(
                    (a, b) => a.channel_name - b.channel_name
                ),
            };
        case SET_TEACHER:
            return {
                ...state,
                teacher: true,
            };
        default:
            return state;
    }
};
