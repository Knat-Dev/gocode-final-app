import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import userReducer from '../redux/reducers/userReducer';
import channelsReducer from './reducers/channelsReducer';
import channelReducer from './reducers/channelReducer';
import messagesReducer from './reducers/messagesReducer';
import uiReducer from './reducers/uiReducer';
import cachingReducer from './reducers/cachingReducer';

const initialState = {};

const middlware = [thunk];

const reducers = combineReducers({
    user: userReducer,
    channel: channelReducer,
    channels: channelsReducer,
    messages: messagesReducer,
    ui: uiReducer,
    cache: cachingReducer,
});
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(...middlware))
);

export default store;
