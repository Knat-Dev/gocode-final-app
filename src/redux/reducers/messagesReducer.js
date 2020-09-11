import {
    SET_INITIAL_MESSAGES,
    SHIFT_MESSAGE_PAGE,
    CONCAT_MESSAGE,
    SET_MESSAGES_LOADING,
    CLEAR_MESSAGES,
} from '../types';

const initialState = {
    loading: true,
    channelMessages: [],
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case SET_MESSAGES_LOADING:
            return { ...state, loading: true };
        case SET_INITIAL_MESSAGES:
            return { channelMessages: payload, loading: false };
        case SHIFT_MESSAGE_PAGE:
            return {
                ...state,
                channelMessages: [...payload, ...state.channelMessages],
            };
        case CONCAT_MESSAGE:
            return {
                loading: false,
                channelMessages: [...state.channelMessages, ...payload],
            };
        case CLEAR_MESSAGES:
            return { loading: false, channelMessages: [] };
        default:
            return state;
    }
};
