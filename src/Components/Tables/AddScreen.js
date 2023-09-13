import React, { useEffect, useState } from "react";




const AddScreen = ({ errorMessage, setErrorMessage }) => {
  const [tablename, setTablename] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableCategories, setTableCategories] = useState([]);
  const [formData, setFormData] = useState({}); // State to hold input values
  const [popupMessage, setPopupMessage] = useState(null); // State for pop-up message


  useEffect(() => {
    fetchTablename();
  }, []);

  const fetchTablename = async () => {
    try {
      const response = await fetch("/gettablename");
      const data = await response.json();
      setTablename(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTableChange = async (event) => {
    const selectedTableName = event.target.value;
    setSelectedTable(selectedTableName);

    try {
      const response = await fetch("/tablenamecategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName: selectedTableName }),
      });
      const data = await response.json();
      console.log("Fetched categories from backend:", data.categories); // Log fetched categories

      setTableCategories(data.categories); // This line updates the state with the fetched categories

      console.log("Updated tableCategories state:", tableCategories); // Log updated state
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if all required fields are filled
    const requiredFields = tableCategories.filter(
      (category) => category.required
    );
    const isAllFieldsFilled = requiredFields.every(
      (category) => formData[category] !== ""
    );

    if (!isAllFieldsFilled) {
      setErrorMessage("Please fill in all required fields.");
      return; // Exit the function without reloading
    }

    try {
      console.log("Form data to be submitted:", formData); // Log form data

      const dataToSend = {
        tableName: selectedTable,
        dataToInsert: formData,
      };

      console.log("Data to be sent to backend:", dataToSend); // Log data with tableName

      // Send formData to your backend for database insertion
      const response = await fetch("/insertData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      const responseData = await response.json();
      console.log("Response from backend:", responseData);
      // setErrorMessage("Data insertion failed. Please try again");
      // if (responseData.success) {
        // window.location.reload(); 
      // } 
      // else {
      //   setErrorMessage("Data insertion failed. Please try again.");
      // }
      if (responseData.message === 'Data inserted successfully') {
        // Data insertion succeeded
        console.log("Data inserted successfully");
        setPopupMessage("Data inserted successfully.");
        setErrorMessage(null); 
        
      } else {
        // Data insertion failed
        console.log("Data insertion failed");
        setPopupMessage("Data insertion failed. Please try again.");
      }
   
    } catch (error) {
      console.log(error);
     
    }
  };
  console.log("Rendering AddScreen component"); // Log when component renders

  const closePopup = () => {
    // Close the pop-up message
    setPopupMessage(null);
  };

  const handleReset = (event) => {
    event.preventDefault();
  
    // Reset the formData and checkboxValues state to empty objects
    setFormData({});
  
    // Optionally, you can also clear the selectedTable state if needed
    setSelectedTable("");
  };

  return (
    <div>
      <button
        type="button"
        className="btn btn-light-primary border-1 border-dashed border-primary btn-sm"
        data-bs-toggle="modal"
        data-bs-target="#kt_modal_1"
      >
        New
      </button>

      <div
        className="modal fade"
        tabIndex="-1"
        id="kt_modal_1"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title font-semibold text-primary">
                Add new
              </h1>
              <div
                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ki-duotone ki-cross fs-1">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>
            <div className="modal-body scroll h-500px">
              <form>
                <label className="fs-6 fw-semibold form-label mt-3">
                  <span className="required">Select Table</span>
                </label>
                <select
                  className="form-select form-select-solid required"
                  aria-label="Select example"
                  onChange={handleTableChange}
                  value={selectedTable}
                >
                  <option value=""></option>
                  {tablename.map((table, index) => (
                    <option key={index} value={table.TABLE_NAME}>
                      {table.TABLE_NAME}
                    </option>
                  ))}
                </select>
                {/* Render table categories here */}
                {tableCategories.map((category, index) => (
                  <div key={index}>
                    <label className="fs-6 fw-semibold form-label mt-3">
                      <span className="required">{category}</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      name={category} // Using original category name as input name
                      value={formData[category] || ""} // Bind input value to state
                      onChange={handleInputChange} // Handle input changes
                      required
                      aria-invalid={errorMessage ? "true" : "false"}
                      aria-describedby={`error-${category}`}
                    />
                  </div>
                ))}
                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onClick={handleReset}>
                Discard
              </button>
              <div> <button
                onClick={handleSubmit}
                type="button"
                class="btn btn-primary"
              >
                Save changes
              </button>
              {popupMessage && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                {popupMessage}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={closePopup}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
              </div>
             
              <button
                type="button"
                class="btn btn-light-danger"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*end::Add */}
    </div>
  );
};

export default AddScreen;
