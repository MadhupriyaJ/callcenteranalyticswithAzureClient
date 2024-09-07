// import React, { useState } from 'react';
// import { FaSpinner, FaCheck } from 'react-icons/fa';
// import confetti from 'canvas-confetti';

// const BASE_URL = process.env.REACT_APP_API_URL;

// const Text = () => {
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [transcriptions, setTranscriptions] = useState({});
//   const [processingStatus, setProcessingStatus] = useState({});
//   const [viewMode, setViewMode] = useState('transcription'); // 'transcription', 'sentiment', 'PronunciationAssessment', 'summary'
//   const filesPerPage = 10;

//   const handleFileChange = (e) => {
//     const filesArray = Array.from(e.target.files);
//     setSelectedFiles(filesArray);
//   };

//   const handleFileUpload = async () => {
//     const results = {};
//     const statusUpdates = {};

//     for (const file of selectedFiles) {
//       const formData = new FormData();
//       formData.append('audioFile', file);
//       statusUpdates[file.name] = 'loading';
//       setProcessingStatus({ ...statusUpdates });

//       try {
//         const response = await fetch(`${BASE_URL}/startRecognition`, {
//           method: 'POST',
//           body: formData,
//         });
//         const result = await response.json();
//         console.log('result:', result);

//         if (result.results && result.results.length > 0) {
//           const fileData = result.results[0];
//           results[fileData.fileName] = fileData;
//           statusUpdates[fileData.fileName] = 'done';
//         }

//       } catch (error) {
//         console.error('Error uploading file:', file.name, error);
//         statusUpdates[file.name] = 'error';
//       }

//       setProcessingStatus({ ...statusUpdates });
//     }

//     setTranscriptions(results);
//     confetti({
//       particleCount: 100,
//       spread: 70,
//       origin: { y: 0.6 },
//     });
//     alert('Process completed!');
//   };

//   const handleOutputClick = () => {
//     const allProcessed = selectedFiles.every(file => processingStatus[file.name] === 'done');

//     if (allProcessed) {
//       setViewMode('transcription');
//       confetti({
//         particleCount: 100,
//         spread: 70,
//         origin: { y: 0.6 },
//       });
//     } else {
//       alert('Processing not completed yet. Please wait until all files are processed.');
//     }
//   };

//   const handleSentimentClick = () => {
//     try {
//       setViewMode('sentiment');
//       confetti({
//         particleCount: 100,
//         spread: 70,
//         origin: { y: 0.6 },
//       });
//     } catch (error) {
//       alert('Sentiment data not available');
//     }
//   };

//   const handleClickPronunciation = () => {
//     const allProcessed = selectedFiles.every(file => processingStatus[file.name] === 'done');
//     if (allProcessed) {
//       setViewMode('PronunciationAssessment');
//       confetti({
//         particleCount: 100,
//         spread: 70,
//         origin: { y: 0.6 },
//       });
//     } else {
//       alert('Processing not completed yet. Please wait until all files are processed.');
//     }
//   };

//   const handleSummaryClick = async () => {
//     const summaries = {};

//     console.log("Transcriptions before sending:", transcriptions);

//     for (const file of selectedFiles) {
//       const transcriptionText = transcriptions[file.name]?.transcription;

//       if (!transcriptionText) {
//         console.warn(`No transcription available for file: ${file.name}`);
//         continue; // Skip this file if there's no transcription
//       }

//       try {
//         console.log(`Sending transcription for file: ${file.name}`, transcriptionText);

//         const response = await fetch('http://127.0.0.1:5000/api/generate-summary', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ textDocuments: [{ language: "en", id: file.name, text: transcriptionText }] }),
//         });

//         const result = await response.json();
//         summaries[file.name] = result;

//       } catch (error) {
//         console.error('Error generating summaries for file:', file.name, error);
//       }
//     }

//     setTranscriptions(prevState => {
//       const updatedTranscriptions = { ...prevState };
//       for (const fileName in summaries) {
//         updatedTranscriptions[fileName].extractSummary = summaries[fileName].extractSummary;
//         updatedTranscriptions[fileName].abstractSummary = summaries[fileName].abstractSummary;
//       }
//       return updatedTranscriptions;
//     });

//     setViewMode('summary');
//     confetti({
//       particleCount: 100,
//       spread: 70,
//       origin: { y: 0.6 },
//     });
//   };


//   const indexOfLastFile = currentPage * filesPerPage;
//   const indexOfFirstFile = indexOfLastFile - filesPerPage;
//   const currentFiles = selectedFiles.slice(indexOfFirstFile, indexOfLastFile);

//   const handleClick = (pageNumber) => setCurrentPage(pageNumber);

//   const totalPages = Math.ceil(selectedFiles.length / filesPerPage);
//   const pageNumbers = [];
//   for (let i = 1; i <= totalPages; i++) {
//     pageNumbers.push(i);
//   }

//   return (
//     <div className='p-4 bg-white'>
//       <div className='flex justify-around items-center'>
//         <div className='mb-4'>
//           <label htmlFor='file-input' className='bg-blue-500 text-white px-4 py-2 rounded cursor-pointer'>
//             Select Files
//           </label>
//           <input
//             id="file-input"
//             type="file"
//             accept=".wav"
//             multiple
//             className='hidden'
//             onChange={handleFileChange}
//           />
//           <span className='ml-2 text-gray-500'>{selectedFiles.length} file(s) selected</span>
//         </div>

//         <div className='mb-4'>
//           <button onClick={handleFileUpload} className='bg-green-500 text-white px-4 py-2 rounded mr-4'>
//             Process
//           </button>
//         </div>

//         <div className='mb-4'>
//           <button onClick={handleOutputClick} className='bg-red-500 text-white px-4 py-2 rounded'>
//             Transcribe
//           </button>
//         </div>

//         <div className='mb-4'>
//           <button onClick={handleSentimentClick} className='bg-purple-500 text-white px-4 py-2 rounded'>
//             Sentiment
//           </button>
//         </div>

//         <div className='mb-4'>
//           <button onClick={handleClickPronunciation} className='bg-orange-500 text-white px-4 py-2 rounded'>
//             Pronunciation Assessment
//           </button>
//         </div>

//         <div className='mb-4'>
//           <button onClick={handleSummaryClick} className='bg-orange-500 text-white px-4 py-2 rounded'>
//             Summary
//           </button>
//         </div>
//       </div>

//       <div className='flex flex-row gap-4'>
//         <div className='grid grid-cols-2 gap-4 mt-4 mb-4 container shadow-2xl shadow-slate-500 h-[70vh] overflow-y-auto'>
//           {currentFiles.map((file, index) => (
//             <React.Fragment key={index}>
//               <div className='border border-gray-300 px-4 py-2 mb-1 hover:bg-white hover:shadow-md transition transform hover:-translate-y-1 flex flex-col'>
//                 {indexOfFirstFile + index + 1}. {file.name}
//                 {processingStatus[file.name] === 'loading' && <FaSpinner className='animate-spin ml-96 ' />}
//                 {processingStatus[file.name] === 'done' && <FaCheck className='text-green-500 ml-96 ' />}
//                 {processingStatus[file.name] === 'error' && <span className='ml-96 text-red-500'>Error</span>}
//               </div>
//               <div className='border border-gray-300 px-4 py-2 mb-1 hover:bg-white hover:shadow-md '>
//                 {viewMode === 'transcription' ? (
//                   transcriptions[file.name]?.transcription || '[No transcription available yet]'
//                 ) : viewMode === 'sentiment' ? (
//                   transcriptions[file.name]?.sentiment && transcriptions[file.name]?.confidenceScores ? (
//                     <div className='h-full flex flex-col items-center'>
//                       <p>Sentiment: {transcriptions[file.name].sentiment}</p>
//                       <p>Confidence Scores: Positive - {transcriptions[file.name].confidenceScores.positive}, Neutral - {transcriptions[file.name].confidenceScores.neutral}, Negative - {transcriptions[file.name].confidenceScores.negative}</p>
//                     </div>
//                   ) : (
//                     '[No sentiment data available yet]'
//                   )
//                 ) : viewMode === 'PronunciationAssessment' ? (
//                   transcriptions[file.name]?.pronunciationAssessment ? (
//                     <div className='text-center flex gap-5 items-center h-full '>
//                       <p className=''> <strong className='text-blue-600'>accuracyScore </strong> {transcriptions[file.name].pronunciationAssessment.accuracyScore}</p>
//                       <p > <strong className='text-blue-600'>fluencyScore</strong> {transcriptions[file.name].pronunciationAssessment.fluencyScore}</p>
//                       <p> <strong className='text-blue-600'>compScore</strong> {transcriptions[file.name].pronunciationAssessment.compScore}</p>
//                       <p> <strong className='text-blue-600'>prosodyScore</strong> {transcriptions[file.name].pronunciationAssessment.prosodyScore}</p>
//                       <p> <strong className='text-blue-600'>pronScore </strong> {transcriptions[file.name].pronunciationAssessment.pronScore}</p>                      
//                     </div>
//                   ) : (
//                     '[No pronunciation available yet]'
//                   )
//                 ) : viewMode === 'summary' ? (
//                   <div>
//                     <p><strong>Extract Summary:</strong> {transcriptions[file.name]?.extractSummary || '[No extract summary available]'}</p>
//                     <p><strong>Abstract Summary:</strong> {transcriptions[file.name]?.abstractSummary || '[No abstract summary available]'}</p>
//                   </div>
//                 ) : null}
//               </div>
//             </React.Fragment>
//           ))}
//         </div>
//       </div>

//       {selectedFiles.length > filesPerPage && (
//         <div className='flex justify-center mt-4'>
//           {pageNumbers.map((number) => (
//             <button
//               key={number}
//               onClick={() => handleClick(number)}
//               className={`px-4 py-2 mx-1 border border-gray-300 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
//             >
//               {number}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Text;


import React, { useState } from 'react';
import { FaSpinner, FaCheck } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import logo from '././../../../../metronics_v8.2.0-main/src/Asset/playbook/Call center image.png'


const BASE_URL = process.env.REACT_APP_API_URL;

const Text = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transcriptions, setTranscriptions] = useState({});
  const [processingStatus, setProcessingStatus] = useState({});
  const [viewMode, setViewMode] = useState('transcription'); // 'transcription' or 'sentiment'
  const filesPerPage = 10;

  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setSelectedFiles(filesArray);
  };

  const handleFileUpload = async () => {
    const results = {};
    const statusUpdates = {};

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('audioFile', file);
      statusUpdates[file.name] = 'loading';
      setProcessingStatus({ ...statusUpdates });

      try {
        const response = await fetch(`${BASE_URL}/startRecognition`, {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        console.log('result:', result);

        if (result.results && result.results.length > 0) {
          const fileData = result.results[0];
          console.log('fileData:', fileData);

          results[fileData.fileName] = fileData;
          statusUpdates[fileData.fileName] = 'done';
        }

      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        statusUpdates[file.name] = 'error';
      }


      setProcessingStatus({ ...statusUpdates });
    }

    setTranscriptions(results);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    alert('Process completed!');
  };

  const handleOutputClick = () => {
    const allProcessed = selectedFiles.every(file => processingStatus[file.name] === 'done');

    if (allProcessed) {
      setViewMode('transcription'); // Show transcriptions when Output button is clicked
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      alert('Processing not completed yet. Please wait until all files are processed.');
    }


  };


  const handleSentimentClick = () => {
    try {
      setViewMode('sentiment'); // Switch to sentiment view 
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      alert('sentiment data not available');
    }

  };


  const handleClickProununciation = () => {
    const allProcessed = selectedFiles.every(file => processingStatus[file.name] === 'done');
    if (allProcessed) {
      setViewMode('PronunciationAssessment')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      alert('Processing not completed yet.please wait untill all files are processed.')
    }
  }

  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = selectedFiles.slice(indexOfFirstFile, indexOfLastFile);

  const handleClick = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(selectedFiles.length / filesPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className='p-4 bg-white'>
      <div className='flex justify-around items-center'>
        <div className='mb-4'>
          <label htmlFor='file-input' className='bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:[background:linear-gradient(45deg,#9369c7,theme(colors.blue.500)_50%,#c9bdd9)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.200/.48)_80%,_theme(colors.pink.500)_86%,_theme(colors.pink.300)_90%,_theme(colors.pink.500)_94%,_theme(colors.red.200/.48))_border-box]
           border-2 border-transparent animate-border'>
            Select Files
          </label>
          <input
            id="file-input"
            type="file"
            accept=".wav"
            multiple
            className='hidden'
            onChange={handleFileChange}
          />
          <span className='ml-2 text-gray-500'>{selectedFiles.length} file(s) selected</span>
        </div>

        <div className='mb-4'>
          <button onClick={handleFileUpload} className='bg-green-500 text-white px-4 py-2 rounded mr-4 hover:[background:linear-gradient(45deg,#9369c7,theme(colors.green.500)_50%,#c9bdd9)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.200/.48)_80%,_theme(colors.red.500)_86%,_theme(colors.red.300)_90%,_theme(colors.red.500)_95%,_theme(colors.yellow.200/.48))_border-box]
           border-2 border-transparent animate-border '>
            Process
          </button>
        </div>

        <div className='mb-4 '>
          <button onClick={handleOutputClick} className='bg-red-500 text-white px-4 py-2 rounded 
          hover:[background:linear-gradient(45deg,#9369c7,theme(colors.red.500)_50%,#c9bdd9)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.200/.48)_80%,_theme(colors.blue.500)_86%,_theme(colors.blue.300)_90%,_theme(colors.blue.500)_94%,_theme(colors.red.200/.48))_border-box]
           border-2 border-transparent animate-border'>
            Transcribe
          </button>
        </div>

        <div className='mb-4'>
          <button onClick={handleSentimentClick} className='bg-purple-500 text-white px-4 py-2 rounded hover:[background:linear-gradient(45deg,#7fb9e3,theme(colors.purple.500)_50%,#99e8a0)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.200/.48)_80%,_theme(colors.pink.500)_86%,_theme(colors.pink.300)_90%,_theme(colors.pink.500)_94%,_theme(colors.red.200/.48))_border-box]
           border-2 border-transparent animate-border'>
            Sentiment
          </button>
        </div>

        <div className='mb-4'>
          <button onClick={handleClickProununciation} className='bg-orange-500 text-white px-4 py-2 rounded hover:[background:linear-gradient(45deg,#7fb9e3,theme(colors.purple.500)_50%,#99e8a0)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.200/.48)_80%,_theme(colors.pink.500)_86%,_theme(colors.pink.300)_90%,_theme(colors.pink.500)_94%,_theme(colors.red.200/.48))_border-box]
           border-2 border-transparent animate-border'>
            pronunciationAssessment
          </button>
        </div>
        <div className='mb-4'>
          <button onClick={''} className='bg-orange-500 text-white px-4 py-2 rounded hover:[background:linear-gradient(45deg,#7fb9e3,theme(colors.purple.500)_50%,#99e8a0)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.yellow.200/.48)_80%,_theme(colors.pink.500)_86%,_theme(colors.pink.300)_90%,_theme(colors.pink.500)_94%,_theme(colors.red.200/.48))_border-box]
           border-2 border-transparent animate-border'>
            summary
          </button>
        </div>
      </div>

      <div className='flex flex-row gap-4 container'>

        <div className='grid grid-cols-2 gap-4 mt-4 mb-4 container shadow-2xl shadow-slate-500 h-[70vh] overflow-y-auto'>
          {selectedFiles.length === 0 && (
            <div className="flex justify-center items-center h-full w-full ml-96 sm:ml-40 md:ml-56">
              <img
                className="max-w-[100%] max-h-[100%] object-contain opacity-50 transition-opacity duration-500 hover:opacity-100"
                src={logo}
                alt="call center logo"
              />
            </div>
          )}

          {currentFiles.map((file, index) => (
            <React.Fragment key={index}>
              <div className='border border-gray-300 px-4 py-2 mb-1 hover:bg-white hover:shadow-md transition transform hover:-translate-y-1 flex flex-col'>
                {indexOfFirstFile + index + 1}. {file.name}
                {processingStatus[file.name] === 'loading' && <FaSpinner className='animate-spin ml-96 ' />}
                {processingStatus[file.name] === 'done' && <FaCheck className='text-green-500 ml-96 ' />}
                {processingStatus[file.name] === 'error' && <span className='ml-96 text-red-500'>Error</span>}
              </div>
              <div className='border border-gray-300 px-4 py-2 mb-1 hover:bg-white hover:shadow-md '>
                {viewMode === 'transcription' ? (
                  transcriptions[file.name]?.transcription || '[No transcription available yet]'
                ) : viewMode === 'sentiment' ? (
                  transcriptions[file.name]?.sentiment && transcriptions[file.name]?.confidenceScores ? (
                    <div className='h-full flex flex-col items-center'>
                      <p>Sentiment: {transcriptions[file.name].sentiment}</p> <br />
                      <p>Confidence Scores: Positive - {transcriptions[file.name].confidenceScores.positive}, Neutral - {transcriptions[file.name].confidenceScores.neutral}, Negative - {transcriptions[file.name].confidenceScores.negative}</p>

                    </div>
                  ) : (
                    '[No sentiment data available yet]'
                  )
                ) : viewMode === 'PronunciationAssessment' ? (
                  transcriptions[file.name]?.pronunciationAssessment ? (
                    <div className='text-center flex gap-5 items-center h-full '>

                      <p className=''> <strong className='text-blue-600'>accuracyScore </strong> {transcriptions[file.name].pronunciationAssessment.accuracyScore}</p>
                      <p > <strong className='text-blue-600'>fluencyScore</strong> {transcriptions[file.name].pronunciationAssessment.fluencyScore}</p>
                      <p> <strong className='text-blue-600'>compScore</strong> {transcriptions[file.name].pronunciationAssessment.compScore}</p>
                      <p> <strong className='text-blue-600'>prosodyScore</strong> {transcriptions[file.name].pronunciationAssessment.prosodyScore}</p>
                      <p> <strong className='text-blue-600'>pronScore </strong> {transcriptions[file.name].pronunciationAssessment.pronScore}</p>
                    </div>
                  ) : (
                    '[No pronunciation available yet]'
                  )
                ) : null}

              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {selectedFiles.length > filesPerPage && (
        <div className='flex justify-center mt-4'>
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handleClick(number)}
              className={`px-4 py-2 mx-1 border border-gray-300 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Text;