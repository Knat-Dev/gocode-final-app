import {
    SET_SELECTED_CHANNEL,
    CLEAR_SELECTED_CHANNEL,
    SET_IS_PRIVATE,
    SET_IS_CLASS_ROOM,
} from '../types';

const initialState = {
    isPrivate: false,
    isClassRoom: false,
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case SET_SELECTED_CHANNEL:
            return { ...state, ...payload };
        case CLEAR_SELECTED_CHANNEL:
            return {};
        case SET_IS_PRIVATE:
            return { ...state, isPrivate: payload };
        case SET_IS_CLASS_ROOM:
            return { ...state, isClassRoom: payload };
        default:
            return state;
    }
};
