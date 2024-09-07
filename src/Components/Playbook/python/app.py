# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import subprocess

# app = Flask(__name__)
# CORS(app)

# def run_python_code():
#     try:
#         print("Function is called")
#         result = subprocess.check_output(['python', 'hw.py'], text=True)
#         return jsonify({'result': result})
#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({'error': str(e)})

# @app.route('/run_python_code', methods=['GET', 'POST'])
# def ask():
#     if request.method == 'POST':
#         python = run_python_code()
#         print(python)
#         return python
#     else:
#         return jsonify({'error': 'Method not allowed'})

# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=5000)

# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import subprocess

# app = Flask(__name__)
# CORS(app)

# def run_python_code():
#     try:
#         print("Function is called")
#         result = subprocess.check_output(['python', 'hw.py'], text=True)
#         return jsonify({'result': result})
#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({'error': str(e)})

# @app.route('/run_python_code', methods=['GET', 'POST'])
# def ask():
#     if request.method == 'POST':
#         python = run_python_code()
#         print(python)
#         return python
#     else:
#         return jsonify({'error': 'Method not allowed'})

# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=5000)



# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from azure.core.credentials import AzureKeyCredential
# from azure.ai.textanalytics import TextAnalyticsClient

# app = Flask(__name__)
# CORS(app)

# text_analytics_endpoint = "https://cssshahullanguagedemo.cognitiveservices.azure.com/"
# text_analytics_key = "74614b66e5874aa9a79cda5e6e0e04a7"

# text_analytics_client = TextAnalyticsClient(endpoint=text_analytics_endpoint, credential=AzureKeyCredential(text_analytics_key))

# def generate_summary(text_document, text_analytics_client):
#     document = [text_document]

#     poller_abstract = text_analytics_client.begin_abstract_summary(document)
#     abstract_summary_results = poller_abstract.result()     

#     poller_extract = text_analytics_client.begin_extract_summary(document)
#     extract_summary_results = poller_extract.result()   

#     abstract_summary = ""
#     extract_summary = ""

#     for result in abstract_summary_results:
#         if result.kind == "AbstractiveSummarization":
#             abstract_summary = " ".join([summary.text for summary in result.summaries])
#         elif result.is_error is True:
#             return f"Error: {result.error.code} - {result.error.message}"

#     for result in extract_summary_results:
#         if result.kind == "ExtractiveSummarization":
#             lst_sentences = [sentence.text for sentence in result.sentences]
#             extract_summary = "\n".join(lst_sentences)
#         elif result.is_error is True:
#             return f"Error: {result.error.code} - {result.error.message}"

#     return {"abstract_summary": abstract_summary, "extract_summary": extract_summary}

# @app.route('/generateSummary', methods=['POST'])
# def generate_summary_route():
#     data = request.json
#     text_document = data.get('text_document')

#     result = generate_summary(text_document, text_analytics_client)

#     return jsonify(result)

# if __name__ == '__main__':
#     app.run(host="0.0.0.0", port=5000)



from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from extact import generateSummary, text_analytics_client
from DocumentTranslation import upload_and_translate_documents,generate_file_url
import logging
from predict_only import predict   # Assuming this function processes the audio and returns predictions
import tensorflow as tf
import numpy as np
import librosa
import pandas as pd


app = Flask(__name__)
CORS(app) 
cors = CORS(app, resources={r"/predict": {"origins": "http://localhost:3000"}})


# # Ensure this folder exists or create it
# UPLOAD_FOLDER = 'uploads'
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

# @app.route('/predict', methods=['POST'])
# def predict_audio():
#     if 'file_path' not in request.json:
#         return jsonify({'error': 'No file path provided'}), 400
    
#     file_path = request.json['file_path']

#     if not os.path.exists(file_path):
#         return jsonify({'error': 'Audio file not found'}), 404
    
#     # Call the prediction function from predict_only.py
#     prediction = predict(file_path)
    
#     return jsonify({'prediction': prediction})
# Load the saved pre-trained model
model = tf.keras.models.load_model('emotion_recognition_model.h5')

# Load the OneHotEncoder for decoding labels
enc = pd.read_pickle('label_encoder.pkl')  # Ensure you've saved this correctly

# Define Feature Extraction Function
def extract_mfcc(filename):
    y, sr = librosa.load(filename, duration=3, offset=0.5)
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    return mfcc

# Define API Routes

# @app.route('/api/predict', methods=['POST'])
# def predict():
#     if 'file' not in request.files:  # Make sure this matches the fetch request
        
#         return jsonify({'error': 'No file uploaded'}), 400
    
#     file = request.files['file']  # Match this key with the fetch request
#     print('file:',file)

#     if file.filename == '':
#         return jsonify({'error': 'No file selected'}), 400

#     try:
#         # Save the uploaded file to a temporary location
#         if not os.path.exists('temp'):
#             os.makedirs('temp')  # Create the temp directory if it doesn't exist
        
#         filepath = f'temp/{file.filename}'  # Save to a temp directory
#         file.save(filepath)

#         # Extract features and make predictions
#         mfcc = extract_mfcc(filepath)
#         mfcc = np.expand_dims(mfcc, axis=0)  # Add batch dimension
#         mfcc = np.expand_dims(mfcc, -1)      # Add channel dimension

#         prediction = model.predict(mfcc)
#         predicted_label = np.argmax(prediction, axis=1)
#         emotion_dict = enc.categories_[0]
#         predicted_emotion = emotion_dict[predicted_label[0]]

#         return jsonify({
#             'emotion': predicted_emotion,
#             'confidence': float(np.max(prediction))
#         })

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    if 'audioFile' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['audioFile']
    print('file name:',file.filename)
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        if not os.path.exists('temp'):
            os.makedirs('temp')
        
        filepath = f'temp/{file.filename}'
        file.save(filepath)

        # Extract features and make predictions
        mfcc = extract_mfcc(filepath)
        mfcc = np.expand_dims(mfcc, axis=0)  
        mfcc = np.expand_dims(mfcc, -1)      

        prediction = model.predict(mfcc)
        predicted_label = np.argmax(prediction, axis=1)
        emotion_dict = enc.categories_[0]
        predicted_emotion = emotion_dict[predicted_label[0]]
        print('predicted emotion:',predicted_emotion)
        print('confidence:',prediction)
      

        return jsonify({
            'filename': file.filename,
            'emotion': predicted_emotion,
            'confidence': float(np.max(prediction))
        })
    

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-summary', methods=['POST'])

def api_generate_summary():
    data = request.get_json()
    text_documents = data.get('text_documents', [])
    print("textDocuments:",text_documents)
    # Ensure all documents are in the correct format
    documents = [{'id': str(idx), 'language': 'en', 'text': doc} for idx, doc in enumerate(text_documents)]

    # Use the globally initialized text_analytics_client
    result = generateSummary(documents,text_analytics_client)
    return jsonify(result)



@app.route('/translate-documents', methods=['POST'])
def translate_documents():
    files = request.files.getlist('files')
    languages = request.form.getlist('languages') 
    print('files',files)
    print('languages',languages)
    # Assuming files are sent with the 'files' key
    if not files:
        return jsonify({"error": "No files provided"}), 400
    try:
        # Call the function to handle document upload and translation
        translation_results = upload_and_translate_documents(files,languages)
        print('translation_results',translation_results)
        return jsonify(translation_results), 200
    except Exception as e:
        logging.error('Failed to translate documents', exc_info=True)
        return jsonify({"error": str(e)}), 500
    
@app.route('/download-file/<path:file_path>', methods=['GET'])
def download_file(file_path):
    file_url = generate_file_url(file_path) 
    print('file_url',file_url)
    return jsonify({"file_url": file_url}), 200

if __name__ == '__main__':
    print("Starting Flask server...")
    # app.run(host="0.0.0.0", port=5000)
    app.run(host="0.0.0.0", port=5000, debug=True)

