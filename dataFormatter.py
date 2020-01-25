import datetime

def validateData(data: dict):
    ''' Validate the user data such as title, date, etc.\n
    (dict) -> bool
    '''
    if((data['title'].strip() == '')):
        return False
    
    # Test if date is valid
    try:
        formatDate(data['date'])
    except:
        return False

    try:
        temp = float(data['amountSpent'])
        # If negative number is given
        if(temp < 0):
            return False
    except:
        return False

    # All other cases, data should be valid
    return True


def formatDate(date: str):
    ''' Format a string date into a datetime object. The date must be in the format "MM-DD-YYYY"\n
    (str) -> datetime
    '''
    return (datetime.datetime(int(date[0:4]), int(date[5:7]), int(date[8:])))


def formatTransactionRecords(docs: dict):
    '''Format the data recieved from Firestore into a more usable format\n
    (dict) => dict
    ''' 
    resp = {}
    #resp["amountPerLocation"] = dict()
    resp["amountPerMetric"] = dict()
    resp["amountPerMetric"]["amountPerLocation"] = dict()
    totalTransactionsPerDate = dict()

    raw_data = []

    # 1.1 Store ID's of eahc transaction
    uid = []
    # 1.2 User defined titles of each transaction
    titles = []
    # 1.3 Store the names of each location
    locations = []
    # 1.4 Store the amount spent at each location
    amountSpent = []

    # 2.1 All the unique dates that transactions were made
    transactionDates = []
    # 2.2 Total expenses per date
    totalExpenses = []

    for doc in docs:
        temp_doc = doc.to_dict()

        # Filter out the initial record created when a new user is signed-up
        if(temp_doc["Title"] != "__initial_record__"):

            # Apend appropriate information to each arrayp
            uid.append(doc.id)
            titles.append(temp_doc["Title"])
            locations.append(temp_doc["Location"])
            amountSpent.append(temp_doc["Amount"])

            # Add data to the resp["amountPerDay"] dictionary
            if(temp_doc["Date"] in totalTransactionsPerDate):
                totalTransactionsPerDate[temp_doc["Date"]] += temp_doc["Amount"]
            else:
                totalTransactionsPerDate[temp_doc["Date"]] = temp_doc["Amount"]

            # Append unformatted data to the end in case we need it later on...
            raw_data.append({"id": doc.id, "data": doc.to_dict()})
    
    # Go through the resp["amountPerDay"] dictionary an collect all keys and values into separate 
    for key in totalTransactionsPerDate:
        transactionDates.append(key)
        totalExpenses.append("%.2f" % totalTransactionsPerDate[key]) # Round to 2 decimal places
    
    resp["amountPerMetric"]["dates"] = transactionDates
    resp["amountPerMetric"]["totalExpenses"] = totalExpenses

    # Amount spend per location
    resp["amountPerMetric"]["amountPerLocation"]["uid"] = uid
    resp["amountPerMetric"]["amountPerLocation"]["Title"] = titles
    resp["amountPerMetric"]["amountPerLocation"]["locations"] = locations
    resp["amountPerMetric"]["amountPerLocation"]["amountSpent"] = amountSpent

    # Raw, un-touched data from cloud firestore
    resp["raw_data"] = raw_data

    

    return resp