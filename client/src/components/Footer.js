import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import './css/Footer.css';

class Footer extends Component{
    render(){
        return(
            <div className="footer">
                <div className="bottomNavigation">
                    <h5>Copyright 2019</h5>
                    <Button variant="text" color="inherit">Help</Button>
                    <Button href="https://github.com/bill-ahmed/SpendingTracker" target="_blank" variant="text" color="inherit">About Us</Button>
                </div>
            </div>
        )
    }
}

export default Footer;