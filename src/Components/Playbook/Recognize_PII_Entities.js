import React, { useEffect, useState } from 'react';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import SnowflakeAside from '../Aside/SnowflakeAside';

const BASE_URL = process.env.REACT_APP_API_URL;

const Recognize_PII_Entities = () => {
    const [inputText, setInputText] = useState('');
    const [jsonContent, setJsonContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [redactedText, setRedactedText] = useState('');
    const [piiEntities, setPiiEntities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [activeTab, setActiveTab] = useState('text');



    const [asideOpen, setAsideOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState("");
    const [tableHistory, setTableHistory] = useState([]);
    const [username, setUsername] = useState("");
    const location = useLocation();
    const [authenticated, setAuthenticated] = useState(true);
    const navigate = useNavigate();


    const handlePIIRecognition = async () => {
        try {
            const response = await fetch(`${BASE_URL}/recognize-pii`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: inputText })
            });

            if (!response.ok) {
                throw new Error('Failed to recognize PII');
            }
            // console.log("PII response", response);

            const data = await response.json();
            setRedactedText(data.redactedText);
            setPiiEntities(data.piiEntities);
            setJsonContent(JSON.stringify(data, null, 2)); // stringify with indentation for better readability
            // console.log('json', setJsonContent(JSON.stringify(data, null, 2)));
        } catch (error) {
            console.error('Error:', error);
            // Handle error here
        }
    };

    const handleFileChange = (e) => {
        // setSelectedFiles(e.target.files);
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        // Ensure that each file has a temporary path set
        files.forEach(file => {
            file.tempFilePath = URL.createObjectURL(file);
        });

    };

    const processFilePII = async () => {
        setLoading(true);

        if (!selectedFiles || selectedFiles.length === 0) {
            // alert("No files selected");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file); // Append each file to the form data
            console.log("files", file);
        });

        try {
            const response = await fetch(`${BASE_URL}/process-files-pii`, {
                method: 'POST',
                body: formData
            });

            console.log("response", response);
            if (!response.ok) {
                throw new Error('Failed to recognize PII');
            }

            const data = await response.json();
            console.log("data", data);
            setResults(data);
            setRedactedText(data[0].redactedText);
            setPiiEntities(data[0].piiEntities);
            setJsonContent(JSON.stringify(data, null, 2));
            
        } catch (error) {
            console.error('Error:', error);
            // Handle error here
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'text') {
            setInputText('');
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
            <div className='bg-gray-100 vh-100 '>
              <div >
              <Header />
              </div>
              
              <h1 style={{ fontSize: '2em',textAlign: 'center'}} ><strong><span className="text-primary">Recognize_PII_Entities</span></strong></h1>
              {/* PII UI Start */}
        <div>
             

            <div className="container d-flex shadow-lg rounded-lg mt-16 h-full bg-stone-100">
               
                <div className="container h-440px w-800px mt-4 rounded-lg">

                    <div className="container card-scroll w-700px items-center justify-center" style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* <h1 style={{ fontSize: '2em' }} ><strong><span className="text-primary">Recognize_PII_Entities</span></strong></h1> */}

                        {/* <!-- Nav tabs --> */}
                        <ul className="nav nav-tabs" id="myTabs" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" id="text-tab" data-bs-toggle="tab" data-bs-target="#text" type="button" role="tab" 
                                aria-controls="analyze" aria-selected="true"
                                onClick={() => handleTabChange('text')}>TEXT HERE</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link " id="document-tab" data-bs-toggle="tab" data-bs-target="#document" type="button" role="tab" aria-controls="json" aria-selected="false">UPLOAD DOCUMENT</button>
                            </li>
                        </ul>

                        <div className="tab-content" id="myTabContent">

                            {/* text input */}
                            <div className="tab-pane fade show active " id="text" role="tabpanel" aria-labelledby="text-tab">
                                <div className="position-relative">
                                    <textarea
                                        className="form-control scroll scroll-pull w-700px  h-350px mt-1 z-0 shadow-2xl position-relative pr-5"
                                        rows="5"
                                        placeholder="Enter your text here..."
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* upload document */}

                            <div className="tab-pane fade  " id="document" role="tabpanel" aria-labelledby="document-tab">

                                <div className='card card-custom container mt-4 w-700px  h-350px shadow-md'
                                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                >
                                    <h1 className="text-4xl font-bold mb-4">Document</h1>
                                    <div className='mb-2'>
                                        <CloudUploadIcon fontSize="inherit" style={{ color: '#007bff', fontSize: '5em' }} />
                                    </div>
                                    <div className="mb-5 custom-file-input">
                                        <input
                                            className="form-control border-1 pt-2 pb-2 w-400px "
                                            type="file"
                                            name='file'
                                            id="filePicker"
                                            accept=".txt"
                                            onChange={handleFileChange}
                                            // ref={fileInputRef}
                                            multiple
                                        />
                                    </div>
                                </div>
                            </div>


                        </div>

                        <div className='flex items-center justify-center mt-4'>
                            <button className="btn btn-primary opacity-50-hover"
                                onClick={() => {
                                    handlePIIRecognition();
                                    processFilePII();
                                }}

                            >
                                Run
                            </button>
                        </div>
                    </div>

                </div>



                <div className='rounded-lg items-center w-500px mx-5 d-flex flex-column mt-14'>


                    {/* <!-- Nav tabs --> */}
                    <ul className="nav nav-tabs" id="myTabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link " id="analyze-tab" data-bs-toggle="tab" data-bs-target="#analyze" type="button" role="tab" aria-controls="analyze" aria-selected="true">Analyze sentiment</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="json-tab" data-bs-toggle="tab" data-bs-target="#json" type="button" role="tab" aria-controls="json" aria-selected="false">JSON</button>
                        </li>
                    </ul>

                    {/* <!-- Tab panes --> */}
                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade " id="analyze" role="tabpanel" aria-labelledby="analyze-tab">
                            <div className="card scroll scroll-pull  card-custom container mt-4 w-500px h-300px shadow-md">
                                <div>
                                    <h2>Redacted Text:</h2>
                                    <p>{redactedText}</p>
                                </div>
                                <div className='' >
                                    <h2>PII Entities:</h2>

                                    <ul>
                                        <div className='flex flex-row flex-wrap gap-1'>
                                            {piiEntities.map((entity, index) => (
                                                <div className='card w-2/5 h-100px'>
                                                    <li key={index}>
                                                        <strong>Entity Text:</strong> {entity.text} <br />
                                                        <strong>Entity Category:</strong> {entity.category} <br />
                                                        {entity.confidenceScore && <span><strong>Confidence Score:</strong> {entity.confidenceScore}</span>}
                                                    </li>
                                                </div>

                                            ))}
                                        </div>

                                    </ul>


                                </div>
                            </div>


                        </div>
                        {/* </div> */}

                        <div className="tab-pane fade show active " id="json" role="tabpanel" aria-labelledby="json-tab">
                            <div className="card card-custom container mt-4 w-500px h-300px shadow-md ">

                                <strong>JSON content goes here</strong>
                                <pre>{jsonContent}</pre>
                            </div>
                        </div>
                    </div>

                </div>
              
            </div>

           
           
        </div>
        {/* PII UI end */}

        </div>
          <Outlet />
        </div>
      </div>
      </div>
    )
}

export default Recognize_PII_Entities