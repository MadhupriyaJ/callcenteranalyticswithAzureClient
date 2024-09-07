import os
import pandas as pd
import numpy as np
import librosa
import librosa.display
from keras.models import load_model
import pickle

# Paths to the model and label encoder
model_path = 'emotion_recognition_model.h5'
encoder_path = 'label_encoder.pkl'

# Check if the model file exists
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")

# Check if the encoder file exists
if not os.path.exists(encoder_path):
    raise FileNotFoundError(f"Label encoder file not found: {encoder_path}")

# Load the pre-trained model
model = load_model(model_path)

# Load the label encoder
with open(encoder_path, 'rb') as file:
    enc = pickle.load(file)

# Function to extract MFCC features from an audio file
def extract_mfcc(filename):
    y, sr = librosa.load(filename, duration=3, offset=0.5)
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    return mfcc

# Function to predict emotion from an audio file
def predict_emotion(filename):
    mfcc = extract_mfcc(filename)
    mfcc = np.expand_dims(mfcc, axis=0)  # Add batch dimension
    mfcc = np.expand_dims(mfcc, -1)      # Add channel dimension
    prediction = model.predict(mfcc)
    predicted_label = np.argmax(prediction, axis=1)
    emotion_dict = enc.categories_[0]
    predicted_emotion = emotion_dict[predicted_label[0]]
    return predicted_emotion

# # Function to get all audio file paths from the specified directory and its subdirectories
# def get_audio_files(directory):
#     audio_files = []
#     for root, _, files in os.walk(directory):
#         for file in files:
#             if file.endswith('.wav'):  # You can add other audio file extensions if needed
#                 audio_files.append(os.path.join(root, file))
#     return audio_files

# # Specify the directory containing the audio files
# directory = r'C:\Users\madhu\OneDrive\Desktop\pythoncode\AudioFile\YAF'

# # Get all audio files from the directory and its subdirectories
# audio_files = get_audio_files(directory)

# # Create a list to store the results
# results = []

# # Predict emotion for each audio file and save the results
# with open('predicted_emotions.txt', 'w') as f:
#     for file_path in audio_files:
#         print(f"Attempting to access file: {file_path}")
#         predicted_emotion = predict_emotion(file_path)
#         print(f"Predicted emotion for {file_path}: {predicted_emotion}")
#         results.append((file_path, predicted_emotion))
#         result = f"Predicted emotion for {file_path}: {predicted_emotion}\n"
#         print(result)
#         f.write(result)

# Main prediction function that accepts file path

# Create a list to store the results
results = []

def predict(file_path):
    print(f"Predicting emotion for: {file_path}")
    predicted_emotion = predict_emotion(file_path)
    print(f"Predicted emotion for {file_path}: {predicted_emotion}")
    results.append((file_path, predicted_emotion))
    result = f"Predicted emotion for {file_path}: {predicted_emotion}\n"
    print(result)
    
    return predicted_emotion

# Convert the results to a DataFrame
df = pd.DataFrame(results, columns=['File Path', 'Predicted Emotion'])

# Save the DataFrame to an Excel file
df.to_excel('predicted_emotions.xlsx', index=False)
