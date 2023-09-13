import React, { useEffect, useRef, useState } from "react";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-bs5";
import "datatables.net-buttons-bs5";
import "datatables.net-buttons/js/buttons.html5.min";
import AddScreen from "./AddScreen";
import EditScreen from "./EditScreen";
import { SlReload } from "react-icons/sl";
const DataTables = ({ selectedTable, onBack }) => {
  const [tablename, setTablename] = useState([]);
  // const [selectedTable, setSelectedTable] = useState("");
  const [tabledetails, setTabledetails] = useState([]);
  const [dataTable, setDataTable] = useState(null);
  const [tableHistory, setTableHistory] = useState([]);
  const [currentTable, setCurrentTable] = useState(selectedTable);
  const [isReloadIconVisible, setReloadIconVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setSearchVisible] = useState(false);


  const tableRef = useRef();

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
      
    } else {
      // Hide the reload icon when no table is selected
      setReloadIconVisible(false);
      setSearchVisible(false);
    
  
    }
  }, [selectedTable, searchQuery]);

  //To get All Table from server
  const fetchTablename = async () => {
    try {
      const response = await fetch("/gettablename");
      const data = await response.json();
      console.log("Fetched table names:", data);
      setTablename(data);
    } catch (error) {
      console.error("Error fetching table names:", error);
    }
  };

  const fetchTableData = async (tableName) => {
    try {
      const response = await fetch("/tablecategorieswithvalue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }),
      });

      const data = await response.json();
      console.log("Fetched table data for", tableName, ":", data);
      setTabledetails(data);


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


  return (
    <div className="container p-5">
      <div className="table-responsive">
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
          <div className="flex space-x-2">
            <EditScreen />
            <AddScreen />
          </div>
        </div>
        <form>
          <label className="text-4xl font-semibold text-gray-700 form-label mt-6">
            <div className="flex gap-3 items-center">
              {selectedTable}
              {isReloadIconVisible && (
              <div className="btn btn-link text-2xl font-bold " onClick={handleReload}>
                <SlReload />
               
              </div>
              )}
{isSearchVisible && (
              <div className="mb-3 ml-5 input-group">
                <div className="input-group-prepend ">
                <span className="input-group-text ">
                <i className="fa fa-search  "></i> {/* You can use a different class for your preferred icon library */}
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
          {/* <select
            className="form-select form-select-solid required"
            aria-label="Select example"
            onChange={(event) => setSelectedTable(event.target.value)}
            value={selectedTable}
          >
            <option value=""></option>
            {tablename.map((table, index) => (
              <option key={index} value={table.TABLE_NAME}>
                {table.TABLE_NAME}
              </option>
            ))}
          </select> */}
        </form>
        <table
          ref={tableRef}
          id="kt_datatable_example_5"
          className="display hover table table-striped gy-5 gs-7 border rounded dataTable no-footer"
          style={{ width: "100%" }}
        >
          <thead>
            <tr className="fw-bolder fs-6 text-gray-800 px-7">
              {selectedTable &&
                tabledetails &&
                tabledetails.length > 0 &&
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
            </tr>
          </thead>
          <tbody>
            {selectedTable &&
              tabledetails &&
              tabledetails.length > 0 &&
              tabledetails.map((row, rowIndex) => (
                <tr
                  style={{
                    backgroundColor: rowIndex % 2 === 0 ? "#F2F2F2" : "#FFFFFF", // Alternating row colors
                  }}
                  key={rowIndex}
                >
                  {Object.values(row).map((value, colIndex) => (
                    <td className="sorting_1" key={colIndex}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTables;
