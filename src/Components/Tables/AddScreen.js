
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const AddScreen = ({ errorMessage, setErrorMessage }) => {
  const [tableCategories, setTableCategories] = useState([]);
  const [formData, setFormData] = useState({});
  const [popupMessage, setPopupMessage] = useState(null);
  const [selectedTable, setSelectedTable] = useState("");
  const location = useLocation();
  const tableName = location.pathname.split("/").pop(); // Extract tableName from location
  const BASE_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    // Fetch categories based on the tableName from the location
    fetchTableCategories(tableName);
  }, [tableName]);

  const fetchTableCategories = async (tableName) => {
    try {
      console.log("Fetching categories for tableName:", tableName); // Check if tableName is correct
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = tableCategories.filter(
      (category) => category.required
    );
    const isAllFieldsFilled = requiredFields.every(
      (category) => formData[category] !== ""
    );

    if (!isAllFieldsFilled) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      const dataToSend = {
        tableName: tableName,
        dataToInsert: formData,
      };

      const response = await fetch(`${BASE_URL}/insertData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      const responseData = await response.json();

      if (responseData.message === "Data inserted successfully") {
        setPopupMessage("Data inserted successfully.");
        setErrorMessage(null);
      } else {
        setPopupMessage("Data insertion failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const closePopup = () => {
    setPopupMessage(null);
  };

  const handleReset = (event) => {
    event.preventDefault();
    setFormData({});
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
                <div className="text-center">
                  <label className="fs-6 fw-semibold form-label mt-3">
                <span className="required text-left">Table name: {tableName}</span>
                </label>
                </div>
                
                {tableCategories.map((category, index) => (
                  <div key={index}>
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
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Discard
              </button>
              <div>
                {" "}
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="btn btn-primary"
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
                className="btn btn-light-danger"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddScreen;
