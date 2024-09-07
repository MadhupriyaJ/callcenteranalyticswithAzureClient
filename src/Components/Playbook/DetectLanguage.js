import React, { useEffect, useState } from 'react';
import Header from '../Header/Header';
import SnowflakeAside from '../Aside/SnowflakeAside';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const DetectLanguage = () => {
    const [inputText, setInputText] = useState('');
    // Adjusting the state to reflect the actual response structure
    const [languageInfo, setLanguageInfo] = useState({ name: '', iso6391Name: '', confidence: '' });
    const [isLoading, setIsLoading] = useState(false);


    const [asideOpen, setAsideOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState("");
    const [tableHistory, setTableHistory] = useState([]);
    const [username, setUsername] = useState("");
    const location = useLocation();
    const [authenticated, setAuthenticated] = useState(true);
    const navigate = useNavigate();

    const detectLanguage = async () => {
        const documents = {
            documents: [
                { id: "1", text: inputText }
            ]
        };

        const endpoint = "https://cssshahullanguagedemo.cognitiveservices.azure.com/text/analytics/v3.0/languages";
        const apiKey = "74614b66e5874aa9a79cda5e6e0e04a7";

        setIsLoading(true);
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(documents),
        })
            .then(response => response.json())
            .then(data => {
                const firstDoc = data.documents[0];
                if (firstDoc) {
                    const detectedLanguage = firstDoc.detectedLanguage;
                    setLanguageInfo({
                        name: detectedLanguage.name,
                        iso6391Name: detectedLanguage.iso6391Name,
                        confidence: (detectedLanguage.confidenceScore * 100).toFixed(2) // Convert to percentage
                    });
                } else {
                    setLanguageInfo({ name: 'Language could not be detected.', iso6391Name: '', confidence: '' });
                }
            })
            .catch(error => {
                console.error("Error detecting language: ", error);
                setLanguageInfo({ name: 'Error in detecting language. Please try again.', iso6391Name: '', confidence: '' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        detectLanguage();
    };
    const handleBack = () => {
        const previousTable = tableHistory.pop();
        setSelectedTable(previousTable);
        setTableHistory([...tableHistory]);
      };

      const userName = location.state ? location.state.userName : localStorage.getItem("userName");

      useEffect(() => {
        setUsername(userName || "");
      }, [userName]);
    
      const handleTableSelect = (tableName) => {
        setTableHistory([...tableHistory, selectedTable]);
        setSelectedTable(tableName);
      };
    return (
        <div className='flex '>
        <div >
          <SnowflakeAside asideOpen={asideOpen}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            onTableSelect={handleTableSelect}
          />
        </div>
  
        <div className='h-22 w-full '>
          <div>
            <div className='bg-gray-100 vh-100 '>
              <div >
                <Header />
              </div>
        <div className="container mt-5">
            <h1 className="mb-4">Language Detection</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="inputText" className="form-label">Enter Text</label>
                    <textarea
                        className="form-control h-300px"
                        id="inputText"
                        rows="3"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Detecting...' : 'Detect Language'}
                </button>
            </form>
            {languageInfo.name && (
                <div className="mt-3 card container w-300px mx-auto text-center">
                    <strong>Detected Language: </strong>{languageInfo.name} ({languageInfo.iso6391Name})
                    {languageInfo.confidence && <span> - Confidence: {languageInfo.confidence}%</span>}
                </div>
            )}
        </div>

        </div>
          <Outlet />
        </div>
      </div>
    </div>
    );
};

export default DetectLanguage;
