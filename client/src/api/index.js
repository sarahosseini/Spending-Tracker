// Redux components
import {useDispatch} from 'react-redux';
import {useSelector} from 'react-redux';

// Other
import {setTransactionData, setOfflineStatus} from '../actions';


const fetch = require('node-fetch');
// const flaskEndpoint = "https://spendingtracker.billahmed.com";
const flaskEndpoint = "http://127.0.0.1:5000";

/**GET request to server.js API, store response in redux STORE
 * @param successFunc The function to execute when data is successfully retrieved. Takes in parameters: 
 * (key, value), where value is response data
 * @param key The key to pass into the function
 */
function FetchData(successFunc, key) {
    const dispatch = useDispatch();
    // Check if we are in offline mode
    const connectivityInfo = useSelector(state => state.UserConnectivity);

    var endpoint = `${flaskEndpoint}/_api/fetchTransactions`;

    var options = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "accessToken": localStorage.getItem("accessToken")
        },
    }

    fetch(endpoint, options)
    .then(res => {

        // If user is not given a type of error message, throw the appropriate status code
        if(res.status >= 400){
            throw res.status;
        }
        return res.json()})
    .then(resp => {

        // Update out STORE with this transaction data
        resp = mapDateToAmount(resp);
        dispatch(setTransactionData(resp));
        // dispatch(setOfflineStatus(false));
        // Run success function
        successFunc(key, resp);
    })
    .catch((error) => {
        if(connectivityInfo.isUserOffline){
            // Do nothing
        } else{
            dispatch(setOfflineStatus(true));
        }
    });
}

/**POST request to store a new transaction
 * 
 * @param recordInformation (object) The new record to store.
 * @param onFinishFunc (Function) The function to call when api request is completed. The function 
 * must take a parameter "respData", which is in the format: {status: bool, message: str, code: int}
 * @returns (Object) Response data from api request
 */
export function CreateTransaction(recordInformation, onFinishFunc){
    var endpoint = `${flaskEndpoint}/_api/createTransaction`;
    
    var body = {
        title: recordInformation.title,
        amountSpent: recordInformation.amountSpent,
        date: recordInformation.date,
        location: recordInformation.location,
        category: recordInformation.category,
        additionalNotes: recordInformation.additionalNotes}

    var options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "accessToken": localStorage.getItem("accessToken")
        },
        body: JSON.stringify(body)
    }
    //console.log(recordInformation);
    return new Promise(function(resolve, reject){
        fetch(endpoint, options)
        .then(res => {
            resolve(res);    
        })
        .catch((error) => {
            reject(error);    
        });
    });
}

/**Bulk upload of many transactions.
 * @param data The data to upload. Must be in the format: [ { date: str, title: str, amountSpent: str }, { ... }, ... ]. 
 * This data structure is formed via the CreateBulkTransactionsObject(data) function.
 * @returns (Object) Response data from api request
 */
export function CreateBulkTransactions(data){
    var endpoint = `${flaskEndpoint}/_api/bulkUploadTransactions`;
    
    var body = {
        bulkData: data,
    }

    var options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "accessToken": localStorage.getItem("accessToken")
        },
        body: JSON.stringify(body)
    }

    return new Promise(function(resolve, reject){
        fetch(endpoint, options)
        .then(res => {
            resolve(res);  
        })
        .catch((error) => {
            reject(error);    
        });
    });
}

/**POST request to delete and existing transaction
 * 
 * @param transactionID (str) The transaction to remove.
 * @param onFinishFunc (Function) The function to call when api request is completed. The function 
 * must take a parameter "respData", which is in the format: {status: bool, code: int, action: str, message: str}
 * @returns (Object) Response data from api request
 */
export function DeleteTransaction(transactionID, onFinishFunc){
    var endpoint = `${flaskEndpoint}/_api/deleteTransaction`;
    
    var body = {
        transactionID: transactionID,
    }

    var options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            "accessToken": localStorage.getItem("accessToken")
        },
        body: JSON.stringify(body)
    }

    return new Promise(function(resolve, reject){
        fetch(endpoint, options)
        .then(res => {
            resolve(res);  
        })
        .catch((error) => {
            reject(error);    
        });
    });
}

/**Handle response data from api call
 * @param resp The raw response data
 * @param callback The function to send data to
 * @param action (str) The action that was taken, e.g. "createTransaction", "deleteTransaction", etc.
 */
function handleTransactionResponse(resp, callback, action){
    let result = {ok: resp.ok, status: resp.status, action: action};
    if(resp.ok){
        return result;
    } else{
        resp.json().then((res) => {
            console.log(res);
        })
    }
}

/* *** HELPER FUNCTIONS FOR MANIPULATING TRANSACTION DATA *** */

/**Given the raw data from firebase, map all the dates to the amount spent each day
 * @param rawData The data retrieved from server
 * @returns A modified response that includes a mapping of each data to the amount spent
 */
function mapDateToAmount(rawData){
    let dates = rawData.amountPerMetric.dates;
    let amounts = rawData.amountPerMetric.totalExpenses;

    // Add new field for amount spent per day
    let amountPerDay = {};

    for(let i=0; i < dates.length; i++){
        amountPerDay[formatDate(dates[i])] = amounts[i];
    }

    // Add a new field that maps each day to the amount spent on that day
    rawData.amountPerMetric.amountPerDay = amountPerDay;
    return rawData;

}

/**Given a date, format and return it as a JS Date() object 
 * @param date The date to confirm, in string format. Must be like: "Fri, 15 Mar 2019 04:00:00 GMT"
 * @returns A Date() object representing the provided date
*/
function formatDate(date){
    // Split the date int [DD, MM, YYYY]
    let tempDate = date.substring(5, date.length - 13).split(" ");

    return new Date(tempDate);
}

/**Given a date, format and return it as a different string
 * @param date (String) A date in the format "MM/DD/YYYY"
 * @returns A date in the format "YYYY-MM-DD"
 */
function formatDateAsYDM(date){
    let dateArr = date.split("/");

    // Pad any leading "0" characters to days/months that are only single digits
    if(dateArr[0].length === 1){
        dateArr[0] = "0" + dateArr[0];
    }
    if(dateArr[1].length === 1){
        dateArr[1] = "0" + dateArr[1];
    }

    let result = `${dateArr[2]}-${dateArr[0]}-${dateArr[1]}`

    return result;
}


/**Given array of transactions, create an object to represent the entire list
 * @param data ([Object]) Array of transaction data. Must be in the format [[date: str, title: str, debit: str], [date2: str, title2: str, debit2: str], ... ]
 * @returns An array of objects that's ready to be shipped to back-end, in the format: [ { date: str, title: str, amountSpent: str }, { ... }, ... ]
 */
function CreateBulkTransactionsObject(data){
    let result = [];
    
    // For every transaction data
    for(let i = 0; i < data.length; i++){

        // Create object to store all the required transaction info
        let currTransaction = {date: formatDateAsYDM(data[i][0].trim()), title: data[i][1].trim(), amountSpent: data[i][2].trim()};

        result.push(currTransaction);   // Append to array
    }

    return result;
}

/**Remove all non-debit transactions from given transaction records
 * @param data ([Object]) Array of transaction data. Must be in the format [[date: str, title: str, debit: str], [date2: str, title2: str, debit2: str], ... ]
 * @returns Same object as given, but without the credit transactions
 */
function RemoveNonDebitTransactions(data){
    let result = [];

    for(let i = 0; i < data.length; i++){
        if(data[i][2] !== ''){
            result.push(data[i]);
        }
    }

    return result;
}

const funcs = {FetchData, formatDate, CreateBulkTransactionsObject, RemoveNonDebitTransactions};

export default funcs;