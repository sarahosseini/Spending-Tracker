const UserConnectivityReducer = (state = {}, action) => {
    switch(action.type){
        case "IS_USER_OFFLINE":
            return {isUserOffline: action.payload};
        default:
            return state;
    }
};

export default UserConnectivityReducer;