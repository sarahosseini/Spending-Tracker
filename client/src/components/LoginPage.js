import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import './css/LoginPage.css';

const config = require("../../src/firebaseAPI_KEY.json");
firebase.initializeApp(config);

class LoginPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            isAuth: false,
        }
    }

    // Configure FirebaseUI.
    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // We will display Email and Google as auth providers.
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            // Avoid redirects after sign-in.
            signInSuccessWithAuthResult: () => false
        }
    };

    // Listen to the Firebase Auth state and set the local state.
    componentDidMount() {
        this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
            (user) => this.setState({isAuth: !!user})
        );
    }
    
    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    handleLogOut(){
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhoto");
        localStorage.removeItem("accessToken");
        firebase.auth().signOut();
        window.location.reload();
    }

    render(){
        if(!this.state.isAuth){
            return (
                <div className="loginContainer">
                    <Paper className="loginContent">
                        <div className="welcomeMessage">
                            <h2>Welcome!</h2>
                            <h3>Login or SignUp to continue.</h3>
                            
                        </div>
                        <Divider variant="middle" width="90%"/>
                        <StyledFirebaseAuth className="loginOptions" uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
                    </Paper>
                </div>
            )
        }
        
        // Get current user's access Token and add to local storage
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((accessToken) => {
            localStorage.setItem("accessToken", accessToken);
        }).catch(function(error) {
            console.log(error);
        });

        // Store this user's name and photo in local storage
        localStorage.setItem("userName", firebase.auth().currentUser.displayName);
        localStorage.setItem("userPhoto", firebase.auth().currentUser.photoURL);

        return(
            <div className="loginContainer">
                <Paper className="loggedInContent">
                    <h2>Welcome {firebase.auth().currentUser.displayName}!</h2>
                    <br/>
                    <h4>Click Dashboard to continue.</h4>
                    <br/>
                    <br/>

                    <Link to="/dashboard">
                        <Button variant="contained" color="primary">Dashboard</Button>
                    </Link>
                    <br/>

                    <Button variant="contained" color="default" onClick={() => this.handleLogOut()}>Sign-out</Button>
                </Paper>
            </div>
        )
    }
}

export default LoginPage;