import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import { DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import './css/DeleteTransactionModal.css';

class DeleteTransactionModal extends Component{
    constructor(props){
        super(props);

        this.state = {
            isDisabled: false,
            isLoading: false
        }
    }

    handleDeleteClick(){
        this.props.deleteMethod()
        .then((res) => this.props.handleAPIResponse(res, "deleteTransaction"))
        .catch((res) => this.props.handleAPIResponse(res, "deleteTransaction"));

        this.setState({isDisabled: true});
        this.setState({isLoading: true});
    }

    render() {
        let transactionInfo = this.props.transactionInfo;
        let disabled = this.state.isDisabled;
        let loading = this.state.isLoading;
        return(
            <Dialog open fullWidth className="deleteTransactionModal">
                <DialogTitle>
                    Are you sure?
                </DialogTitle>
                <Divider/>
                <br/>
                
                <DialogContent>
                    <h4>You CANNOT undo this action. The following will be removed:</h4>
                    <br/>
                    <h4>{`"${transactionInfo[1]}" for ${transactionInfo[2]} at ${transactionInfo[4]}, on ${transactionInfo[3]}`}</h4>
                </DialogContent>

                <DialogActions>
                    <Button disabled={disabled} variant="text" color="inherit" onClick={() => this.props.handleDeleteModalClose()}>
                        Cancel
                    </Button>

                    <Button disabled={disabled} variant="contained" color="secondary" onClick={() => this.handleDeleteClick()}>
                        {loading && <CircularProgress size={30} id="loadingTransactionDeletion"/>}
                        DELETE
                    </Button>
                </DialogActions>

            </Dialog>
        );
    }
}

export default DeleteTransactionModal;