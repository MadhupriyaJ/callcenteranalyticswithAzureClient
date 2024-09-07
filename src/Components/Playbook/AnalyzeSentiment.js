import React, { useEffect, useState } from 'react'
import { FaSmile } from 'react-icons/fa';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import SnowflakeAside from '../Aside/SnowflakeAside';

const BASE_URL = process.env.REACT_APP_API_URL;

const AnalyzeSentiment = () => {
    const [inputText, setInputText] = useState('');
    const [sentimentResult, setSentimentResult] = useState(null);
    const [jsonContent, setJsonContent] = useState(null);
    const [file, setFile] = useState([]);
    const [fileNames, setFileNames] = useState([]);

    const [asideOpen, setAsideOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState("");
    const [tableHistory, setTableHistory] = useState([]);
    const [username, setUsername] = useState("");
    const location = useLocation();
    const [authenticated, setAuthenticated] = useState(true);
    const navigate = useNavigate();

    const handleAnalyzeSentiment = async () => {
         // Check if inputText is empty
         if (inputText.trim() === '' && file.length === 0 ) {
            alert('Please enter some text or select file(s) before running the analysis.');
            return; // Exit the function early
        }
        
        try {
            const response = await fetch(`${BASE_URL}/analyze-sentiment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ documents: [{ id: '1', language: 'en', text: inputText }] }),
            });
            console.log('sentiment analysis response', response);
            const data = await response.json();
            setSentimentResult(data);
            setJsonContent(JSON.stringify(data, null, 2)); // stringify with indentation for better readability
            console.log('json', setJsonContent(JSON.stringify(data, null, 2)));
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
           

        }
    };

    // const handleAnalyzeSentiment = async () => {
    //     // Check if inputText is empty
    //     if (inputText.trim() === '' && file.length === 0) {
    //                 alert('Please enter some text or select file(s) before running the analysis.');
    //                 return; // Exit the function early
    //             }
                
    
    //     const formData = new FormData();
    //     formData.append('text', inputText); // Add inputText
    //     console.log('text', inputText);
    //     if (file) {
    //         for (let i = 0; i < file.length; i++) {
    //             formData.append('files', file[i]); // Add selected files
    //             console.log('files', file[i]);
    //         }
    //     }
    
    //     try {
    //         const response = await fetch(`${BASE_URL}/analyze-sentiment`, {
    //             method: 'POST',
    //             body: formData, // Send FormData object
    //         });
   
    //         if (!response.ok) {
    //             console.error('sentiment analysy response error',error);
    //         }else{
    //             console.log("sentiment analysys response",response);
    //         }
    
    //         const data = await response.json();
    //         setSentimentResult(data);
    //         setJsonContent(JSON.stringify(data, null, 2)); // stringify with indentation for better readability
    //         console.log('json', JSON.stringify(data, null, 2));
    //     } catch (error) {
    //         console.error('Error analyzing sentiment:', error);
    //     }
    // };
    

    // const handleFileSelect = (e) => {
    //     const selectedFiles = e.target.files;
    //     setFile(selectedFiles);
    // };
    const handleFileSelect = (e) => {
        try{
        const selectedFiles = e.target.files;
        setFile(selectedFiles);

        // Extract and set file names for preview
        const selectedFileNames = Array.from(selectedFiles).map(file => file.name);
        setFileNames(selectedFileNames);
        }catch{
            alert("preview file is not worked")
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

        <h1 className="text-4xl font-bold mb-4 text-center">Text summarization</h1>

        <div className="container d-flex shadow-md rounded-lg mt-16">

            <div className="container h-440px w-800px mt-4 rounded-lg">

                <div className="container card-scroll w-700px items-center justify-center" style={{ display: 'flex', flexDirection: 'column' }}>

                    <div className="position-relative">
                        <textarea
                            className="form-control scroll scroll-pull w-700px  h-350px mt-1 z-0 shadow-2xl position-relative pr-5"
                            rows="5"
                            placeholder="Enter your text here..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <div className="position-absolute bottom-0 start-0 m-2 bg-gray-100 w-500px d-flex gap-2 items-center">
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <input id="file-upload" type="file" style={{ display: 'none' }} multiple onChange={handleFileSelect} />
                                <img src="/assets/media/svg/files/upload.svg" alt="Upload Icon" className="text-primary h-10" />
                            </label>
                            {/* Display uploaded file names */}
                            <div>
                                {fileNames.length > 0 && (
                                    <div className='d-flex gap-2'>
                                        <strong>Uploaded Files:</strong>
                                        <ul className='d-flex gap-2'>
                                            {fileNames.map((name, index) => (
                                                <li key={index}>{name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center justify-center mt-4'>
                        <button className="btn btn-primary opacity-50-hover"
                            onClick={handleAnalyzeSentiment}
                        >
                            Run
                        </button>
                    </div>
                </div>

            </div>
            <div className='rounded-lg items-center w-500px mx-5 d-flex flex-column'>

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

                        {/* {sentimentResult && ( */}
                        {sentimentResult && sentimentResult[0] && sentimentResult[0].confidenceScores && (
                            <div className="card scroll scroll-pull  card-custom container mt-4 w-500px h-300px shadow-md">
                                <strong className='text-center'>Sentiment Analysis</strong>
                                <p ><strong><span className="text-primary">Sentiment for the Entire Document:</span></strong></p>
                                <p className=''>Sentiment: {sentimentResult[0].sentiment}</p>
                                <p>Confidence Scores:</p>
                                <ul>
                                    <li>Positive: <span style={{ color: sentimentResult[0].confidenceScores.positive > 0.5 ? 'green' : 'inherit' }}><strong>
                                        {sentimentResult[0].confidenceScores.positive}</strong></span>
                                    </li>

                                    <li>Neutral: <span style={{ color: sentimentResult[0].confidenceScores.neutral == 0.5 ? 'blue' : 'inherit' }}><strong>
                                        {sentimentResult[0].confidenceScores.neutral}</strong></span>
                                    </li>
                                    <li>Negative: <span style={{ color: sentimentResult[0].confidenceScores.negative > 0.5 ? 'red' : 'red' }}><strong>
                                        {sentimentResult[0].confidenceScores.negative}</strong></span>
                                    </li>
                                </ul>
                                <p>{inputText}</p>
                                <p><strong><span className="text-primary">Sentiment Analysis for each Sentence:</span></strong></p>
                                {sentimentResult[0].sentences.map((sentence, index) => (
                                    <div key={index}>
                                        <strong>Sentence {index + 1}:</strong>
                                        <p>Sentiment:  <strong><span style={{
                                            color:
                                                sentence.sentiment === 'positive' ? 'green' :
                                                    sentence.sentiment === 'negative' ? 'red' : 'blue'
                                        }}>
                                            {sentence.sentiment}
                                        </span></strong></p>
                                        <p>Confidence Scores:</p>
                                        <ul>
                                            <li >Positive: <span style={{ color: 'green' }}>{sentence.confidenceScores.positive}</span></li>
                                            <li>Neutral: <span style={{ color: 'blue' }}>{sentence.confidenceScores.neutral}</span></li>
                                            <li>Negative: <span style={{ color: 'red' }}>{sentence.confidenceScores.negative}</span></li>
                                        </ul>
                                        <p>Sentence Text:</p>
                                        <p>{sentence.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                    {/* </div> */}

                    <div className="tab-pane fade show active" id="json" role="tabpanel" aria-labelledby="json-tab">
                        <div className="card card-custom container mt-4 w-500px h-300px shadow-md">

                            <strong>JSON content goes here</strong>
                            <pre>{jsonContent}</pre>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        </div>
          <Outlet />
        </div>
      </div>
      </div>
    );
}

export default AnalyzeSentiment