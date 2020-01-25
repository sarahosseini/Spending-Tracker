import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Trends from './dashboard/Trends';
import AddTransaction from './dashboard/modals/AddTransaction';
import BulkUpload from './dashboard/modals/BulkUpload';
import DetailedActivity from './dashboard/DetailedActivity';
import Summary from './dashboard/Summary';
import QuickActions from './dashboard/QuickActions';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import { withSnackbar } from 'notistack';
import './css/Dashboard.css';

const fetch = require('node-fetch');
// const flaskEndpoint = "https://spendingtracker.billahmed.com";
const flaskEndpoint = "http://127.0.0.1:5000";

// In-line styles applied to material-ui elements
const styles = theme => ({
    AppBar: {
      backgroundColor: '#1EB350',
    }
  });

class Dashboard extends Component{

    constructor(props){
        super(props);

        // Bind all functions to "this"
        this.fetchData = this.fetchData.bind(this);

        this.handleResponse = this.handleResponse.bind(this);
        this.handleUserMenuOpen = this.handleUserMenuOpen.bind(this);
        this.handleUserMenuClose = this.handleUserMenuClose.bind(this);
        this.handleAddTransactionDialogModalOpen = this.handleAddTransactionDialogModalOpen.bind(this);
        this.handleAddTransactionDialogModalClose = this.handleAddTransactionDialogModalClose.bind(this);
        this.handleBulkUploadDialogModalOpen = this.handleBulkUploadDialogModalOpen.bind(this);
        this.handleBulkUploadDialogModalClose = this.handleBulkUploadDialogModalClose.bind(this);

        // If userName is not set, sign-out this user
        if(localStorage.getItem("userName") === null){
            this.handleLogOut();
        }

        this.state = {
            userMenuOpen: {anchorEl: null},
            currUserMenuItem: null,
            userName: localStorage.getItem("userName").split(" "),
            transactionData: {},
            addTransactionDialogOpen: false,
            bulkUploadDialogOpen: false,
        }
    }

    /**GET request to server.js API, response is transaction data */
    fetchData(){
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
            //console.log(res);
            return res.json()})
        .then(resp => {
            this.setState({transactionData: resp});
        })
        .catch((error) => console.log({"Error": error}));
    }

    /**Enqueue a snackbar to notify user of error that has occured
     * @param resp (Object) The raw response data from api call
     * @param actionTaken (str) The action taken, e.g. "deleteTransaction", "createTransaction", etc.
     */
    handleResponse(resp, actionTaken){
        console.log(resp);
        let snackbarProps = {
            preventDuplicate: true,
            action: (key) => (
                <Button variant="outlined" color="inherit" onClick={() => this.props.closeSnackbar(key)}>Okay</Button>
            ),
        };

        let message = '';   // Message to send to user via snackbar

        if(resp.ok){
            snackbarProps.variant = 'success';

            setTimeout(() => window.location.reload(), 3000); // Wait 3 seconds before reloading the page

            switch(actionTaken){
                case 'createTransaction':
                    message = "Successfully added transaction, refreshing...";
                    break;
                
                case 'deleteTransaction':
                    message = "Successfully deleted transaction, refreshing...";
                    break;

                default:
                    break;
            }
        } else{
            snackbarProps.variant = 'error';

            switch(actionTaken){ 
                case 'createTransaction':
                    message = "Failed to create transaction. Please try again later.";
                    break;
                
                case 'deleteTransaction':
                    message = "Failed to delete the transaction. Please try again later.";
                    break;

                default:
                    break;
            }
        }

        // Create snackbar
        this.props.enqueueSnackbar(message, snackbarProps);
    }

    handleUserMenuOpen(event){
        this.setState({userMenuOpen: {anchorEl: event.currentTarget}});
    }

    handleUserMenuClose(event, itemSelected){
        this.setState({currUserMenuItem: itemSelected});
        this.setState({userMenuOpen: {anchorEl: null}});

        //If user clicked logout
        if(itemSelected === 'Logout'){
            this.handleLogOut();
        }
    }

    handleAddTransactionDialogModalOpen(){
        this.setState({addTransactionDialogOpen: true});
    }

    handleAddTransactionDialogModalClose(){
        this.setState({addTransactionDialogOpen: false});
    }

    handleBulkUploadDialogModalOpen(){
        this.setState({bulkUploadDialogOpen: true});
    }
    
    handleBulkUploadDialogModalClose(){
        this.setState({bulkUploadDialogOpen: false});
    }

    /**Logout the current user via firebase.auth, and other house-keeping items */
    handleLogOut(){
        this.props.handleLogOut();
    }

    render(){
        // Determine if the user menu is open or not
        const {anchorEl} = this.state.userMenuOpen;
        const { classes } = this.props;
        const open = Boolean(anchorEl);
        const userPhoto = localStorage.getItem("userPhoto");
        const userDefaultPhoto = require("./assets/default_profile_pic.png");

        return(
            <div className="dashboard">
                {/* Dashboard located in the header; controls main navigation */}
                <AppBar position="static" color="default" classes={{colorPrimary: classes.AppBar}}>
                    <Toolbar>
                        <div className="heading">
                            Dashboard
                        </div>

                        <QuickActions handleSingleTransaction={this.handleAddTransactionDialogModalOpen} 
                                      handleBulkTransaction={this.handleBulkUploadDialogModalOpen}/>
                        
                        <Button variant="text" color="inherit" onClick={() => window.location.href = "/"}>
                            Home
                        </Button>

                        {/* <Button variant="text" color="inherit" onClick={() => this.fetchData()}>
                            Get Data
                        </Button> */}

                        {/* <Button variant="text" color="inherit" onClick={() => this.handleAddTransactionDialogModalOpen()}>
                            Add Transaction
                        </Button> */}
                        
                        {/* Add transaction button */}
                        
                        {/* <Tooltip title="Add" aria-label="Add a transaction" className={classes.fab}>
                            <Fab size="medium" color="secondary" aria-label="Add a transaction" onClick={() => this.handleAddTransactionDialogModalOpen()}>
                                <AddIcon/>
                            </Fab>
                        </Tooltip> */}

                        <IconButton variant="text" onClick={this.handleUserMenuOpen} color="inherit">
                            <Avatar src={userPhoto === "null" ? userDefaultPhoto : userPhoto}/>
                        </IconButton>
                    </Toolbar>
                </AppBar>

                {/* The Menu Items opened when user clicks on their icon */}
                <Menu anchorEl={anchorEl} open={open} PaperProps={{
                    style: {
                        maxHeight: 220,
                        width: 150,
                        float: 'right',
                    }
                }}>

                    {/* Name of Person */}
                    <ListItem>
                        <ListItemText primary={this.state.userName.join(" ")}/>
                    </ListItem>

                    <Divider/>

                    <MenuItem onClick={event => this.handleUserMenuClose(event, "Settings")}
                    selected={this.state.currUserMenuItem === "Settings"}>
                        Settings
                    </MenuItem>

                    <MenuItem onClick={event => this.handleUserMenuClose(event, "Logout")}
                    selected={this.state.currUserMenuItem === "Logout"}>
                        Logout
                    </MenuItem>
                </Menu>

                <div className="mainContainer">
                    <div className="leftPane">
                        <Trends className="trends"/>
                    </div>

                    <div className="rightPane">
                        <Summary className="summary"/>
                        <DetailedActivity className="detailedActivity" handleAPIResponse={this.handleResponse}/>
                    </div>

                    {/* Pop-up modals to allow adding transactions */}
                    {this.state.addTransactionDialogOpen &&
                    <AddTransaction handleAPIResponse={this.handleResponse} handleAddTransactionDialogModalClose={this.handleAddTransactionDialogModalClose} createTransaction={this.createTransaction}/>}

                    {this.state.bulkUploadDialogOpen && <BulkUpload handleBulkUploadDialogModalClose={this.handleBulkUploadDialogModalClose}/>}
                </div>
            </div>
        );
    }
}

export default withSnackbar(withStyles(styles)(Dashboard));