// import React, { useState } from 'react';
// // const { AzureKeyCredential, TextAnalysisClient } = require("@azure/ai-language-text");

// // const endpoint = "https://cssshahullanguagedemo.cognitiveservices.azure.com/";
// // const apiKey = "74614b66e5874aa9a79cda5e6e0e04a7";
// const SumInformation = () => {
//   const [inputText, setInputText] = useState('');
//   const [summary, setSummary] = useState('');

//   const handleGenerateSummary = async () => {
//     const response = await fetch('http://10.176.67.104:5000/api/generate-summary', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ text_document: inputText }),
//     });

//     if (response.ok) {
//       const result = await response.json();
//       setSummary(result);
//     } else {
//       console.error('Failed to generate summary');
//     }
//   };

//   return (
//     <div>
//       <textarea
//         rows="5"
//         cols="50"
//         placeholder="Enter your text here..."
//         value={inputText}
//         onChange={(e) => setInputText(e.target.value)}
//       />
//       <br />
//       <button onClick={handleGenerateSummary}>Generate Summary</button>
//       <div>
//         <strong>Abstract Summary:</strong> {summary.abstract_summary}
//       </div>
//       <div>
//         <strong>Extract Summary:</strong> {summary.extract_summary}
//       </div>
//     </div>
//   );
// }
// export default SumInformation;

import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { AzureKeyCredential } from '@azure/core-auth';
import { TextAnalyticsClient } from '@azure/ai-text-analytics';

const SumInformation = () => {
  const [textDocument, setTextDocument] = useState('');
  const [abstractiveSummary, setAbstractiveSummary] = useState('');
  const [extractiveSummary, setExtractiveSummary] = useState('');

  const textAnalyticsEndpoint = "https://cssshahullanguagedemo.cognitiveservices.azure.com/";
  const textAnalyticsKey = "74614b66e5874aa9a79cda5e6e0e04a7";

  const textAnalyticsClient = new TextAnalyticsClient(
    textAnalyticsEndpoint,
    new AzureKeyCredential(textAnalyticsKey)
  );

  const generateSummary = async () => {
    const document = [textDocument];

    try {
      const pollerAbstract = textAnalyticsClient.beginAbstractSummary(document);
      const abstractSummaryResults = await pollerAbstract.pollUntilDone();

      for (const result of abstractSummaryResults) {
        if (result.kind === "AbstractiveSummarization") {
          setAbstractiveSummary(result.summaries.map(summary => summary.text).join(' '));
        } else if (result.isError) {
          console.error(`Error with code '${result.error.code}' and message '${result.error.message}'`);
        }
      }

      const pollerExtract = textAnalyticsClient.beginExtractSummary(document);
      const extractSummaryResults = await pollerExtract.pollUntilDone();

      for (const result of extractSummaryResults) {
        if (result.kind === "ExtractiveSummarization") {
          const lstSentences = result.sentences.map(sentence => sentence.text);
          setExtractiveSummary(lstSentences.join('\n'));
        } else if (result.isError) {
          console.error(`Error with code '${result.error.code}' and message '${result.error.message}'`);
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <textarea
            className="form-control mb-3"
            rows={10}
            placeholder="Enter your text document here..."
            value={textDocument}
            onChange={(e) => setTextDocument(e.target.value)}
          />
          <button className="btn btn-primary mb-3" onClick={generateSummary}>Generate Summary</button>
          <div>
            <h3>Abstractive Summary:</h3>
            <p>{abstractiveSummary}</p>
          </div>
          <div>
            <h3>Extractive Summary:</h3>
            <p>{extractiveSummary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SumInformation;

// import React, { useState } from 'react';
// import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// const SumInformation = () => {
//   const [inputText, setInputText] = useState('');
//   const [summary, setSummary] = useState('');
//   const [error, setError] = useState('');

//   const apiKey = '74614b66e5874aa9a79cda5e6e0e04a7';
//   const endpoint = 'https://cssshahullanguagedemo.cognitiveservices.azure.com/';
//   const region = 'eastus';

//   const analyzeText = async () => {
//     try {
//       const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
  
//       const document = [{ id: '1', language: 'en', text: inputText }]; // Provide language in the document object
//       const keyPhrasesResult = await textAnalyticsClient.extractKeyPhrases(document);
  
//       const extractedSummary = keyPhrasesResult[0]?.keyPhrases?.join(', ') || '';
//       setSummary(extractedSummary);
//       setError('');
//     } catch (error) {
//       console.error('Error:', error);
//       setSummary('');
//       setError('Error analyzing text. Please try again.');
//     }
//   };
  

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-lg-8 offset-lg-2">
//           <textarea
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             className="form-control mb-3"
//             placeholder="Enter text for summarization..."
//             rows={5}
//           />
//           <button onClick={analyzeText} className="btn btn-primary mb-3">Analyze and Summarize</button>
//           {summary && (
//             <div>
//               <h3>Summary:</h3>
//               <p>{summary}</p>
//             </div>
//           )}
//           {error && <p style={{ color: 'red' }}>{error}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SumInformation;





// import React, { useState } from 'react';
// import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics';
// // import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// const SumInformation = () => {
//   const [inputText, setInputText] = useState('');
//   const [summary, setSummary] = useState('');
//   const [error, setError] = useState('');

//   const apiKey = '74614b66e5874aa9a79cda5e6e0e04a7';
//   const endpoint = 'https://cssshahullanguagedemo.cognitiveservices.azure.com/';
//   const region = 'eastus';

//   const analyzeText = async () => {
//     try {
//       const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
  
//       // Analyzing sentiment
//       const sentimentResult = await textAnalyticsClient.analyzeSentiment([inputText]);
//       console.log('Sentiment:', sentimentResult[0].sentiment);
  
//       // Extracting key phrases (for summarization)
//       const keyPhrasesResult = await textAnalyticsClient.extractKeyPhrases([inputText]);
//       const extractedSummary = keyPhrasesResult[0]?.keyPhrases?.join(', ') || '';
      
//       setSummary(extractedSummary);
//       setError('');
//     } catch (error) {
//       console.error('Error:', error.message);
//       setSummary('');
//       setError('Error analyzing text. Please try again.');
//     }
//   };

//   return (
//     <div className="container mt-5 vh-100" style={{ backgroundColor: '#f0f8ff', transition: 'background-color 0.5s' }}>
//       <div className="row">
//         <div className="col-lg-8 offset-lg-2">
//           <textarea
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             className="form-control mb-3 h-full"
//             placeholder="Enter text to analyze and summarize..."
//             rows={5}
//           />
//           <button onClick={analyzeText} className="btn btn-primary mb-3">Analyze and Summarize</button>
//           {summary && (
//             <div>
//               <h3>Summary:</h3>
//               <p>{summary}</p>
//             </div>
//           )}
//           {error && <p style={{ color: 'red' }}>{error}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SumInformation;
