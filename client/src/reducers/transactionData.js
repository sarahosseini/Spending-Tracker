const transactionDataReducer = (state = {}, action) => {
    switch(action.type){
        case "GET_DATA":
            return state;
        case "SET_DATA":
            return action.payload;
        case "IS_MOBILE_USER":
            return state;
        default:
            return state;
    }
};

export default transactionDataReducer;