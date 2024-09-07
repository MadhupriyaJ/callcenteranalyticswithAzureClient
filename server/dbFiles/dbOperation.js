const sql = require('mssql');
const config = require('./dbConfigSeed');
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
// const bcrypt = require('bcrypt');
// const saltRounds = 5; // Number of salt rounds for hashing (adjust as needed)



const registerUser = async (username, email, passwordHash) => {
  try {
    if (!username || username.trim() === '') {
      throw new Error('Username cannot be empty');
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Received email in dbOperation:', email);
    console.log('Received passwordHash in dbOperation:', passwordHash);
    let pool1 = await sql.connect(config);
    await pool1
      .request()
      .input('UserName', sql.NVarChar(255), username)
      .input('Email', sql.NVarChar(255), email)
      .input('PasswordHash', sql.NVarChar(64), passwordHash)
      .execute('InsertAdminandUserLogin');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to register user');
  }
};

const getUserByEmail = async (email) => {
  try {
    let pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('Email', sql.NVarChar(255), email)
      .query('SELECT * FROM Login WHERE Email = @Email');
    return result.recordset[0];
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch user by email');
  }
};

// const loginUser = async (email, passwordHash) => {
//   try {
//     let pool = await sql.connect(config);
//     const result = await pool
//       .request()
//       .input("Email", sql.NVarChar(255), email)
//       .input("PasswordHash", sql.NVarChar(64), passwordHash)
//       .query("SELECT COUNT(*) AS UserCount FROM AdminandUserLogin WHERE Email = @Email AND PasswordHash = @PasswordHash");
//     const userCount = result.recordset[0].UserCount;
//     return userCount === 1; // Return true if user exists, false otherwise
//   } catch (error) {
//     //console.log(error);
//   }
// };
const loginUser = async (email, passwordHash) => {
  try {
    let pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("Email", sql.NVarChar(255), email)
      .input("PasswordHash", sql.NVarChar(64), passwordHash)
      .query("SELECT UserName, COUNT(*) AS UserCount FROM Login WHERE Email = @Email AND PasswordHash = @PasswordHash GROUP BY UserName");
    const userCount = result.recordset.length;
    if (userCount === 1) {
      const userName = result.recordset[0].UserName;
      return { isAuthenticated: true, userName };
    } else {
      return { isAuthenticated: false, userName: null };
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getTablenames = async () => {
  try {
    let pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("SELECT TABLE_NAME FROM [Ceruleanseed].[INFORMATION_SCHEMA].[TABLES] WHERE TABLE_SCHEMA = 'dbo';");
    return result;
  } catch (error) {
    throw new Error('Failed to get Table Name');
  }
};


const getCategoriesForTable = async (tableName) => {
  try {
    // Make sure the connection is established before executing the query
    await poolConnect;

    // Use parameterized query to avoid SQL injection
    const result = await pool.request()
      .input('tableName', sql.NVarChar, tableName)
      .query(`SELECT column_name
      FROM information_schema.columns
      WHERE table_name = @tableName
      AND COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') <> 1;       
      `);

    const categories = result.recordset.map((row) => row.column_name);
    return categories;
  } catch (error) {
    console.log("Error:", error);
    throw new Error('Failed to get Categories for Table');
  }
};

const insertData = async (tableName, dataToInsert) => {
  try {
    const pool = await sql.connect(config);

    // Construct your SQL query based on the tableName and the data
    const columnNames = Object.keys(dataToInsert).join(', ');
    const values = Object.keys(dataToInsert).map((key) => `@${key}`).join(', ');
    const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${values})`;

    const inputParams = Object.entries(dataToInsert).map(([key, value]) => ({
      name: key,
      type: sql.NVarChar(255), // Change the type based on your column's data type
      value: value,
    }));

    const request = pool.request();
    inputParams.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    await request.query(query);

    console.log('Data inserted successfully');
  } catch (error) {
    console.log('Error inserting data:', error);
    throw new Error('Failed to insert data');
  }
};

const UpdateData = async (tableName, dataToUpdate) => {
  try {
    console.log('tableName:', tableName);
    console.log('dataToUpdate:', dataToUpdate);

    const pool = await sql.connect(config);

    // Construct your SQL query based on the tableName and dataToUpdate
    const setClause = Object.keys(dataToUpdate)
      .map((key) => `${key} = @${key}`)
      .join(', ');

    // Construct the WHERE clause dynamically based on matching columns and values
    const whereConditions = Object.keys(dataToUpdate)
      .map((key) => `${key} = @${key}_condition`)
      .join(' OR ');

    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereConditions}`;

    const inputParams = Object.entries(dataToUpdate).map(([key, value]) => ({
      name: key,
      type: sql.NVarChar(255), // Change the type based on your column's data type
      value: value,
    }));

    const request = pool.request();
    inputParams.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    // Duplicate the input parameters to use for the condition
    inputParams.forEach((param) => {
      request.input(`${param.name}_condition`, param.type, param.value);
    });

    await request.query(query);

    console.log('Data updated successfully');
  } catch (error) {
    console.log('Error updating data:', error);
    throw new Error('Failed to update data');
  }
};

const getTablenameswithvalue = async (tableName) => {
  try {
    console.log('Attempting to connect to the database...');
    await poolConnect;

    console.log(`Executing query for table: ${tableName}`);
    const result = await pool.request()
      .input('tableName', sql.NVarChar, tableName)
      .query(`SELECT * FROM ${tableName};`);

    console.log('Query executed successfully. Result:', result);

    if (result.recordset.length === 0) {
      console.log('No rows found.');
    }

    return result.recordset; // Return the array of rows
  } catch (error) {
    console.error('Error occurred:', error);
    throw new Error('Failed to get table rows');
  }
};

// Function to insert data into the AudioToText table
// const insertAudioToText = async (audioFilename, textContent) => {
//   try {
//       const request = pool.request();
//       const query = `INSERT INTO AudioToText (audio_filename, text_content) VALUES ('${audioFilename}', '${textContent}')`;
//       const result = await request.query(query);
//       return result;
//   } catch (error) {
//       console.error('Error inserting data into AudioToText table:', error);
//       throw error;
//   }
// };

// const insertAudioToText = async (audioFilename, textContent) => {
//   try {
//     const request = pool.request();
//     const query = 'INSERT INTO AudioToText (audio_filename, text_content) VALUES (@audioFilename, @textContent)';
//     request.input('audioFilename', sql.VarChar, audioFilename);
//     request.input('textContent', sql.VarChar, textContent);
//     // request.input('sentiment', sql.VarChar, sentiment);
//     const result = await request.query(query);
//     return result;
//   } catch (error) {
//     console.error('Error inserting data into AudioToText table:', error);
//     throw error;
//   }
// };


const insertAudioToText = async (audioFilename, textContent, sentiment, confidenceScores) => {
  try {
    const request = pool.request();
    const query = `
      INSERT INTO AudioToText (audio_filename, text_content, sentiment, confidence_positive, confidence_neutral, confidence_negative) 
      VALUES (@audioFilename, @textContent, @sentiment, @confidencePositive, @confidenceNeutral, @confidenceNegative)
    `;
    request.input('audioFilename', sql.VarChar, audioFilename);
    request.input('textContent', sql.Text, textContent);
    request.input('sentiment', sql.VarChar, sentiment);
    request.input('confidencePositive', sql.Float, confidenceScores.positive);
    request.input('confidenceNeutral', sql.Float, confidenceScores.neutral);
    request.input('confidenceNegative', sql.Float, confidenceScores.negative);
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('Error inserting data into AudioToText table:', error);
    throw error;
  }
};


const insertSpeechText = async (speechText) => {
  try {
    // Check if speechText is valid
    if (!speechText || speechText.trim() === '') {
      throw new Error('Speech text cannot be empty');
    }

    // Connect to the database
    await poolConnect;

    // Execute the query to insert speech text into the database
    const request = pool.request();
    const result = await request
      .input('SpeechText', sql.NVarChar, speechText)
      .query('INSERT INTO SpeechToText (speech_text, created_date) VALUES (@SpeechText, GETDATE())');

    return result.recordset; // Return the inserted recordset
  } catch (error) {
    console.error('Error inserting speech text:', error);
    throw new Error('Failed to insert speech text into the database');
  }
};


const insertSummaryData=async (textContent, extractSummary, abstractSummary) => {
  try {
    await poolConnect; // Wait for the database connection to be established

    const request = pool.request();

    // Bind parameters using input() method
    request.input('textContent', sql.NVarChar, textContent);
    request.input('extractSummary', sql.NVarChar, extractSummary);
    request.input('abstractSummary', sql.NVarChar, abstractSummary);

    // Insert data into the TextSummarization table
    const result = await request.query(`
      INSERT INTO TextSummarization (text_content, extract_summary, abstract_summary)
      VALUES (@textContent, @extractSummary, @abstractSummary);
    `);

    console.log('Data inserted successfully:', result);

    return result;
  } catch (error) {
    console.error('Error inserting data:', error);
    throw error;
  }
}


 const insertSentimentAnalysisResult = async(sentimentResult) => {
  try {
    await poolConnect; // Ensure that the pool is connected before proceeding
    const request = pool.request();

    // Prepare the SQL query
    const query = `
      INSERT INTO SentimentAnalysis (document_id, sentiment, positive_score, neutral_score, negative_score, sentence_text)
      VALUES (@document_id, @sentiment, @positive_score, @neutral_score, @negative_score, @sentence_text)
    `;

    // Insert sentiment analysis result into the database
    await request.input('document_id', sql.Int, sentimentResult.id); // Assuming sentimentResult.id is the document_id
    await request.input('sentiment', sql.NVarChar(10), sentimentResult.sentiment);
    
    // Check if confidenceScores is defined before accessing its properties
    if (sentimentResult.confidenceScores) {
      await request.input('positive_score', sql.Float, sentimentResult.confidenceScores.positive || 0);
      await request.input('neutral_score', sql.Float, sentimentResult.confidenceScores.neutral || 0);
      await request.input('negative_score', sql.Float, sentimentResult.confidenceScores.negative || 0);
    } else {
      // If confidenceScores is undefined, set default values
      await request.input('positive_score', sql.Float, 0);
      await request.input('neutral_score', sql.Float, 0);
      await request.input('negative_score', sql.Float, 0);
    }

    await request.input('sentence_text', sql.Text, ""); // No sentence provided, leaving it empty
    await request.query(query);
    
    console.log("Sentiment analysis result inserted successfully into the database.");
  } catch (error) {
    console.error("Error inserting sentiment analysis result:", error);
    throw error;
  }
}
// // Function to retrieve text content from the database based on audio filename
// const getTextContentByFilename = async (audioFilename) => {
//   try {
//     const request = pool.request();
//     const query = `SELECT text_content FROM AudioToText WHERE audio_filename = '${audioFilename}'`;
//     const result = await request.query(query);

//     if (result.recordset.length > 0) {
//       return result.recordset[0].text_content;
//     } else {
//       throw new Error('No matching record found in the database');
//     }
//   } catch (error) {
//     console.error('Error retrieving text content from AudioToText table:', error);
//     throw error;
//   }
// };


module.exports = {
  sql,
  registerUser,
  getUserByEmail,
  loginUser,
  getTablenames,
  getCategoriesForTable,
  insertData,
  UpdateData,
  getTablenameswithvalue,
  insertAudioToText,
  insertSpeechText,
  insertSummaryData,
  insertSentimentAnalysisResult,

  // getTextContentByFilename

};

