import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
const EditScreen = ({ errorMessage, setErrorMessage }) => {
  const [tablename, setTablename] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableCategories, setTableCategories] = useState([]);
  const [formData, setFormData] = useState({}); // State to hold input values
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]); // State to track selected checkboxes
  const [checkboxValues, setCheckboxValues] = useState({}); // State to hold checkbox input values
  const [popupMessage, setPopupMessage] = useState(null); // State for pop-up message
  const location = useLocation();
  const tableName = location.pathname.split("/").pop(); 
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchTableCategories(tableName);
  }, [tableName]);

  const fetchTableCategories = async (tableName) => {
    try {
      console.log("Fetching categories for tableName:", tableName); 
      const response = await fetch(`${BASE_URL}/tablenamecategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }), // Send the extracted tableName
      });
      console.log("Response from backend:", response);
      const data = await response.json();
      console.log("Fetched categories from backend:", data.categories); // Check if categories are correctly fetched
      setTableCategories(data.categories);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    fetchTablename();
  }, []);

  const fetchTablename = async () => {
    try {
      const response = await fetch(`${BASE_URL}/gettablename`);
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
      const response = await fetch(`${BASE_URL}/tablenamecategories`, {
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
  const handleCheckboxChange = (event) => {
    const category = event.target.name;
    const isChecked = event.target.checked;

    // Update the selected checkboxes state
    if (isChecked) {
      setSelectedCheckboxes((prevSelected) => [...prevSelected, category]);
    } else {
      setSelectedCheckboxes((prevSelected) =>
        prevSelected.filter((item) => item !== category)
      );
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log("Input change:", name, value); // Add this line for debugging
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setCheckboxValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      console.log("Form data to be submitted:", formData); 

      const dataToSend = {
        tableName: tableName,
        dataToUpdate: formData,
      };

      console.log("Data to be sent to backend:", dataToSend); 

      const response = await fetch(`${BASE_URL}/updateData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();
      console.log("Response from backend:", responseData);
      if (responseData.message === 'Data updated successfully') {
        console.log("Data Updated successfully");
        setPopupMessage("Data Updated successfully.");
        setErrorMessage(null); 
        
      } else {
        console.log("Data Updated failed");
        setPopupMessage("Data Updated failed. Please try again.");
      }

      // window.location.reload();

    } catch (error) {
      console.log(error);
    }
  };
  console.log("Rendering EditScreen component"); // Log when component renders

  const closePopup = () => {
    // Close the pop-up message
    setPopupMessage(null);
  };

  const handleReset = (event) => {
    event.preventDefault();
  
    // Reset the formData and checkboxValues state to empty objects
    setFormData({});
    setCheckboxValues({});
  
    // Clear the selected checkboxes state
    setSelectedCheckboxes([]);
  
    // Optionally, you can also clear the selectedTable state if needed
    setSelectedTable("");
  };

  return (
    <div>
      <button
        type="button"
        class="btn   border-1 btn-sm"
        data-bs-toggle="modal"
        data-bs-target="#kt_modal_2"
      >
      <a  class="btn btn-icon btn-bg-light btn-active-color-primary  btn-sm me-1">
																{/* <!--begin::Svg Icon | path: icons/duotune/art/art005.svg--> */}
																<span class="svg-icon svg-icon-3 ">
																	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
																		<path opacity="0.3" d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black"></path>
																		<path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>
																	</svg>
																</span></a>
      </button>
      <div
        class="modal fade"
        tabindex="-1"
        id="kt_modal_2"
        data-bs-backdrop="static"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title font-semibold text-primary">
                Edit Screen
              </h1>

              {/*begin::Close*/}
              <div
                class="btn btn-icon btn-sm btn-active-light-primary ms-2"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i class="ki-duotone ki-cross fs-1">
                  <span class="path1"></span>
                  <span class="path2"></span>
                </i>
              </div>
              {/*end::Close*/}
            </div>

            <div class="modal-body scroll h-500px px-5">
              <form>
                {/* Check box */}
                <label className="fs-6 fw-semibold form-label mt-3 ">
                <span className="required text-left">Table name: {tableName}</span>
                </label>
               
                {tableCategories.map((category, index) => (
                  <div className = 'text-left' key={index}>
                    <label className="fs-6 fw-semibold form-label mt-3">
                      <span className="required">{category}</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-solid"
                      name={category}
                      value={formData[category] || ""}
                      onChange={handleInputChange}
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
              <button type="button" onClick={handleReset} class="btn btn-secondary">
                Discard
              </button>
              <div>
              <button
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

export default EditScreen;
