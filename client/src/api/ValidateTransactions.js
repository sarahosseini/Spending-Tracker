/**A function to validate all the transactions
 * a user uploads. Must be in the format [[date: str, title: str, debit: str], [date2: str, title2: str, debit2: str], ... ]
 * @param data ([Object]) Array of transaction data
 * @returns true if and only if all transactions are valid, false otherwise
 */
function ValidateTransactions(data){
    // For every transaction record
    for(let i = 0; i < data.length; i++){
        
        // Store if current record is valid or not; [0] = date, [1] = title of transaction, [2] = $ spent
        let tempResult = verifyDate(data[i][0]) && verifyTitle(data[i][1]) && verifyAmount(data[i][2]);

        // If this transaction failed the test, immediately return false
        if(!tempResult){
            console.log(data[i]);
            return false;
        }
    }
    return true;
}

/* Helper function to verify each part of the mandatory transaction data */

/**A function to validate the date.
 * @param data (String) String representation of the date
 * @returns true if and only if all transactions are valid, false otherwise
 */
function verifyDate(data){

    if(data === ''){
        return false;
    }

    try {
        let tempDate = new Date(data);  // Try converting to date object
    } catch (error) {
        console.log(error);
        return false;
    }

    return true;
}


/**A function to validate the title of a transaction.
 * @param data (String) The title of the transaction
 * @returns true if and only if all transactions are valid, false otherwise
 */
function verifyTitle(data){
    return (data.trim() === '' ? false : true);
}


/**A function to validate the dollar ammount spent.
 * @param data (String) String representation of the amount spent
 * @returns true if and only if all transactions are valid, false otherwise
 */
function verifyAmount(data){
    try {
        let tempInt = parseFloat(data); // Parse string as float
        if(tempInt < 0){                // Make sure non-zero number is given
            return false;
        }
    } catch {
        return false;
    }

    return true;
}


export default ValidateTransactions;