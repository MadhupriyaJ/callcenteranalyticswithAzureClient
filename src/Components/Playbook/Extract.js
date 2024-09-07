import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import SnowflakeAside from '../Aside/SnowflakeAside';



const BASE_URL = process.env.REACT_APP_API_URL;

const Extract = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');

  const [asideOpen, setAsideOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableHistory, setTableHistory] = useState([]); // State to track table history
  const [username, setUsername] = useState("");
  const location = useLocation(); // Use the useLocation hook to access route parameters
  const [authenticated, setAuthenticated] = useState(true);
  const navigate = useNavigate();

  const handleGenerateSummary = async () => {
    const response = await fetch('http://127.0.0.1:5000/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text_document: inputText }),
    });

    if (response.ok) {
      const result = await response.json();
      setSummary(result);


      // Send the text content, abstract summary, and extract summary to the server
    const dataToSend = {
      textContent: inputText,
      abstractSummary: result.abstract_summary,
      extractSummary: result.extract_summary
    };

    // Send the data to the server
    sendSummaryDataToServer(dataToSend);

    } else {
      console.error('Failed to generate summary');
    }
  };

  const sendSummaryDataToServer = async (data) => {
    try {
      const response = await fetch(`${BASE_URL}/api/save-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        console.error('Failed to send summary data to the server');
      }
    } catch (error) {
      console.error('Error sending summary data to the server:', error);
    }
  };




  // aside
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

  // aside end
  // scrollable

  return (
    <div className='flex '>
      <div >
        <SnowflakeAside asideOpen={asideOpen}
          selectedTable={selectedTable} // Pass selected table to AsideBk
          setSelectedTable={setSelectedTable}
          onTableSelect={handleTableSelect} // Pass callback function to AsideBk
        />
      </div>

      <div className='h-22 w-full '>
        {/* <Header /> */}
        <div>
          {/* <Content/> */}
          <div className='bg-primary-50 vh-100 '>

            <div >
              <Header />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-center">Text summarization</h1>

            <div className="container d-flex shadow-md rounded-lg mt-16  ">

              <div className=" container h-440px w-800px  mt-4 rounded-lg">

                <div className=" container card-scroll  w-700px items-center justify-center " style={{ display: 'flex', flexDirection: 'column' }}>

                  <textarea
                    className="form-control h-350px mt-1 z-0 shadow-2xl"
                    rows="5"
                    placeholder="Enter your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className='flex items-center justify-center mt-4 '>
                    <button className="btn btn-primary opacity-50-hover " onClick={handleGenerateSummary}>
                      Generate Summary
                    </button>
                  </div>
                </div>

              </div>
              <div className=' rounded-lg   items-center  w-500px mx-5 d-flex flex-column'>

                <div className="card scroll scroll-pull card-custom container mt-4 w-500px h-200px shadow-md">
                  <strong>Abstract Summary:</strong> {summary.abstract_summary}
                </div>
                <div className="card scroll scroll-pull card-custom container mt-4 w-500px h-200px shadow-md">
                  <strong>Extract Summary:</strong> {summary.extract_summary}
                </div>

              </div>

            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Extract;
