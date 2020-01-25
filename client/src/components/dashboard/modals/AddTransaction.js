import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {CreateTransaction} from '../../../api';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import { withSnackbar } from 'notistack';
import './css/AddTransaction.css';

class AddTransaction extends Component{
    constructor(props){
        super(props);

        this.handleInputFieldChange = this.handleInputFieldChange.bind(this);
        this.handleDataSend = this.handleDataSend.bind(this);

        this.state = {
            title: '',
            amountSpent: 0.01,
            date: '',
            location: '',
            category: '',
            additionalNotes: '',
            dataValidated: false,
            isLoading: false
        }
    }

    /**Handle the input field information
     * @param fieldChanged The field that was changed (str)
     * @param event The new value of the textfield that was changed (int/str).
     */
    handleInputFieldChange(event, fieldChanged){
        if(fieldChanged === "title"){
            this.setState({title: event.target.value})

        } else if(fieldChanged === "amountSpent"){
            this.setState({amountSpent: event.target.value})

        } else if(fieldChanged === "date"){
            this.setState({date: event.target.value})

        } else if(fieldChanged === "location"){
            this.setState({location: event.target.value})

        } else if(fieldChanged === "category"){
            this.setState({category: event.target.value})

        } else if(fieldChanged === "additionalNotes"){
            this.setState({additionalNotes: event.target.value})

        }
        
        // console.log(event.target.value);
        // console.log(fieldChanged);
    }

    /**Verify all input data is valid and send it to back-end api */
    handleDataSend(){
        this.setState({isLoading: true});
        // If data is validated, send post request
        if(this.validateData()){
            console.log(this.state);
            CreateTransaction(this.state)
            .then((res) => this.props.handleAPIResponse(res, 'createTransaction'))
            .catch((res) => this.props.handleAPIResponse(res, 'createTransaction'));

        }else{
            this.setState({isLoading: false});
            // Notify user of the error
            this.props.enqueueSnackbar("Error: Please ensure all fields are valid", {
                variant: 'error',
                preventDuplicate: true,
                action: (key) => (
                    <Button variant="outlined" color="inherit" onClick={() => this.props.closeSnackbar(key)}>Got It</Button>
                ),
            });
            console.log("Error with transaction data. Please make sure all fields are valid");
        }
    }

    /**Validate that all user inputted data is properly formatted. Updates the state with current validation (true/false)
     * @returns True/False depending on whether all transaction data is valid or not, respectively
    */
    validateData(){
        let title = this.state.title;
        let amountSpent = this.state.amountSpent;
        let date = this.state.date;
        let isValidated = true;
        // If title is empty
        if(title.trim() === ''){
            isValidated = false;
        }

        // If valid date is given
        if(date === ''){isValidated = false;}
        try {
            let tempDate = new Date(date);
        } catch (error) {
            console.log(error);
            isValidated = false;
        }

        // If amount is valid number and positive
        try {
            let num = parseFloat(amountSpent);
            if(num < 0){
                isValidated = false;
            }
        } catch (error) {
            console.log(error);
            isValidated = false;
        }

        // All other cases should be valid
        this.setState({dataValidated: isValidated});
        return isValidated;
    }

    render(){
        let loading = this.state.isLoading;
        return(
            <Dialog open fullWidth>

                <DialogTitle>
                    Add a new Transaction
                </DialogTitle>
                <Divider/>

                <DialogContent>
                    <div className="addTransactionInfo">
                        <h4>All fields marked with '*' are required.</h4>

                        {/* Input textfields */}
                        <div className="inputFields">
                            <TextField id="transactionTitle" className="singeLineInputField" 
                            required InputLabelProps={{shrink: true}} label="Title" error={this.state.title.trim() === ''} 
                            value={this.state.title} onChange={(event) => this.handleInputFieldChange(event, "title")}/>

                            <TextField id="amountSpent" className="singeLineInputField" 
                            required label="Amount Spent" type="number" error={this.state.amountSpent < 0} 
                            value={this.state.amountSpent} onChange={(event) => this.handleInputFieldChange(event, "amountSpent")}/>

                            <TextField id="dateOfTransaction" className="singeLineInputField" 
                            required InputLabelProps={{shrink: true}} label="Date" type="date" error={this.state.date.trim() === ''} 
                            value={this.state.date} onChange={(event) => this.handleInputFieldChange(event, "date")}
                            />

                            <TextField id="locationofTransaction" className="singeLineInputField" 
                            label="Location" value={this.state.location} onChange={(event) => this.handleInputFieldChange(event, "location")}/>

                            <TextField id="transactionCategory" className="singeLineInputField" 
                            label="Category" 
                            value={this.state.category} onChange={(event) => this.handleInputFieldChange(event, "category")}/>

                        </div>
                        <TextField fullWidth id="additionalNotes" className="multiLineInputField" 
                        label="Additional Notes" variant="outlined" multiline rows="3" rowsMax="10" helperText="Maximum of 10 lines." 
                        value={this.state.additionalNotes} onChange={(event) => this.handleInputFieldChange(event, "additionalNotes")}/>
                        
                    </div>
                </DialogContent>

                {/*Add and Close buttons */}
                <DialogActions>
                    <Button disabled={loading} variant="text" color="inherit" onClick={() => this.props.handleAddTransactionDialogModalClose()}>
                        Cancel
                    </Button>

                    <Button disabled={loading} variant="contained" color="primary" onClick={this.handleDataSend}>
                        {loading && <CircularProgress size={30} id="loadingTransactionCreation"/>}
                        Add
                    </Button>
                    
                </DialogActions>
            </Dialog>
        );
    }
}
export default withSnackbar(AddTransaction);