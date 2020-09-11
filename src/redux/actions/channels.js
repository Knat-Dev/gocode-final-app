import firebase from '../../firebase/firebase';
import { SET_CHANNELS } from '../types';
import { startSetSelectedChannel } from '../../redux/actions/channel';
import { setInitialMessages } from './messages';

export const setChannels = (channels) => ({
    type: SET_CHANNELS,
    payload: channels,
});

export const startSetChannels = () => (dispatch) => {
    const uid = firebase.auth().currentUser.uid;
    firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('channels')
        .onSnapshot((snapshot) => {
            const channels = [];
            snapshot.forEach((childSnapshot) => {
                channels.push(childSnapshot.data());
            });

            dispatch(
                setChannels(
                    channels.sort((a, b) =>
                        a.channel_name.toLowerCase() <
                        b.channel_name.toLowerCase()
                            ? -1
                            : a.channel_name.toLowerCase() >
                              b.channel_name.toLowerCase()
                            ? 1
                            : 0
                    )
                )
            );

            if (channels.length > 0) {
                dispatch(startSetSelectedChannel(channels[0]));
            } else dispatch(setInitialMessages([]));
        });
};
