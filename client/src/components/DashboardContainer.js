import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dashboard from './Dashboard';
import FetchData from '../api'; 
import firebase from 'firebase';
import UserInfo from '../api/GetUserInfo'
import {setTransactionData} from '../actions';
import { useSnackbar } from 'notistack';

// Redux components
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';


const snackbarKey = "notifyUserOffline";

export function DashboardContainer(props) {
    // Equivalent to this.state
    const [state, setState] = useState({});
    const dispatch = useDispatch();
    const {enqueueSnackbar, closeSnackbar } = useSnackbar();
    
    FetchData.FetchData(setCache, "transactionData"); // Update transaction data in STORE
    UserInfo.GetUserInfo(); // Retrieve all user required information

    // Check if we are in offline mode
    const connectivityInfo = useSelector(state => state.UserConnectivity);
    
    if(connectivityInfo.isUserOffline){
        // Parse data from cache
        let tempTransactionData = localStorage.getItem("transactionData");
        tempTransactionData = JSON.parse(tempTransactionData);

        // Add cached data to redux store
        dispatch(setTransactionData(tempTransactionData));

        let message = "Unable to authenticate with the server. Try logging out and back in."
        // Notify user of offline mode
        enqueueSnackbar(message, {
            variant: 'default',
            persist: true,
            preventDuplicate: true,
            key: snackbarKey
        });
    }

    return(
        <Dashboard handleLogOut={handleLogOut}/>
    );
}


/**** Various helper functions for the app ****/

/**Given some data, add it to the cache with the specified key
 * @param key (str) The key to use when setting this value
 * @param value (object) The value to store for the given key
 */
function setCache(key, value){

    let itemToCache = JSON.stringify(value)
    console.log("Updated cache with transaction data.");
    localStorage.setItem(key, itemToCache);   // Add to local storage
}

/**Given some key, retrieve the cached data
 * @param key (str) The key to use when getting a value
 * @returns An object that the provided key maps to in the cache
 */
function getCache(key){
    return localStorage.getItem(key);
}

/**Logout the current user via firebase.auth, and other house-keeping items */
function handleLogOut(){

    localStorage.removeItem("userName");
    localStorage.removeItem("userPhoto");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isMobileUser");
    firebase.auth().signOut()
    .then(() => {
        // Take user to home screen
        window.location.href = "/";

    })
    .catch((err) => {
        console.log(err);
        alert("Error when trying to logout. Check console log for details");
    });
    
}

export default DashboardContainer;