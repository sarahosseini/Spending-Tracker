import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import './css/RecentActivity.css'

class RecentActivity extends Component{
    render(){
        return(
            <Paper elevation={1} className={this.props.className}>
                <h3>Recent Activity</h3>
                <Divider/>
                <br/>
                <h5>
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.
                    Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.
                </h5>
                <br/>
                <br/>
            </Paper>
        );
    }
}

export default RecentActivity;