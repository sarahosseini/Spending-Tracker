from dataFormatter import *
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
import sys
import os
import datetime
import time
import random

app = Flask(__name__)

# Enable CORS
CORS(app)

# If in dev environment, use relative local path
try:
    if os.environ['ENV'] == 'dev':
        cred = credentials.Certificate('./serviceAccount.json')
except:
    cred = credentials.Certificate('/etc/secrets/serviceAccount.json')


''' Initialize connection to Firebase databse (firestore) '''
# Use a service account
firebase_admin.initialize_app(cred)

# Initialize db
db = firestore.client()

# Initialize dictionary as a cache
USER_INFO = dict()

# Initialize cache size 
CACHE_SIZE = 100

# Maximum number of transactions allowed in bulk upload
MAX_NUM_BULK_TRANSACTIONS = 500

''' API routes '''
@app.route('/_api/fetchTransactions', methods = ['GET'])
def fetchTransactions():

    # 1. Verify user's accessToken
    accessToken = request.headers.get("accessToken")
    isAuth = isAuthenticated(accessToken)

    if(not isAuth[0]):
        # If verification fails, return error message
        response = jsonify({"ErrorMessage": "Invalid Access Token"})
        response.status_code = 401
        return response

    decoded_token = isAuth[1]
    uid = decoded_token['uid']

    # Check if user with UID uid already exists in memory
    if(uid in USER_INFO):
        # Return this info
        return jsonify(USER_INFO[uid])
    
    # 2. Build the path where the user UID has all their transactions
    endpoint = u'users/' + uid + u'/records'

    # 2.1 Before retrieving results, check if user with UID uid exists in our database; if not, create entry
    userExists = verifyUserExists(db, uid, endpoint=u'users')

    if(not userExists):
        createNewUserEntry(db, uid, decoded_token, endpoint=u'users')

    # 3. Get all records for current user, ordered by date
    docs = db.collection(endpoint).order_by(u"Date").get()
    resp = formatTransactionRecords(docs)

    # Add this data to memory for user with UID uid
    if(len(USER_INFO) > CACHE_SIZE):   # If we've reached the max caching, remove a random element
        key = random.choice(USER_INFO.keys())
        USER_INFO.pop(key)

    USER_INFO[uid] = resp
    print("Added user with UID", uid, "to cache.")

    # 4. Format and return the response as JSON object
    return jsonify(resp)

@app.route('/_api/createTransaction', methods = ['POST'])
def createTransaction():

    # 1. Verify user's accessToken
    accessToken = request.headers.get("accessToken")
    isAuth = isAuthenticated(accessToken)

    if(not isAuth[0]):
        # If verification fails, return error message
        response = jsonify({"ErrorMessage": "Invalid Access Token"})
        response.status_code = 401
        return response

    # Retrieve user's UID
    decoded_token = isAuth[1]
    uid = decoded_token['uid']

    # Transaction data in the form of a dictionary
    newTransactionData = request.get_json()
    
    # Validate transaction data
    if(not (validateData(newTransactionData))):
        # Since there are errors in the transaction data, return bad request
        response = jsonify({"ErrorMessage": "Improper transaction data"})
        response.status_code = 400
        return response

    # Clear entry for user with UID uid from memory
    if(uid in USER_INFO):
        USER_INFO.pop(uid)
        print("Removed user with UID", uid, "from memory.")

    print(newTransactionData)
    # Format the new transaction data into something Firestore will accept
    postData = {
        u'Title': newTransactionData['title'],
        u'Amount': float(newTransactionData['amountSpent']),
        u'Date': formatDate(newTransactionData['date']),
        u'Location': newTransactionData['location'] if (newTransactionData['location'] != "") else "N/A",
        u'Category': newTransactionData['category'] if (newTransactionData['category'] != "") else "N/A",
        u'Notes': newTransactionData['additionalNotes'] if (newTransactionData['additionalNotes'] != "") else "N/A"
    }

    # 4. Format and return the response as JSON object
    try:
        db.collection(u'users').document(uid).collection(u'records').add(postData)
        time.sleep(2)   # Sleep for a few seconds to allow Firebase to commit changes
        return jsonify({"ok": True})
    except:
        return jsonify({"ok": False, "Error": "An error ocurred while attempting to create a new transaction."})


@app.route('/_api/bulkUploadTransactions', methods = ['POST'])
def bulkUploadTransactions():

    # 1. Verify user's accessToken
    accessToken = request.headers.get("accessToken")
    isAuth = isAuthenticated(accessToken)

    if(not isAuth[0]):
        # If verification fails, return error message
        response = jsonify({"ErrorMessage": "Invalid Access Token"})
        response.status_code = 401
        return response

    # Retrieve user's UID
    decoded_token = isAuth[1]
    uid = decoded_token['uid']

    # Transaction data in the form of a dictionary
    newTransactionData = request.get_json()
    bulkData = newTransactionData['bulkData']

    print(bulkData)

    # Store all the data to be posted to firebase
    postData = []

    # Validate transaction data
    # If number of transactions is greater than max allowed, return error
    if(len(bulkData) > MAX_NUM_BULK_TRANSACTIONS):
        response = jsonify({"ErrorMessage": "Too many transactions. Maximum of 500 allowed."})
        response.status_code = 400
        return response

    # For every transaction, verify it
    for entry in bulkData:
        if(not validateData(entry)):
            # Since there are errors in the transaction data, return bad request
            response = jsonify({"ErrorMessage": "Improper transaction data"})
            response.status_code = 400
            return response
        else:
            postData.append({
                u'Title': entry['title'],
                u'Amount': float(entry['amountSpent']),
                u'Date': formatDate(entry['date']),
                u'Location': "N/A",
                u'Category': "N/A",
                u'Notes': "N/A"
            })
    

    # At this point, all transaction data is valid
    # Clear entry for user with UID uid from memory
    if(uid in USER_INFO):
        USER_INFO.pop(uid)
        print("Removed user with UID", uid, "from memory.")
    

    # *** Setup batch writes ***
    batch = db.batch()
    
    # For every transaction in postData, add it to the batch
    for transactionData in postData:

        # Create new document for this transaction
        newDocument_ref = db.collection(u'users').document(uid).collection(u'records').document()

        batch.set(newDocument_ref, transactionData) # Add transaction to batch

    try:
        batch.commit()  # commit the changes
        return jsonify({"ok": true})
    except:
        return jsonify({"ok": False, "Error": "An error ocurred while attempting to bulk upload."})


@app.route('/_api/deleteTransaction', methods = ['POST'])
def deleteTransaction():
     # 1. Verify user's accessToken
    accessToken = request.headers.get("accessToken")
    isAuth = isAuthenticated(accessToken)

    if(not isAuth[0]):
        # If verification fails, return error message
        response = jsonify({"ErrorMessage": "Invalid Access Token"})
        response.status_code = 401
        return response

    # Retrieve user's UID
    decoded_token = isAuth[1]
    uid = decoded_token['uid']

    # Transaction ID in the form of a dictionary
    transactionID = request.get_json()

    # Clear entry for user with UID uid from memory
    if(uid in USER_INFO):
        USER_INFO.pop(uid)
        print("Removed user with UID", uid, "from memory.")

    # If transaction exists with id, delete it. Otherwise, this line does nothing
    print("Removing transaction with ID:", transactionID['transactionID'])
    db.collection(u'users').document(uid).collection(u'records').document(transactionID['transactionID']).delete()

    time.sleep(2)   # Sleep for a few seconds to allow Firebase to commmit changes

    return jsonify("Done")


def isAuthenticated(accessToken: str):
    ''' Check if recieved accessToken is valid or not\n 
     (object) => [bool, str/None]
    '''
    try:
        decoded_token = auth.verify_id_token(accessToken)
        return [True, decoded_token]
    except:
        # If verification fails, return False
        return [False, None]



def verifyUserExists(db: object, uid: str, endpoint: str):
    ''' A funtion to check if a user with UID uid exists in our Cloud Firestore database\n
     (object, string, string) => bool
    '''
    users = db.collection(endpoint).stream()
    
    # For every user in the database
    for user in users:
        # If user exists, return True
        if user.id == uid:
            return True

    return False


def createNewUserEntry(db: object, uid: str, decoded_token: str, endpoint: str):
    ''' A funtion to create initial entries for user with UID uid in Firestore\n
     (object, string, string, string) => none
    '''

    # Parse decoded token for user's name and extract
    userName = decoded_token["name"].split(" ")
    middleNames = ""

    # If the person has middle names
    if(len(userName) > 2):
        # Join all middle names into a single string
        middleNames = ' '.join(userName[1 : len(userName) - 1])

    # STEP 1: Create fields for this new user which include the data below
    newUserFields = db.collection(endpoint).document(uid)
    newUserFields.set({
        u'firstName': userName[0],
        u'middleNames': middleNames,
        u'lastName': userName[-1]
    })

    # STEP 2: Create a new collection "records" to hold all transactions made by this user
    newUserTransactions = db.collection(endpoint).document(uid).collection(u'records').document()
    # We use "set" so Firebase can give it an auto-generated ID
    newUserTransactions.set({
        u'Amount': 200,
        u'Date': u'01-01-1970',
        u'Location': u'__initial_record__',
        u'Notes': u'something blah blah',
        u'Title': u'__initial_record__'
    })

    print("ADDED NEW USER", userName, "with UID", uid)


def validateUser(uid: object, accessToken: str):
    pass

if __name__ == '__main__':
    try:
        if os.environ['ENV'] == 'dev':
            app.run(debug=True, port=5000, threaded=True)
    except:
        app.run(threaded=True)
    