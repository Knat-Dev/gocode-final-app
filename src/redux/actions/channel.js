import {
    SET_SELECTED_CHANNEL,
    SET_IS_PRIVATE,
    SET_IS_CLASS_ROOM,
} from '../types';
import { history } from '../../components/router/AppRouter';
import firebase from '../../firebase/firebase';
let first = true;
export const startSetSelectedChannel = (channel, isPrivate, isClassRoom) => (
    dispatch,
    getState
) => {
    if (
        !history.location.pathname.includes('media') &&
        !history.location.pathname.includes('users')
    )
        window.history.pushState(null, null, '/app/' + channel.channel_id);
    // reset the amount of unread message when selecting a channel
    const uid = getState().user.uid;
    if (uid && !first) {
        console.log(channel.channel_id);
        const userChannelData = firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection(
                isPrivate
                    ? 'private_channels'
                    : isClassRoom
                    ? 'class_rooms'
                    : 'channels'
            )
            .doc(channel.channel_id)
            .collection('info')
            .doc('data');

        const channelRef = firebase
            .firestore()
            .collection(
                isPrivate
                    ? 'private_channels'
                    : isClassRoom
                    ? 'class_rooms'
                    : 'channels'
            )
            .doc(channel.channel_id);

        firebase.firestore().runTransaction(async (t) => {
            const userChannelDataDoc = await t.get(userChannelData);
            const data = userChannelDataDoc.data();

            const channelData = await (await t.get(channelRef)).data();

            if (channelData && data)
                await t.update(userChannelData, {
                    message_count: firebase.firestore.FieldValue.increment(
                        -(data.message_count - channelData.message_count)
                    ),
                });
        });
    }
    first = false;

    dispatch({
        type: SET_SELECTED_CHANNEL,
        payload: channel,
    });
};

export const setSelectedChannel = (channel) => (dispatch) => {
    dispatch({
        type: SET_SELECTED_CHANNEL,
        payload: channel,
    });
};

export const setPrivateChannel = (isPrivate) => (dispatch) => {
    console.log(`isPrivate ${isPrivate}`);
    dispatch({ type: SET_IS_PRIVATE, payload: isPrivate });
};

export const setClassRoom = (isClassRoom) => (dispatch) => {
    console.log(`isClassRoom ${isClassRoom}`);
    dispatch({ type: SET_IS_CLASS_ROOM, payload: isClassRoom });
};
