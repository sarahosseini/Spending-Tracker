import React, { useState } from 'react';
import DeleteTransactionModal from './modals/DeleteTransactionModal'
import {DeleteTransaction} from '../../api';
import MUIDataTable from "mui-datatables";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import './css/DetailedActivity.css'

// Redux component
import {useSelector} from 'react-redux';

function DetailedActivity(props) {
    const transactionData = useSelector(state => state.transactionData);

    /*Equivalent to this.state */
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const handleDeleteModalOpen = () => {
        setDeleteModalOpen(true);
    }

    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
    }

    /**Remove transaction that has ID transactionID
     * @param transactionInfo The unique transaction to remove
     */
    const removeDate = (transactionInfo) => {
        // Delete transaction with ID transactionID, then reload the page
        // this.props.deleteData(transactionID);
        // window.location.reload();
        console.log(transactionInfo);
        setTransactionToDelete(transactionInfo);
        setDeleteModalOpen(true);
    }

    const handleEditData = (transaction) => {
        alert(`Editing: ${transaction.id}`);
    }

    const rowPropsToRender = (data, dataIndex, rowIndex) => {
        return(
            <TableRow hover key={data[0]}>
                <TableCell>
                    <IconButton onClick={() => console.log("Clicked edit for " + data[0])}><EditIcon/></IconButton>
                    <IconButton onClick={() => removeDate(data)}><DeleteIcon/></IconButton>
                </TableCell>
                    <TableCell>{data[1]}</TableCell>
                    <TableCell align="right">{data[2]}</TableCell>
                    <TableCell>{data[3]}</TableCell>
                    <TableCell>{data[4]}</TableCell>
            </TableRow>
        );
    }
    
    // Column names of the table, in order
    let tableHeaders = ["Actions", "Title", "Amount Spent", "Date", "Location"];

    // All the rows to display
    let tableData = [];

    // If we have transaction data in the redux STORE
    if(transactionData){
        if(transactionData.raw_data != null){ // ONE "=" sign is super important here!
        tableData = transactionData.raw_data;
        }
    }
    

    /*Configure data table */
    const columns = ["Actions", "Title", "Amount Spent", "Date", "Location"];
    //console.log({"table data": tableData});
    const data = tableData.map(elem => {
        return ([elem.id, elem.data.Title, "$"+elem.data.Amount, elem.data.Date.slice(0, 16), elem.data.Location === '' ? "N/A" : elem.data.Location])
    });

    const options = {
        viewColumns: false, // Show/hide different columns option in toolbar
        print: false, //Print option in toolbar
        selectableRows: 'none', // Disable allowing user to select rows
        elevation: 0,
        rowsPerPage: 8,
        rowsPerPageOptions: [8, 15, 20],
        customRowRender: ((data, dataIndex, rowIndex) => rowPropsToRender(data, dataIndex, rowIndex)), // Render custom props for each row
    };

    return(
        <Paper elevation={1} className="detailedActivity">
            <h3>Detailed Activity</h3>

            <MUIDataTable
            data={data}
            columns={columns}
            options={options}
            />

            {deleteModalOpen && <DeleteTransactionModal handleDeleteModalClose={handleDeleteModalClose} 
            deleteMethod={() => DeleteTransaction(transactionToDelete[0])} handleAPIResponse={props.handleAPIResponse} transactionInfo={transactionToDelete}/>}
        </Paper>
    );
}

export default DetailedActivity;