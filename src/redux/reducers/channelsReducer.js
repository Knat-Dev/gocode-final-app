import { SET_CHANNELS, CLEAR_CHANNELS } from '../types';

const initialState = {
    loading: true,
    userChannels: [],
};

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case SET_CHANNELS:
            return {
                userChannels: payload,
                loading: false,
            };
        case CLEAR_CHANNELS:
            return {
                ...initialState,
            };
        default:
            return state;
    }
};
