const dbOperation = require("./dbFiles/dbOperation");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require("path");
const fileUpload = require('express-fileupload');
const fs = require("fs");
const https = require('https');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Import dynamically for ES module compatibility
const { AZURE_STORAGE_CONNECTION_STRING, SPEECH_API_SERVICE_REGION, SPEECH_API_SUBSCRIPTION_KEY, TRANSLATOR_TEXT_ENDPOINT, TRANSLATOR_DOCUMENT_ENDPOINT, TRANSLATOR_DOCUMENT_KEY, LANGUAGE_ENDPOINT, LANGUAGE_KEY } = require('./config/config');

const { AzureKeyCredential, TextAnalysisClient } = require("@azure/ai-language-text");
// const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const { TextAnalyticsClient } = require("@azure/ai-text-analytics");
const { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason, CancellationReason, PronunciationAssessmentConfig, PronunciationAssessmentResult, PronunciationAssessmentGradingSystem, PronunciationAssessmentGranularity } = require('microsoft-cognitiveservices-speech-sdk');
const { BlobServiceClient } = require('@azure/storage-blob');
const textAnalyticsClient = new TextAnalyticsClient(LANGUAGE_ENDPOINT, new AzureKeyCredential(LANGUAGE_KEY));
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const speechConfig = SpeechConfig.fromSubscription(SPEECH_API_SUBSCRIPTION_KEY, SPEECH_API_SERVICE_REGION);

// const { generateSummary } = require("./src/Components/Playbook/python/extact.py");

const PORT = process.env.PORT || 5000;

const multer = require("multer");
const { error } = require("console");
const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Configure multer to handle FormData
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "Uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage, dest: 'Uploads/' });

app.get("/", (req, res) => {
  res.send("HELLO, this is the root URL!!!");
});

app.post("/save_login", async (req, res) => {
  const { username, emailID, password } = req.body;
  try {
    console.log("Received login: ", req.body);
    console.log("username: ", username);
    console.log("emailID: ", emailID);
    console.log("password: ", password);
    await dbOperation.saveLoginCredentials(username, emailID, password);
    res.status(200).json({ message: "User is successfully registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Failed to register" });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, passwordHash } = req.body;
  console.log('Received email:', email);
  console.log('Received password:', passwordHash);
  try {
    // Check if the email already exists in the database
    const existingUser = await dbOperation.getUserByEmail(email);
    if (existingUser) {
      // If the email already exists, send an error response
      return res.status(400).json({ error: 'Email already exists' });
    }
    // If the email doesn't exist, proceed with user registration
    await dbOperation.registerUser(username, email, passwordHash);
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// app.post('/login', async (req, res) => {
//   const { email, passwordHash } = req.body;
//   try {
//     const isAuthenticated = await dbOperation.loginUser(email, passwordHash);
//     if (isAuthenticated) {
//       res.status(200).json({ message: 'Login successful' });
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'Failed to login user' });
//   }
// });

app.post('/login', async (req, res) => {
  const { email, passwordHash } = req.body;
  try {
    const { isAuthenticated, userName } = await dbOperation.loginUser(email, passwordHash);
    if (isAuthenticated) {
      res.status(200).json({ message: 'Login successful', userName });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to login user' });
  }
});

app.get('/gettablename', async (req, res) => {
  try {
    const Tablename = await dbOperation.getTablenames();
    res.json(Tablename.recordset);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error for Tablename' });
  }
});

app.post('/tablenamecategories', async (req, res) => {
  const { tableName } = req.body;
  console.log("Received POST request with tableName:", tableName); // Log to see if you received the table name correctly
  try {
    console.log("Fetching categories for tableName:", tableName); // Log to see if you're attempting to fetch categories
    const categories = await dbOperation.getCategoriesForTable(tableName);
    console.log("Fetched categories:", categories); // Log the fetched categories
    res.json({ categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/insertData', upload.none(), async (req, res) => {
  const { tableName, dataToInsert } = req.body; // Extract tableName and dataToInsert from the request body
  console.log("Received POST request with tableName:", req.body); // Log to see if you received the table name correctly
  try {
    // Assuming you have a function to insert data into your database
    await dbOperation.insertData(tableName, dataToInsert); // Provide both tableName and dataToInsert

    res.json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/updateData', upload.none(), async (req, res) => {
  const { tableName, dataToUpdate } = req.body; // Extract tableName and dataToInsert from the request body
  console.log("Received POST request with tableName:", req.body); // Log to see if you received the table name correctly
  try {
    // Assuming you have a function to insert data into your database
    await dbOperation.UpdateData(tableName, dataToUpdate); // Provide both tableName and dataToInsert

    res.json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tablecategorieswithvalue', async (req, res) => {
  const { tableName } = req.body;
  console.log("Received POST request with tableName:", tableName); // Log to see if you received the table name correctly
  try {
    console.log("Fetching rowvalues for tableName:", tableName); // Log to see if you're attempting to fetch categories
    const rowvalues = await dbOperation.getTablenameswithvalue(tableName);
    console.log("Fetched rowvalues:", rowvalues); // Log the fetched rowvalues
    res.json(rowvalues);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// playbook
// Audio to text transcription function
const transcribeAudioFile = async (fileContent) => {
  // console.log('fileContent', fileContent);
  try {
    const subscriptionKey = SPEECH_API_SUBSCRIPTION_KEY;
    const serviceRegion = SPEECH_API_SERVICE_REGION;

    const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    speechConfig.speechRecognitionLanguage = 'en-US';

    const audioConfig = AudioConfig.fromWavFileInput(fileContent);
    // console.log('audioConfig:', audioConfig);
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      let recognizedText = ''; // To accumulate recognized text

      recognizer.recognized = (s, e) => {
        if (e.result && e.result.reason === ResultReason.RecognizedSpeech) {
          recognizedText += e.result.text + ' ';
          // console.log('e.result.text:', e.result.text);
        }
      };

      recognizer.canceled = (s, e) => {
        if (e.reason === CancellationReason.Error) {
          reject(new Error(`Speech Recognition error: ${e.errorDetails}`));
        } else if (e.reason === CancellationReason.EndOfStream && recognizedText.trim() !== '') {
          // Resolve the promise if recognized text is accumulated
          resolve(recognizedText.trim());
        } else {
          reject(new Error(`Speech Recognition canceled: ${e.reason}`));
        }
      };

      recognizer.startContinuousRecognitionAsync();

      recognizer.sessionStopped = async (s, e) => {
        recognizer.close();
        // Resolve the promise if recognized text is accumulated
        if (recognizedText.trim() !== '') {
          resolve(recognizedText.trim());
        } else {
          reject(new Error(`Speech Recognition session stopped without recognized speech`));
        }
      };


    });
  } catch (error) {
    console.error('Error in transcription:', error);
    throw new Error(`Error in transcription: ${error}`);
  }
};

// multiple file transcription in speech to text
// const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
// app.post("/startRecognition", async (req, res) => {

//   let audioFiles = req.files.audioFile;
//   // Check if audioFiles is not an array (single file upload scenario)
//   if (!Array.isArray(audioFiles)) {
//     audioFiles = [audioFiles]; // Convert to array for consistent handling
//   }
//   if (!audioFiles || audioFiles.length === 0) {
//     // console.log("No audio files uploaded.");
//     return res.status(400).json({ error: "No audio files uploaded." });
//   }
//   const transcriptionResults = [];
//   // Save the audio files to Azure Blob Storage and locally
//   const containerName = 'audiofilestorage';


//   try {
//     for (const audioFile of audioFiles) {
//       const blobName = audioFile.name;
//       const uploadsPath = path.join(__dirname, 'Uploads', blobName);
//       // console.log('uploadspath:', uploadsPath);
//       const containerClient = blobServiceClient.getContainerClient(containerName);
//       const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//       const fileContent = audioFile.data;
//       const uploadPath = path.join(__dirname, 'Uploads', audioFile.name);

//       // // Save the file locally in the uploads folder
//       fs.writeFileSync(uploadPath, fileContent);
//       // console.log('Successfully Audio file saved locally in uploads folder:', uploadPath);

//       // Upload the file to Azure Blob Storage
//       await blockBlobClient.uploadFile(uploadsPath);
//       // console.log(Audio file uploaded to Blob Storage: ${blobName});

//       const transcriptionResult = await transcribeAudioFile(fileContent);
//       transcriptionResults.push({ fileName: audioFile.name, transcription: transcriptionResult });
//       // console.log('transcriptionResults:', transcriptionResults);
//     }


//     // Perform sentiment analysis on the transcribed text
//     const documents = transcriptionResults.map(result => ({ id: result.fileName, text: result.transcription }));
//     // console.log("documents", documents);
//     const sentimentAnalysisResult = await textAnalyticsClient.analyzeSentiment(documents, { includeOpinionMining: true })
//     sentimentAnalysisResult.push({ sentiment: sentimentAnalysisResult })
//     // console.log('sentimentAnalysisResult', sentimentAnalysisResult);

//     const piiresults = await textAnalyticsClient.recognizePiiEntities(documents);
//     // Extract redacted text and PII entities
//     const redactedText = piiresults[0].redactedText;
//     const piiEntities = piiresults[0].entities.map(entity => ({
//       text: entity.text,
//       category: entity.category
//     }));
//     piiresults.push({ redactedText, piiEntities })
//     console.log("piiresult:", piiresults);



//     // Combine sentiment analysis results with transcription results
//     const combinedResults = transcriptionResults.map((result, index) => ({
//       ...result,
//       sentiment: sentimentAnalysisResult[index].sentiment,
//       confidenceScores: sentimentAnalysisResult[index].confidenceScores,
//       redactedText,
//       piiEntities
//     }));
//     // console.log("combinedResults", combinedResults);

//     for (const result of combinedResults) {
//       await dbOperation.insertAudioToText(result.fileName, result.transcription, result.sentiment, result.confidenceScores);
//     }

//     res.status(200).json({ message: "Audio files uploaded and transcribed successfully", results: combinedResults });
//   } catch (error) {
//     console.error("Error handling audio files:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// Pronunciation assessment function
const pronunciationAssessmentContinuousWithFile = (fileContent, referenceText) => {
  const audioConfig = AudioConfig.fromWavFileInput(fileContent);
  const speechConfig = SpeechConfig.fromSubscription(SPEECH_API_SUBSCRIPTION_KEY, SPEECH_API_SERVICE_REGION);

  const pronunciationAssessmentConfig = new PronunciationAssessmentConfig(
    referenceText,
    PronunciationAssessmentGradingSystem.HundredMark,
    PronunciationAssessmentGranularity.Phoneme,
    true
  );
  pronunciationAssessmentConfig.enableProsodyAssessment = true;

  const language = "en-US";
  speechConfig.speechRecognitionLanguage = language;

  const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
  pronunciationAssessmentConfig.applyTo(recognizer);

  let result = {
    accuracyScore: 0,
    fluencyScore: 0,
    compScore: 0,
    prosodyScore: 0,
    pronScore: 0
  };

  recognizer.recognizing = function (s, e) {
    // console.log("(recognizing) Reason: " + ResultReason[e.result.reason] + " Text: " + e.result.text);
  };

  recognizer.recognized = function (s, e) {
    const pronunciationResult = PronunciationAssessmentResult.fromResult(e.result);
    // console.log(" Accuracy score: ", pronunciationResult.accuracyScore, '\n',
    //   "pronunciation score: ", pronunciationResult.pronunciationScore, '\n',
    //   "completeness score : ", pronunciationResult.completenessScore, '\n',
    //   "fluency score: ", pronunciationResult.fluencyScore
    // );

    result.accuracyScore = pronunciationResult.accuracyScore;
    result.fluencyScore = pronunciationResult.fluencyScore;
    result.compScore = pronunciationResult.completenessScore;
    result.prosodyScore = pronunciationResult.prosodyScore;
    result.pronScore = pronunciationResult.pronunciationScore;
  };

  recognizer.canceled = function (s, e) {
    if (e.reason === CancellationReason.Error) {
      console.log("(cancel) Reason: " + CancellationReason[e.reason] + ": " + e.errorDetails);
    }
    recognizer.stopContinuousRecognitionAsync();
  };

  recognizer.sessionStarted = function (s, e) { };
  recognizer.sessionStopped = function (s, e) {
    recognizer.stopContinuousRecognitionAsync();
    recognizer.close();
  };

  recognizer.startContinuousRecognitionAsync();

  return new Promise((resolve, reject) => {
    recognizer.sessionStopped = function (s, e) {
      recognizer.stopContinuousRecognitionAsync();
      recognizer.close();
      resolve(result);
    };
  });
};

// Audio transcription and pronunciation assessment
app.post("/startRecognition", async (req, res) => {
  let audioFiles = req.files.audioFile;
  console.log('received audio files',audioFiles);
  

  if (!Array.isArray(audioFiles)) {
    audioFiles = [audioFiles];
  }
  if (!audioFiles || audioFiles.length === 0) {
    return res.status(400).json({ error: "No audio files uploaded." });
  }
  const transcriptionResults = [];
  const pronunciationResults = [];
  const containerName = 'audiofilestorage';

  try {
    for (const audioFile of audioFiles) {
      const blobName = audioFile.name;
      const uploadsPath = path.join(__dirname, 'Uploads', blobName);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const fileContent = audioFile.data;
      fs.writeFileSync(uploadsPath, fileContent);

      await blockBlobClient.uploadFile(uploadsPath);

      const transcriptionResult = await transcribeAudioFile(fileContent);
      transcriptionResults.push({ fileName: audioFile.name, transcription: transcriptionResult });

      const pronunciationResult = await pronunciationAssessmentContinuousWithFile(fileContent, "It took me a long time to learn where he came from. The little prince, who asked me so many questions, never seemed to hear the ones I asked him. It was from words dropped by chance that, little by little, everything was revealed to me.");
      pronunciationResults.push({ fileName: audioFile.name, pronunciationAssessment: pronunciationResult });
    }

    const documents = transcriptionResults.map(result => ({ id: result.fileName, text: result.transcription }));
    const sentimentAnalysisResult = await textAnalyticsClient.analyzeSentiment(documents, { includeOpinionMining: true });
    sentimentAnalysisResult.push({ sentiment: sentimentAnalysisResult })

    const piiresults = await textAnalyticsClient.recognizePiiEntities(documents);
    const redactedText = piiresults[0].redactedText;
    const piiEntities = piiresults[0].entities.map(entity => ({
      text: entity.text,
      category: entity.category
    }));
    piiresults.push({ redactedText, piiEntities })

    const combinedResults = transcriptionResults.map((result, index) => ({
      ...result,
      sentiment: sentimentAnalysisResult[index].sentiment,
      confidenceScores: sentimentAnalysisResult[index].confidenceScores,
      redactedText,
      piiEntities,
      pronunciationAssessment: pronunciationResults[index]?.pronunciationAssessment
    }));
    console.log('combinedResults:', combinedResults);

    for (const result of combinedResults) {
            await dbOperation.insertAudioToText(result.fileName, result.transcription, result.sentiment, result.confidenceScores);
          }

          res.status(200).json({ message: "Audio files uploaded and transcribed successfully", results: combinedResults });
  } catch (error) {
    console.error('Error during recognition:', error);
    res.status(500).json({ error: 'Error during recognition' });
  }
});


// Fetch supported languages from azure
app.get('/languages', async (req, res) => {
  try {
    const response = await fetch(`${TRANSLATOR_TEXT_ENDPOINT}/languages?api-version=3.0`, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': TRANSLATOR_DOCUMENT_KEY,
        'Ocp-Apim-Subscription-Region': SPEECH_API_SERVICE_REGION,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch supported languages: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const languages = data.translation;

    const languageArray = Object.keys(languages).map(code => ({
      code,
      name: languages[code].name,
    }));
    res.status(200).json({ languages: languageArray });
  } catch (error) {
    console.error('Error fetching supported languages:', error);

    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add new route for Document translation
async function translateText(text, targetLanguages, TRANSLATOR_DOCUMENT_KEY, TRANSLATOR_TEXT_ENDPOINT) {
  try {
    const translationResults = [];

    for (const targetLanguage of targetLanguages) {
      const params = new URLSearchParams({
        'api-version': '3.0',
        'to': targetLanguage
      });

      const url = `${TRANSLATOR_TEXT_ENDPOINT}/translate?${params.toString()}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': TRANSLATOR_DOCUMENT_KEY,
          'Ocp-Apim-Subscription-Region': 'eastus'
        },
        body: JSON.stringify([{ text }])
      });

      if (!response.ok) {
        throw new Error(`Failed to translate text to ${targetLanguage}: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      translationResults.push({
        language: targetLanguage,
        translation: result[0].translations[0].text
      });
    }

    return translationResults;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

app.post('/translate', async (req, res) => {
  console.log('Received POST request to /translate');

  // Extract text and targetLanguages from request body
  const { text, targetLanguages } = req.body;

  if (!text || !targetLanguages || targetLanguages.length === 0) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    // Call the translateText function to handle translation

    const translationResults = await translateText(text, targetLanguages, TRANSLATOR_DOCUMENT_KEY, TRANSLATOR_TEXT_ENDPOINT);
    console.log("translationResults", translationResults);
    res.json({ translationResults });
  } catch (error) {
    console.error('Error in /translate endpoint:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// // Function to summarize text
// const summarizeText = async (text) => {
//   try {
//     const summarizeResult = await textAnalyticsClient.summarize([{
//       id: "1",
//       language: "en",
//       text: text,
//       maxLength: 150 // Maximum length of summary in characters
//     }]);

//     if (summarizeResult && summarizeResult.length > 0 && summarizeResult[0].sentences) {
//       return {
//         abstract_summary: summarizeResult[0].sentences.map(sentence => sentence.text).join(' '),
//         extract_summary: text // You can modify this to suit your specific extract needs
//       };
//     } else {
//       return {
//         abstract_summary: "No summary available",
//         extract_summary: text
//       };
//     }
//   } catch (error) {
//     console.error("Error summarizing text:", error);
//     throw new Error("Failed to summarize text");
//   }
// };

// // Middleware to parse JSON bodies
// app.use(bodyParser.json());
// app.post('/api/speech-to-text', async (req, res) => {
//   const { speechText } = req.body;
//   console.log('Real time speech text:', speechText);

//   try {
//     await dbOperation.insertSpeechText(speechText);
//     res.status(200).json({ success: true, message: 'Speech text saved successfully' });
//   } catch (error) {
//     console.error('Error saving speech text:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });

async function performSummarization(text) {
  console.log("== Extractive Summarization Sample ==");

  const client = new TextAnalysisClient(LANGUAGE_ENDPOINT, new AzureKeyCredential(LANGUAGE_KEY));
  const actions = [
    {
      kind: "ExtractiveSummarization",
      maxSentenceCount: 2,
    },
  ];
  const poller = await client.beginAnalyzeBatch(actions, [text], "en");

  const results = await poller.pollUntilDone();

  let summaries = [];
  for await (const actionResult of results) {
    if (actionResult.kind === "ExtractiveSummarization") {
      for (const result of actionResult.results) {
        if (!result.error) {
          summaries.push(result.sentences.map((sentence) => sentence.text).join("\n"));
        }
      }
    }
  }

  return summaries;
}
// Endpoint to receive text from client and trigger summarization
app.post('/summarize', async (req, res) => {
  const { speechText } = req.body;

  try {
    const summaries = await performSummarization(speechText);
    console.log("summaries:", summaries);
    res.status(200).json({ summaries });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Error occurred during summarization.' });
  }
});
// text to speech
app.post('/text-to-speech', async (req, res) => {
  const { text } = req.body;
  console.log("Received text:", text);

  try {
    // Perform sentiment analysis using Azure Text Analytics
    const sentimentResult = await textAnalyticsClient.analyzeSentiment([text]);

    // Extract the sentiment result
    const sentimentScore = sentimentResult[0].confidenceScores;
    const sentiment = sentimentResult[0].sentiment;

    const results = await textAnalyticsClient.recognizePiiEntities([text]);
    // Extract redacted text and PII entities
    const redactedText = results[0].redactedText;
    const piiEntities = results[0].entities.map(entity => ({
      text: entity.text,
      category: entity.category
    }));

    // Set up the speech synthesis configuration
    const speechConfig = SpeechConfig.fromSubscription(SPEECH_API_SUBSCRIPTION_KEY, SPEECH_API_SERVICE_REGION);
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    const synthesizer = new SpeechSynthesizer(speechConfig);

    // Convert text to speech
    synthesizer.speakTextAsync(text, result => {
      if (result) {
        const audioData = result.audioData;
        const audioBuffer = Buffer.from(audioData).toString('base64'); // Convert audio data to base64

        res.status(200).json({
          sentiment,
          confidenceScores: sentimentScore,
          redactedText,
          piiEntities,
          audioData: audioBuffer // Send the base64-encoded audio data

        });
        console.log('Text-to-speech successful');
      } else {
        res.status(500).send('Error synthesizing speech');
      }
    }, error => {
      console.error(error);
      res.status(500).send('Error synthesizing speech');
    });

    console.log('Sentiment analysis result:', sentimentScore);
    console.log('PII information result:', piiEntities);


  } catch (error) {
    console.error('Error during text-to-speech:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Route for PII recognition
app.post('/recognize-pii', async (req, res) => {
  const inputText = req.body.text;

  try {
    // Perform PII recognition
    const results = await textAnalyticsClient.recognizePiiEntities([inputText]);

    // Extract redacted text and PII entities
    const redactedText = results[0].redactedText;
    const piiEntities = results[0].entities.map(entity => ({
      text: entity.text,
      category: entity.category
    }));

    // Send the result back to the client
    res.json({ redactedText, piiEntities });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing PII recognition');
  }
});
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.post('/api/speech-to-text', async (req, res) => {
  const { speechText } = req.body;
  console.log('Real time speech text:', speechText);

  try {
    await dbOperation.insertSpeechText(speechText);
    // Summarize the received speech text
    const summary = await summarizeText(speechText);
    console.log('summary', summary);
    res.status(200).json({ success: true, message: 'Speech text saved and summarized successfully', summary });
  } catch (error) {
    console.error('Error saving and summarizing speech text:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
// for python backend
// Define a route to handle sentiment analysis
app.post("/analyze-sentiment", async (req, res) => {
  try {
    const { documents } = req.body;

    // Analyze sentiment of the provided documents
    const result = await textAnalyticsClient.analyzeSentiment(documents, { includeOpinionMining: true });
    console.log("sentiment anaysys result:", result);
    // Send the analyzed sentiment result to the client side

    // Insert sentiment analysis result into the database
    // await dbOperation.insertSentimentAnalysisResult(result);

    res.json(result);
    console.log("result:", result);
  } catch (error) {

    console.error("Error analyzing sentiment:", error);
    console.log("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Internal server error" });

  }
});
// Route for processing multiple files for PII recognition
// Function to upload file to Azure Blob Storage
async function uploadToBlobStorage(fileName, fileData) {
  console.log("filename", fileName);
  console.log("filedata", fileData);
  const containerName = "audiofilestorage"; // Specify your container name
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  const uploadResponse = await blockBlobClient.upload(fileData, fileData.length);
  console.log(`File ${fileName} uploaded to Azure Blob Storage.`);
}
app.post('/process-files-pii', async (req, res) => {
  let files = req.files.files; // Uploaded files
  console.log("files", files);

  // Check if audioFiles is not an array (single file upload scenario)
  if (!Array.isArray(files)) {
    files = [files]; // Convert to array for consistent handling
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const results = [];
  try {
    // Process each file for PII recognition
    for (const file of files) {
      const inputText = file.data.toString('utf8');
      const recognitionResult = await textAnalyticsClient.recognizePiiEntities([inputText]);

      if (!recognitionResult || recognitionResult.length === 0) {
        throw new Error('No PII entities found');
      }

      const redactedText = recognitionResult[0].redactedText;
      const piiEntities = recognitionResult[0].entities.map(entity => ({
        text: entity.text,
        category: entity.category
      }));
      console.log("piiEntities", piiEntities);
      results.push({ fileName: file.name, redactedText, piiEntities });

      // Prepare processed data in a readable format
      const processedData = `File Name: ${file.name}\nRedacted Text: ${redactedText}\nPII Entities:\n${piiEntities.map(entity => `- Text: ${entity.text}, Category: ${entity.category}`).join('\n')}`;

      // Save the processed PII results to a file
      fs.writeFileSync(path.join(__dirname, "Uploads", file.name), processedData);

      // Upload the processed PII results to Azure Blob Storage
      await uploadToBlobStorage(file.name, processedData);
    }

    // Send aggregated results back to the client
    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing files for PII');
  }
});
// Route for speech to text
// Add this route to your server.js
app.post('/api/save-summary', async (req, res) => {
  const { textContent, abstractSummary, extractSummary } = req.body;

  // Process the received data as needed, e.g., save to a database
  // For demonstration purposes, I'll just log the received data
  console.log('Received data:');
  console.log('Received textContent:', textContent);
  console.log('Abstract Summary:', abstractSummary);
  console.log('Extract Summary:', extractSummary);

  try {
    // Insert data into the database
    await dbOperation.insertSummaryData(textContent, extractSummary, abstractSummary);

    // Respond to the client
    res.status(200).json({ message: 'Summary data received and processed successfully.' });
  } catch (error) {
    console.error('Error saving summary data:', error);
    res.status(500).json({ error: 'An error occurred while saving summary data.' });
  }
});

// --------------------------------- PORT ---------------
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

