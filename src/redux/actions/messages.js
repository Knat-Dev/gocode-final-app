import {
    SET_INITIAL_MESSAGES,
    SHIFT_MESSAGE_PAGE,
    CONCAT_MESSAGE,
    SET_MESSAGES_LOADING,
} from '../types';

export const setInitialMessages = (messages) => (dispatch) => {
    dispatch({
        type: SET_INITIAL_MESSAGES,
        payload: messages,
    });
};

export const shiftMessagePage = (newMessages) => (dispatch) => {
    dispatch({
        type: SHIFT_MESSAGE_PAGE,
        payload: newMessages,
    });
};

export const concatMessages = (newMessages) => (dispatch, getState) => {
    const messages = getState().messages.channelMessages;
    const addMessages = newMessages.filter(
        (item) => !messages.find((obj) => obj.message_id === item.message_id)
    );
    dispatch({
        type: CONCAT_MESSAGE,
        payload: addMessages,
    });
};

export const setMessagesLoading = () => (dispatch) => {
    dispatch({
        type: SET_MESSAGES_LOADING,
    });
};
