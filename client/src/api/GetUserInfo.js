// Redux components
import {useSelector, useDispatch} from 'react-redux';
import {isMobileUser} from '../actions';

/**Determine if the current user is on a mobile device
 * @returns Sets redux store value of "isMobileUser" to true iff the current user is on a mobile device, false otherwise
 */
function GetUserInfo(){
    const dispatch = useDispatch();

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent) ) {
        dispatch(isMobileUser(true));   // Set value of isMobileUser to true in redux store
        localStorage.setItem("isMobileUser", true);
        return;
    }
    localStorage.setItem("isMobileUser", false);
    dispatch(isMobileUser(false));
}

const funcs = {GetUserInfo};
export default funcs;