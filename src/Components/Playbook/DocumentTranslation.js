
// ----------------------
import React, { useEffect, useState } from 'react';
import SnowflakeAside from '../Aside/SnowflakeAside';
import Header from '../Header/Header';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button, Box, Chip } from '@mui/material';
import FileDownloadSharpIcon from '@mui/icons-material/FileDownloadSharp';
const DocumentTranslation = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [translatedDocuments, setTranslatedDocuments] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languages, setLanguages] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const TRANSLATER_SERVICE_KEY = process.env.TRANSLATER_SERVICE_KEY;
  const TRANSLATOR_REGION = process.env.TRANSLATOR_REGION;
  const [fileUrl, setFileUrl] = useState('');


  const [asideOpen, setAsideOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableHistory, setTableHistory] = useState([]); // State to track table history
  const [username, setUsername] = useState("");
  const [authenticated, setAuthenticated] = useState(true);


  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation', {
          headers: {
            'Ocp-Apim-Subscription-Key': TRANSLATER_SERVICE_KEY,
            'Ocp-Apim-Subscription-Region': TRANSLATOR_REGION,
          },
        });
        const data = await response.json();
        const fetchedLanguages = Object.entries(data.translation).map(([code, { name }]) => ({
          code,
          name,
        }));
        setLanguages(fetchedLanguages);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    };

    fetchLanguages();
  }, []);



  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleLanguageChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedLanguages(typeof value === 'string' ? value.split(',') : value);
  };




  const handleTranslate = async () => {
    // if (!selectedFiles.length || !selectedLanguages.length ) {
    //   alert("Please select at least one file and at least one language.");
    //   return;
    // }
    console.log({ selectedFiles, selectedLanguages, translatedDocuments });

    if (!(selectedFiles?.length > 0) || !(selectedLanguages?.length > 0)) {
      alert("Please select at least one file and at least one language.");
      return;
    }

    const formData = new FormData();
    for (let file of selectedFiles) {
      formData.append('files', file);

    }
    for (let language of selectedLanguages) {
      formData.append('languages', language);
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/translate-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) { throw new Error('Failed to translate documents'); }

      const result = await response.json();
      console.log("API Response:", result); // Debugging log
      setTranslatedDocuments(result);
      console.log("translated documents: ", translatedDocuments);


    } catch (error) {
      alert(`Error translating documents: ${error.message}`);
    }
  };

  useEffect(() => {
    console.log("translated documents", translatedDocuments);
  }, [translatedDocuments]);

  const handleDownload = async () => {
    console.log({ selectedFiles, selectedLanguages, translatedDocuments });
    try {
      // Make a GET request to your Flask backend to get the file URL
      const response = await fetch('http://127.0.0.1:5000/download-file/file_path', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Failed to get file URL', error);
        throw new Error('Failed to get file URL');
      }

      // Extract file URL from response
      const data = await response.json();
      const { file_url } = data;
      console.log("file data", data);

      // Set the file URL in the state
      setFileUrl(file_url);
      console.log("file url", file_url);

      // Initiate file download
      window.open(file_url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      // Handle error appropriately, e.g., show an error message
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
    <div className='flex'>
      <SnowflakeAside asideOpen={asideOpen}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        onTableSelect={handleTableSelect}
      />
      <div className='flex-grow'>
        <Header />
        <div className="container py-4 mx-auto">
          <div className="flex justify-center items-center">
            <Box sx={{ width: '60%', boxShadow: 3, p: 4, borderRadius: 2 }}
              className='card container flex justify-center items-center'>
              <h2 style={{ fontSize: '2em', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>Document Translation</h2>
              <CloudUploadIcon fontSize="large" style={{ fontSize: 65, color: '#007bff' }} />
              <FormControl fullWidth sx={{ mb: 2 }}
                className='card '
              >
                {/* <Button
                  // variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: '100%' }}
                > */}
                {/* Upload Files */}

                <input
                  type="file"

                  className='border-1 justify-space-between'
                  // hidden
                  multiple
                  onChange={handleFileChange}
                />
                {/* </Button> */}
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="language-select-label">Select Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  multiple
                  value={selectedLanguages}
                  onChange={handleLanguageChange}
                  input={<OutlinedInput label="Select Language" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={languages.find(lang => lang.code === value)?.name} />
                      ))}
                    </Box>
                  )}
                >
                  {languages.map((language) => (
                    <MenuItem key={language.code} value={language.code}>
                      {language.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleTranslate} sx={{ mr: 1 }}>
                  Translate
                </Button>
                {/* <Button variant="contained" startIcon={<FileDownloadSharpIcon />} color="primary" onClick={handleDownload} sx={{ mr: 1 }}>
                  Download
                </Button> */}
              </Box>
            </Box>
          </div>
          {/* Display documents */}
          <div className='card container h-340px w-3/5 shadow-md mt-4 '>
            <div class="card-body container card-scroll h-300px w-570px items-center justify-center shadow-md mt-2 mb-2 bg-gray-100 "
            // style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div className="mt-4">
                {/* {translatedDocuments.length > 0 && (
                <div className="d-flex">
                  <div key={"original-doc-" + translatedDocuments.length - 1} className="container w-3/5">
                    <h2>Original Doc</h2>
                    <div className="card h-3/4 items-center justify-center">
                      <p>Container Name: {translatedDocuments[translatedDocuments.length - 1].originalName.split('/')[3]}</p>
                      <p>Document Name: {translatedDocuments[translatedDocuments.length - 1].originalName.split('/')[4]}</p>
                    </div>
                  </div>
                  <div key={"translated-doc-" + translatedDocuments.length - 1} className="w-3/5">
                    <h2>Translated Docs</h2>
                    <div className="card h-3/4 items-center justify-center">
                      <p>Container Name: {translatedDocuments[translatedDocuments.length - 1].translatedContent.split('/')[3]}</p>
                      <p>Document Name: {translatedDocuments[translatedDocuments.length - 1].translatedContent.split('/')[5]}</p>
                    </div>
                  </div>
                </div>
              )} */}

                {translatedDocuments && translatedDocuments.length > 0 && (
                  translatedDocuments.map((document, index) => (
                    <div key={index} className="d-flex">
                      <div className="container w-3/5">
                        <h2>Original Doc</h2>
                        <div className="card h-3/4 items-center justify-center">
                          <p>Container Name: {document.originalName.split('/')[3]}</p>
                          <p>Document Name: {document.originalName.split('/')[4]}</p>
                        </div>
                      </div>
                      <div className="container w-3/5">
                        <h2>Translated Doc</h2>
                        <div className="card h-3/4 items-center justify-center">
                          <p>Container Name: {document.translatedContent.split('/')[3]}</p>
                          <p>Document Name: {document.translatedContent.split('/')[7]}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}


              </div>
            </div>

          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default DocumentTranslation;

// import React, { useEffect, useState } from 'react';
// import SnowflakeAside from '../Aside/SnowflakeAside';
// import Header from '../Header/Header';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import CloudUploadIcon from '@material-ui/icons/CloudUpload';
// import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
// import { fontWeight } from '@material-ui/system';

// const TRANSLATER_SERVICE_KEY = process.env.TRANSLATER_SERVICE_KEY;
// const Region = process.env._REGION;


// const DocumentTranslation = () => {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [translatedDocuments, setTranslatedDocuments] = useState([]);
//   const [error, setError] = useState(null);
//   // const [selectedLanguage, setSelectedLanguage] = useState('en');
//   const [selectedLanguages, setSelectedLanguages] = useState([]);
//   const [fileError, setFileError] = useState(null);
//   const [languageError, setLanguageError] = useState(null);
//   const [languages, setLanguages] = useState([]);

//   const [asideOpen, setAsideOpen] = useState(false);
//   const [selectedTable, setSelectedTable] = useState("");
//   const [tableHistory, setTableHistory] = useState([]); // State to track table history
//   const [username, setUsername] = useState("");
//   const location = useLocation(); // Use the useLocation hook to access route parameters
//   const [authenticated, setAuthenticated] = useState(true);
//   const navigate = useNavigate();

//   const handleFileChange = (event) => {
//     setSelectedFiles([...event.target.files]);
//   };
//   // fetch language from azure language studio
//   const fetchLanguages = async () => {
//     try {
//       const response = await fetch('https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation', {
//         method: 'GET',
//         headers: {
//           'Ocp-Apim-Subscription-Key': `${TRANSLATER_SERVICE_KEY}`,
//           'Ocp-Apim-Subscription-Region': `${Region}`, // This header is required for certain regions.
//         },
//       });
//       const data = await response.json();
//       const languagesArray = Object.entries(data.translation).map(([code, { name }]) => ({
//         code,
//         name,
//       }));
//       setLanguages(languagesArray); // Update your state with the fetched languages
//     } catch (error) {
//       console.error('Failed to fetch languages:', error);
//     }
//   };
//   useEffect(() => {
//     fetchLanguages();
//   }, []); // The empty array ensures this effect runs only once after the initial render


//   // Add a function to handle language selection
//   const handleLanguageChange = (event) => {
//     try {
//       const selectedOptions = [...event.target.selectedOptions].map(o => o.value);
//       setSelectedLanguages(selectedOptions);
//     } catch {
//       alert('Please select language')
//     }
//   };

//   // for translate file send to backend flask
//   const handleTranslate = async () => {

//     // Check if files are selected
//     if (selectedFiles.length === 0) {
//       setFileError("Please select at least one file.");
//       return;
//     } else {
//       setFileError(null);
//     }

//     // Check if language is selected
//     if (!selectedLanguages) {
//       setLanguageError("Please select a language.");
//       return;
//     } else {
//       setLanguageError(null);
//     }

//     const formData = new FormData();
//     selectedFiles.forEach((file) => {
//       formData.append('files', file);
//       console.log('selected files', file);// Ensure the key matches the key expected by the server
//     });
//     // Append selected languages to the FormData
//     selectedLanguages.forEach((language) => {
//       formData.append('languages', language);
//       console.log('languages', language);

//     });

//     try {
//       const response = await fetch('http://127.0.0.1:5000/translate-documents', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Failed to translate documents');
//       }

//       const translationResult = await response.json();
//       setTranslatedDocuments(translationResult.translated_documents);
//       console.log("translationResult", translationResult.translated_documents);
//     } catch (error) {
//       console.error('Error translating documents:', error);
//       alert('Error translating documents');
//     }
//   };

//   const handleDownload = () => {
//     console.log(translatedDocuments);
//   };


//   // aside
//   const userName = location.state ? location.state.userName : localStorage.getItem("userName");  // Extract the userName from the route parameters

//   // Function to handle logout
//   const handleLogout = () => {
//     localStorage.removeItem("authenticated");
//     setAuthenticated(false);// Redirect to the login page
//     navigate("/");
//   };


//   // const { userName } = location.state || {};

//   // Set the username in the component's state
//   useEffect(() => {
//     setUsername(userName || ""); // Set the default value to an empty string if userName is not provided
//   }, [userName]);


//   const handleTableSelect = (tableName) => {
//     // Add the current selected table to the history
//     setTableHistory([...tableHistory, selectedTable]);

//     // Update the selected table
//     setSelectedTable(tableName);
//   };

//   // Callback function to handle "Back" action
//   const handleBack = () => {
//     // Get the previous table from the history
//     const previousTable = tableHistory.pop();

//     // Update the selected table with the previous table
//     setSelectedTable(previousTable);

//     // Update the table history
//     setTableHistory([...tableHistory]);
//   };

//   // aside end

//   return (


//     <div className='flex'>
//       <SnowflakeAside asideOpen={asideOpen}
//         selectedTable={selectedTable}
//         setSelectedTable={setSelectedTable}
//         onTableSelect={handleTableSelect}
//       />
//       <div className='flex-grow'>
//         <Header />

//         <div className="container py-4 mx-auto  ">

//           <div class=" flex justify-center items-center  ">
//             <div className="card card-custom  flex flex-col md:flex-row md:items-center  p-4 shadow-md rounded-md w-3/5 ">
//               <h2 style={{ fontSize: '2em', fontWeight: 'bold' }} className='text-center mb-2'>Document Translation</h2>
//               {/* File Input Section */}
//               <div className="flex flex-col items-center flex-1">
//                 <CloudUploadIcon fontSize="large" style={{ color: '#007bff' }} />
//                 <input
//                   type="file"
//                   className="form-control border-1 pt-2 pb-2 mt-2 w-3/5 shadow-md"
//                   id="fileInput"
//                   multiple
//                   onChange={handleFileChange}

//                 />
//                 {fileError && <span className="text-red-500">{fileError}</span>}
//                 {/* <label htmlFor="fileInput" className="text-md font-bold mt-2">Choose Files</label> */}
//               </div>

//               {/* Language Selection Dropdown */}
//               {/* <div className="flex flex-col items-center mt-4 md:mt-0 md:ml-4 flex-1">
//                 <label htmlFor="languageSelect" className="form-label">Select Language:</label>
//                 <select
//                   id="languageSelect"
//                   // placeholder={selectedLanguages}
//                   className="form-select w-3/5 shadow-md "
//                   multiple
//                   value={selectedLanguages}
//                   onChange={handleLanguageChange}
//                 >
//                   <option></option>
//                   {languages.map((language) => (
//                     <option key={language.code} value={language.code}>
//                       {language.name}
//                     </option>

//                   ))}
//                 </select>
//                 {languageError && <span className="text-red-500">{languageError}</span>}
//               </div> */}
//               <div className="flex flex-col items-center mt-4 md:mt-0 md:ml-4 flex-1">
//                 <label htmlFor="languageSelect" className="form-label">Select Language:</label>
//                 <select id="languageSelect" className="form-select form-select-solid" value={selectedLanguages}
//                   onChange={handleLanguageChange} data-control="select2" data-close-on-select="false" data-placeholder="Select an option" data-allow-clear="true" multiple="multiple">
//                   <option></option>
//                   {languages.map((language) => (
//                     <option key={language.code} value={language.code}>
//                       {language.name}
//                     </option>
//                   ))}
//                 </select>
//                 {languageError && <span className="text-red-500">{languageError}</span>}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-center mt-4 md:mt-0 md:ml-4">
//                 <button className="btn btn-primary mx-2" onClick={handleTranslate}>Translate</button>
//                 <button className="btn btn-success mx-2" onClick={handleDownload}>Download</button>
//               </div>
//             </div>
//           </div>



//           {/* Display documents */}
//           <div className='card container h-340px w-3/5 shadow-md mt-4 '>
//             <div class="card-body container card-scroll h-300px w-570px items-center justify-center shadow-md mt-2 mb-2 bg-gray-100 "
//             // style={{ display: 'flex', flexDirection: 'column' }}
//             >
//               {/* <div className="mt-4"> */}
//               {translatedDocuments.length > 0 && (
//                 <div className="d-flex">
//                   <div key={"original-doc-" + translatedDocuments.length - 1} className="container w-3/5">
//                     <h2>Original Doc</h2>
//                     <div className="card h-3/4 items-center justify-center">
//                       <p>Container Name: {translatedDocuments[translatedDocuments.length - 1].originalName.split('/')[3]}</p>
//                       <p>Document Name: {translatedDocuments[translatedDocuments.length - 1].originalName.split('/')[4]}</p>
//                     </div>
//                   </div>
//                   <div key={"translated-doc-" + translatedDocuments.length - 1} className="w-3/5">
//                     <h2>Translated Docs</h2>
//                     <div className="card h-3/4 items-center justify-center">
//                       <p>Container Name: {translatedDocuments[translatedDocuments.length - 1].translatedContent.split('/')[3]}</p>
//                       <p>Document Name: {translatedDocuments[translatedDocuments.length - 1].translatedContent.split('/')[6]}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* </div> */}
//             </div>

//           </div>

//         </div>
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default DocumentTranslation;






