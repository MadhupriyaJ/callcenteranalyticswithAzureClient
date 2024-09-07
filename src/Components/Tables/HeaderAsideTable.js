import React, { useEffect, useState } from 'react'

import SnowflakeAside from '../Aside/SnowflakeAside'
import Header from '../Header/Header'
import List from '../Roles/List'
import DataTables from './DataTables'
import { useLocation, useNavigate } from 'react-router-dom'


const HeaderAsideTable = () => {
  const [asideOpen, setAsideOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(""); 
  const [tableHistory, setTableHistory] = useState([]); // State to track table history
  const [username, setUsername] = useState("");
  const location = useLocation(); // Use the useLocation hook to access route parameters
  const [authenticated, setAuthenticated] = useState(true); 
  const navigate = useNavigate();


  const userName = location.state ? location.state.userName : localStorage.getItem("userName");  // Extract the userName from the route parameters

// Function to handle logout
const handleLogout = () => {
  localStorage.removeItem("authenticated");
  setAuthenticated(false);// Redirect to the login page
  navigate("/");
};


  // const { userName } = location.state || {};

  // Set the username in the component's state
  useEffect(() => {
    setUsername(userName || ""); // Set the default value to an empty string if userName is not provided
  }, [userName]);


  const handleTableSelect = (tableName) => {
    // Add the current selected table to the history
    setTableHistory([...tableHistory, selectedTable]);

    // Update the selected table
    setSelectedTable(tableName);
  };

 // Callback function to handle "Back" action
 const handleBack = () => {
  // Get the previous table from the history
  const previousTable = tableHistory.pop();

  // Update the selected table with the previous table
  setSelectedTable(previousTable);

  // Update the table history
  setTableHistory([...tableHistory]);
};


  return (
    <div className='flex'>
        <div>
        <SnowflakeAside asideOpen={asideOpen} 
        selectedTable={selectedTable} // Pass selected table to AsideBk
        setSelectedTable={setSelectedTable}
        onTableSelect={handleTableSelect} // Pass callback function to AsideBk
        
        />
        </div>
        
       <div className='h-22 w-full'>
       <Header/>
       <div >
        {/* <Content/> */}
   <DataTables 
               
              selectedTable={selectedTable} // Pass selected table to DataTables
              setSelectedTable={setSelectedTable}
              onTableSelect={handleTableSelect}
              onBack={handleBack} // Pass the handleBack callback to DataTables
              />      
                
           
       </div> 
       </div>
       
      
    </div>
  )
}

export default HeaderAsideTable
