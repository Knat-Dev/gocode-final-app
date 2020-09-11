import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import firebase from './firebase/firebase';
import * as serviceWorker from './serviceWorker';
import { Loading } from './components/layout/Loading';
import { history } from './components/router/AppRouter';
import store from './redux/store';

// dispatch action types
import {
    LOGIN,
    CLEAR_MESSAGES,
    CLEAR_SELECTED_CHANNEL,
    CLEAR_CHANNELS,
} from './redux/types';
import {
    login,
    logout,
    setUserNotifications,
    setUserFriends,
    setTeacher,
} from './redux/actions/user';
import { Provider } from 'react-redux';
import { startSetChannels } from './redux/actions/channels';
import { setAccount } from './redux/actions/ui';
import { addUserProfile } from './redux/actions/cache';

let app = (
    <Provider store={store}>
        <App />
    </Provider>
);

let hasRendered = false;
const renderApp = () => {
    if (!hasRendered) {
        ReactDOM.render(app, document.getElementById('root'));
        hasRendered = true;
    }
};

ReactDOM.render(<Loading />, document.getElementById('root'));

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('Logging in...checking displayName existence');
        store.dispatch(login(user.uid, user.displayName, user.photoURL));
        store.dispatch(setUserNotifications());
        store.dispatch(setUserFriends());
        store.dispatch(
            addUserProfile(user.uid, user.displayName, user.photoURL)
        );

        if (user.displayName) {
            console.log('logged in');
            store.dispatch(setTeacher(user.uid)).then(() => {
                console.log('teacher was set');
                renderApp();
                if (history.location.pathname === '/') history.push('/app');
            });
        } else {
            renderApp();
            history.push('/updateProfile');
        }
    } else {
        console.log('logged out');
        store.dispatch({ type: CLEAR_MESSAGES });
        store.dispatch({ type: CLEAR_SELECTED_CHANNEL });
        store.dispatch({ type: CLEAR_CHANNELS });
        renderApp();
        history.push('/login');
    }
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
