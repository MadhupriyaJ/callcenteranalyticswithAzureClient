import React, { useEffect, useRef, useState } from "react";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.min";
import AddScreen from "./AddScreen";
import EditScreen from "./EditScreen";
import { SlReload } from "react-icons/sl";
import { useLocation } from "react-router-dom";
import { FaEdit } from "react-icons/fa"; // Import the edit icon
// import bcrypt from 'bcryptjs'; // Import the bcrypt library




const DataTables = ({ selectedTable, setSelectedTable, onBack }) => {
  const [tablename, setTablename] = useState([]);
  const [tabledetails, setTabledetails] = useState([]);
  const [dataTable, setDataTable] = useState(null);
  const [tableHistory, setTableHistory] = useState([]);
  const [currentTable, setCurrentTable] = useState(selectedTable);
  const [isReloadIconVisible, setReloadIconVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setSearchVisible] = useState(false);

  const tableRef = useRef();
  const location = useLocation();
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    console.log("Fetching table names...");
    fetchTablename();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      console.log("Fetching table data for selected table:", selectedTable);
      fetchTableData(selectedTable);
      // Show the reload icon when a table is selected
      setReloadIconVisible(true);
      setSearchVisible(true);
    } else if (tablename.length > 0) {
      // Fetch and display the first table from the list if no table is selected
      const firstTable = tablename[0].TABLE_NAME;
      setSelectedTable(firstTable);
    }
  }, [selectedTable, searchQuery, tablename]);



  //To get All Table from server
  const fetchTablename = async () => {
    try {
      const response = await fetch(`${BASE_URL}/gettablename`);
      const data = await response.json();
      console.log("Fetched table names:", data);
      setTablename(data);
    } catch (error) {
      console.error("Error fetching table names:", error);
    }
  };

  const fetchTableData = async (tableName) => {
    try {
      const response = await fetch(`${BASE_URL}/tablecategorieswithvalue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }),
      });
      const data = await response.json();
      console.log("Fetched table data for", tableName, ":", data);
      setTabledetails(data);
      // Hash the "PasswordHash" values before setting them in the state
      const hashedData = data.map((row) => ({
        ...row,
        PasswordHash: bcrypt.hashSync(row.PasswordHash, 3), // Hash the PasswordHash column
      }));
  
      // setTabledetails(hashedData);

      const filteredData = data.filter((row) => {
        const rowData = Object.values(row).join(" ").toLowerCase();
        return rowData.includes(searchQuery.toLowerCase());
      });
      setTabledetails(filteredData);
      // Destroy the DataTable if it exists
      if (dataTable !== null) {
        dataTable.destroy();
      }
      // Initialize DataTable for the current tableRef
      // const newDataTable = $(tableRef.current).DataTable({});
      // console.log("DataTable initialized:", newDataTable);
      // setDataTable(newDataTable);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  // const fetchTableData = async (tableName) => {
  //   try {
  //     const response = await fetch("/tablecategorieswithvalue", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ tableName }),
  //     });
  //     const data = await response.json();
  //     console.log("Fetched table data for", tableName, ":", data);
  
  //     // Check if the selected table is 'Logins'
  //     if (tableName === 'Login') {
  //       const hashedData = data.map((row) => ({
  //         ...row,
  //         PasswordHash: bcrypt.hashSync(row.PasswordHash, 6), // Hash the PasswordHash column
  //       }));
  
  //       // Set the hashed data for the 'Logins' table
  //       setTabledetails(hashedData);
  //       console.log('Selected table is Login');
  //     } else {
  //       // Set the data as is for other tables
  //       setTabledetails(data);
  //       console.log('Selected table is not Login');
  //     }
  
  //     const filteredData = data.filter((row) => {
  //       const rowData = Object.values(row).join(" ").toLowerCase();
  //       return rowData.includes(searchQuery.toLowerCase());
  //     });
  //     setTabledetails(filteredData);
  
  //     // Destroy the DataTable if it exists
  //     if (dataTable !== null) {
  //       dataTable.destroy();
  //     }
  //   } catch (error) {
  //     console.error("Error fetching table data:", error);
  //   }
  // };
  
  
  const handleReload = () => {
    // Check if a table is selected
    if (selectedTable) {
      // Refresh the data for the selected table
      fetchTableData(selectedTable);
    }
  };

  const handleBack = () => {
    // Get the previous table from history
    const previousTable = tableHistory.pop();

    // Update the current table and history
    setCurrentTable(previousTable);
    setTableHistory([...tableHistory]);

    // Trigger the onBack callback if provided
    if (onBack) {
      onBack(previousTable);
    }
  };

  const handleEdit = (row) => {
    
    
  };

  
  return (
    <div className="container p-5">
      <div className="table-responsive  h-800px">
        <div className="gap-3 flex justify-between">
          <div className="">
            <button
              type="button"
              className="btn btn-light-info border-1 border-dashed border-info btn-sm"
              onClick={handleBack}
            >
              Back
            </button>
          </div>
          {/* {location.pathname === "/customer" ? (
            // Render non-clickable AddScreen and EditScreen
            <div className="flex space-x-2">
              <div className="text-gray-400 invisible">AddScreen</div>
              <div className="text-gray-400 invisible">EditScreen</div>
            </div>
          ) : ( */}
          
            <div className="flex space-x-2">
             
              <AddScreen />
            </div>
          {/* )} */}
        </div>
        <form>
          <label className="text-4xl font-semibold text-gray-700 w-full form-label mt-6 ">
            <div className="flex justify-between">
              <div className="flex gap-3 items-center">
              {selectedTable}
                {isReloadIconVisible && (
                  <div
                    className="btn btn-link text-2xl font-bold "
                    onClick={handleReload}
                  >
                    <SlReload />
                  </div>
                )}
              </div>
              {isSearchVisible && (
                <div className="mb-3 ml-5 input-group w-96">
                  <div className="input-group-prepend ">
                    <span className="input-group-text ">
                      <i className="fa fa-search  "></i>{" "}
                      {/* You can use a different class for your preferred icon library */}
                    </span>
                  </div>
                  <input
                    type="search"
                    className="form-control"
                    id="tableSearch"
                    placeholder={`Search ${selectedTable}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent form submission on Enter key
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </label>
        </form>
        <table
          ref={tableRef}
          id="kt_datatable_example_5"
          className="container display hover table table-striped gy-5 gs-7 border rounded dataTable no-footer "
          style={{ width: "50%" }}
        >
          <thead >
            <tr className="fw-bolder fs-6 text-gray-800 px-7   ">
              {selectedTable && tabledetails && tabledetails.length > 0 &&
                Object.keys(tabledetails[0]).map((column, index) => (
                  <th
                    className="sorting sorting_asc"
                    tabIndex="0"
                    aria-controls="kt_datatable_example_5"
                    key={index}
                  >
                    {column}
                  </th>
                  
                ))}
                 <th>Edit</th>
            </tr>
          </thead>
          <tbody className="scroll scroll-pull h-64 overflow-y-auto  ">
            {selectedTable && tabledetails && tabledetails.length > 0 && tabledetails.map((row, rowIndex) => (
                <tr style={{ backgroundColor: rowIndex % 2 === 0 ? "#F2F2F2" : "#FFFFFF", // Alternating row colors
                  }}
                  key={rowIndex}
                >
                  {Object.values(row).map((value, colIndex) => (
                    <td className="sorting_1 " key={colIndex}>
                       {value}
                    </td>
                  ))}
                   <td>
                    <button
                      className="btn btn-link"
                      onClick={() => handleEdit(row)} // You can implement the handleEdit function to edit the row
                    >
																{/* <!--end::Svg Icon--> */}
                                <EditScreen />
															
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        
        </table>
      </div>
    </div>

  );
};

export default DataTables;
