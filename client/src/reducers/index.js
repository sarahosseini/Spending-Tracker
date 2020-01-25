import {combineReducers} from 'redux';
import UserConnectivityReducer from './Connectivity';
import transactionDataReducer from './transactionData';
import UserInfoReducer from './GetUserInfo';

const allReducers = combineReducers({
    UserConnectivity: UserConnectivityReducer,
    transactionData: transactionDataReducer,
    UserInfo: UserInfoReducer
});

export default allReducers;     