import React, { useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import './css/Trends.css'
// Redux component
import {useSelector} from 'react-redux';

const Chart = require('chart.js');

// Colours to allow in charts
const BACKGROUND_COLOURS = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'
]

const BORDER_COLOURS = [
    'rgba(255, 99, 132, 0.1)',
    'rgba(54, 162, 235, 0.1)',
    'rgba(255, 206, 86, 0.1)',
    'rgba(75, 192, 192, 0.1)',
    'rgba(153, 102, 255, 0.1)',
    'rgba(255, 159, 64, 0.1)'
]

function Trends() {

    /*Equivalent to this.state; use {nameOfState} to retrieve and set{nameOfState} to set the state */
    const [isLoading, setIsLoading] = useState(true);

    /**Generate graphs based on the data given
     * @param data The array of data to display
     * Note: "array" is an array of arrays
     */
    const createGraphs = (data) => {
        data.map(elem => {
            generateGraph(elem[0], elem[1], elem[2], elem[3], elem[4]);
        })
    }

    /**Draw a given graph type to HTML cavas with id=elementID
     * @param graphType The type of graph, e.g. "line", "bar", etc.
     * @param elementID ID of the transaction
     * @param chartTitle The title of the chart
     * @param labels All x-axis data
     * @param data All points (x,y)
     */
    const generateGraph = (graphType, elementID, chartTitle, labels, data) => {
        //console.log({"GRAPH TYPE": graphType, "labels": labels, "data": data})
        var ctx = document.getElementById(elementID)
        var myChart = new Chart(ctx, {
            type: graphType,
            data: {
                labels: labels,
                datasets: [{
                    label: chartTitle,
                    data: data,
                    backgroundColor: BACKGROUND_COLOURS,
                    borderColor: (graphType === 'line' ? '' : BORDER_COLOURS),
                    borderWidth: 2,
                    fill: (graphType === "line" ? true : false)
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    const transData = useSelector(state => state.transactionData);
    if(transData){
        if(transData.amountPerMetric != null && isLoading){
            setIsLoading(false);
    
            createGraphs([["line", "trendsLineGraph", "You Spent", transData.amountPerMetric.dates.map(elem => {return elem.substring(0, 11)}), transData.amountPerMetric.totalExpenses],
            ["doughnut", "trendsPieGraph", "Amount Spent Per Location",transData.amountPerMetric.amountPerLocation.locations, transData.amountPerMetric.amountPerLocation.amountSpent]]);
        }    
    }
    
    return(
        <Paper elevation={1} className="trends">
            <h3>Trends</h3>
            <Divider/>
            <br/>

            <div className="graphsContainer">
                <canvas className="graph" id="trendsLineGraph" width="200" height="100"/>
                {isLoading && <CircularProgress className="loadingCircle"/>}
                <canvas className="graph" id="trendsPieGraph" width="200" height="100"/>
            </div>
            <br/>
            <br/>
        </Paper>
    );
}

export default Trends;