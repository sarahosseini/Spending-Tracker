const UserInfoReducer = (state = {}, action) => {
    switch(action.type){
        case "IS_MOBILE_USER":
            return {isMobileUser: action.payload};
        default:
            return state;
    }
};

export default UserInfoReducer;