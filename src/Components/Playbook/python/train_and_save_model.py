import pandas as pd
import numpy as np
import os
import seaborn as sns
import matplotlib.pyplot as plt
import librosa
import librosa.display
from IPython.display import Audio
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Ensure openpyxl is installed
try:
    import openpyxl
except ModuleNotFoundError:
    print("Please install openpyxl by running 'pip install openpyxl'")
    raise

"""## Load the Dataset"""

# Check if the directory exists
# directory = 'E:\AudioFile\OAF'
directory= 'F:/AI_Project/speech_audio/AudioFile/AudioFile/OAF'

if not os.path.exists(directory):
    print(f"The directory {directory} does not exist.")
# else:
    # print(f"The directory {directory} exists.")

    # Check if the directory contains any files or subdirectories
    items = os.listdir(directory)
    if not items:
        print(f"The directory {directory} is empty.")
    # else:
    #     print(f"The directory {directory} contains {len(items)} items.")

# Proceed with the original script with more debug statements
paths = []
labels = []

for dirname, _, filenames in os.walk(directory):
    # print(f'Entering directory: {dirname}')
    for filename in filenames:
        # print(f'Found file: {filename}')
        paths.append(os.path.join(dirname, filename))
        label = filename.split('_')[-1]
        label = label.split('.')[0]
        labels.append(label.lower())
        if len(paths) == 2800:
            break
    if len(paths) == 2800:
        break

# print(f'Dataset is Loaded. Number of paths: {len(paths)}')
# print('Sample paths:', paths[:5])
# print('Sample labels:', labels[:5])

len(paths)

paths[:5]

labels[:5]

## Create a dataframe
df = pd.DataFrame()
df['speech'] = paths
df['label'] = labels
df.head()

df['label'].value_counts()
print(df['label'].value_counts())


"""## Exploratory Data Analysis"""

#sns.countplot(df['label'])

#!pip install --upgrade librosa

def waveplot(data, sr, emotion):
    plt.figure(figsize=(10,4))
    plt.title(emotion, size=20)
    librosa.display.waveshow(data, sr=sr)
    # plt.show()

def spectogram(data, sr, emotion):
    x = librosa.stft(data)
    xdb = librosa.amplitude_to_db(abs(x))
    plt.figure(figsize=(11,4))
    plt.title(emotion, size=20)
    librosa.display.specshow(xdb, sr=sr, x_axis='time', y_axis='hz')
    plt.colorbar()

emotion = 'fear'
path = np.array(df['speech'][df['label']==emotion])[0]
data, sampling_rate = librosa.load(path)
waveplot(data, sampling_rate, emotion)
spectogram(data, sampling_rate, emotion)
Audio(path)

emotion = 'angry'
path = np.array(df['speech'][df['label']==emotion])[1]
data, sampling_rate = librosa.load(path)
waveplot(data, sampling_rate, emotion)
spectogram(data, sampling_rate, emotion)
Audio(path)

emotion = 'disgust'
path = np.array(df['speech'][df['label']==emotion])[0]
data, sampling_rate = librosa.load(path)
waveplot(data, sampling_rate, emotion)
spectogram(data, sampling_rate, emotion)
Audio(path)

emotion = 'neutral'
path = np.array(df['speech'][df['label']==emotion])[0]
data, sampling_rate = librosa.load(path)
waveplot(data, sampling_rate, emotion)
spectogram(data, sampling_rate, emotion)
Audio(path)

emotion = 'sad'
path = np.array(df['speech'][df['label']==emotion])[0]
data, sampling_rate = librosa.load(path)
waveplot(data, sampling_rate, emotion)
spectogram(data, sampling_rate, emotion)
Audio(path)

emotion = 'ps'
path = np.array(df['speech'][df['label']==emotion])[0]
data, sampling_rate = librosa.load(path)
waveplot(data, sampling_rate, emotion)
spectogram(data, sampling_rate, emotion)
Audio(path)

emotion = 'happy'
path = np.array(df['speech'][df['label']==emotion])[0]
data, sampling_rate = librosa.load(path)
waveplot(data, sampling_rate, emotion)
spectogram(data, sampling_rate, emotion)
Audio(path)

"""## Feature Extraction"""


def extract_mfcc(filename):
    y, sr = librosa.load(filename, duration=3, offset=0.5)
    mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
    return mfcc

extract_mfcc(df['speech'][0])

X_mfcc = df['speech'].apply(lambda x: extract_mfcc(x))

X_mfcc

X = [x for x in X_mfcc]
X = np.array(X)
X.shape

## input split
X = np.expand_dims(X, -1)
X.shape

from sklearn.preprocessing import OneHotEncoder
enc = OneHotEncoder()
y = enc.fit_transform(df[['label']])

y = y.toarray()

y.shape

with open('label_encoder', 'wb') as f:
    pickle.dump(enc, f)

"""## Create the LSTM Model"""

#!pip install --upgrade keras tensorflow

from keras.models import Sequential # type: ignore
from keras.layers import Dense, LSTM, Dropout

# model = Sequential([
#     LSTM(256, return_sequences=False, input_shape=(40,1)),
#     Dropout(0.2),
#     Dense(128, activation='relu'),
#     Dropout(0.2),
#     Dense(64, activation='relu'),
#     Dropout(0.2),
#     Dense(8, activation='softmax')  # Adjust to match the number of classes
# ])
model = Sequential([
    LSTM(256, return_sequences=False, input_shape=(40,1)),
    Dropout(0.2),
    Dense(128, activation='relu'),
    Dropout(0.2),
    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(8, activation='softmax')  # Adjust to match the number of classes
])



model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
model.summary()

# Train the model
history = model.fit(X, y, validation_split=0.2, epochs=50, batch_size=64)

# best val accuracy: 72.32
# use checkpoint to save the best val accuracy model
# adjust learning rate for slow convergence

# Save the trained model to a file
model.save('emotion_recognition_model')

"""## Plot the results"""

epochs = list(range(50))
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']

loss = history.history['loss']
val_loss = history.history['val_loss']



# Predict on new data
def predict_emotion(filename):
    mfcc = extract_mfcc(filename)
    mfcc = np.expand_dims(mfcc, axis=0)  # Add batch dimension
    mfcc = np.expand_dims(mfcc, -1)      # Add channel dimension
    prediction = model.predict(mfcc)
    predicted_label = np.argmax(prediction, axis=1)
    emotion_dict = enc.categories_[0]
    predicted_emotion = emotion_dict[predicted_label[0]]
    return predicted_emotion

import os
import pandas as pd

# Function to get all file paths from the specified directory and its subdirectories
def get_audio_files(directory):
    audio_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.wav'):  # You can add other audio file extensions if needed
                audio_files.append(os.path.join(root, file))
    return audio_files

# Specify the directory containing the audio files
# directory = r'C:\Users\madhu\OneDrive\Desktop\pythoncode\AudioFile\YAF'
directory='F:/AI_Project/speech_audio/AudioFile/AudioFile/YAF'

# Get all audio files from the directory and its subdirectories
audio_files = get_audio_files(directory)

# Create a list to store the results
results = []

# Predict emotion for each audio file
with open('predicted_emotions.txt', 'w') as f:
    for file_path in audio_files:
        print(f"Attempting to access file: {file_path}")
        predicted_emotion = predict_emotion(file_path)
        print(f"Predicted emotion for {file_path}: {predicted_emotion}")
        results.append((file_path, predicted_emotion))
        result = f"Predicted emotion for {file_path}: {predicted_emotion}\n"
        print(result)
        f.write(result)

# Convert the results to a DataFrame
df = pd.DataFrame(results, columns=['File Path', 'Predicted Emotion'])

# Save the DataFrame to an Excel file
df.to_excel('predicted_emotions.xlsx', index=False)








# import pandas as pd
# import numpy as np
# import os
# import seaborn as sns
# import matplotlib.pyplot as plt
# import librosa
# import librosa.display
# from IPython.display import Audio
# import warnings
# warnings.filterwarnings('ignore')

# # Ensure openpyxl is installed
# try:
#     import openpyxl
# except ModuleNotFoundError:
#     print("Please install openpyxl by running 'pip install openpyxl'")
#     raise

# # Load the Dataset
# directory = 'E:\AudioFile\OAF'
# if not os.path.exists(directory):
#     print(f"The directory {directory} does not exist.")

# items = os.listdir(directory)
# if not items:
#     print(f"The directory {directory} is empty.")

# # Proceed with the original script with more debug statements
# paths = []
# labels = []

# for dirname, _, filenames in os.walk(directory):
#     for filename in filenames:
#         paths.append(os.path.join(dirname, filename))
#         label = filename.split('_')[-1]
#         label = label.split('.')[0]
#         labels.append(label.lower())
#         if len(paths) == 2800:
#             break
#     if len(paths) == 2800:
#         break

# df = pd.DataFrame()
# df['speech'] = paths
# df['label'] = labels

# # Exploratory Data Analysis
# def waveplot(data, sr, emotion):
#     plt.figure(figsize=(10,4))
#     plt.title(emotion, size=20)
#     librosa.display.waveshow(data, sr=sr)

# def spectogram(data, sr, emotion):
#     x = librosa.stft(data)
#     xdb = librosa.amplitude_to_db(abs(x))
#     plt.figure(figsize=(11,4))
#     plt.title(emotion, size=20)
#     librosa.display.specshow(xdb, sr=sr, x_axis='time', y_axis='hz')
#     plt.colorbar()

# # Feature Extraction
# def extract_mfcc(filename):
#     y, sr = librosa.load(filename, duration=3, offset=0.5)
#     mfcc = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40).T, axis=0)
#     return mfcc

# X_mfcc = df['speech'].apply(lambda x: extract_mfcc(x))
# X = [x for x in X_mfcc]
# X = np.array(X)
# X = np.expand_dims(X, -1)

# from sklearn.preprocessing import OneHotEncoder
# enc = OneHotEncoder()
# y = enc.fit_transform(df[['label']])
# y = y.toarray()

# # Create the LSTM Model
# from keras.models import Sequential
# from keras.layers import Dense, LSTM, Dropout

# model = Sequential([
#     LSTM(256, return_sequences=False, input_shape=(40,1)),
#     Dropout(0.2),
#     Dense(128, activation='relu'),
#     Dropout(0.2),
#     Dense(64, activation='relu'),
#     Dropout(0.2),
#     Dense(7, activation='softmax')
# ])

# model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
# model.summary()

# # Train the model
# history = model.fit(X, y, validation_split=0.2, epochs=50, batch_size=64)

# # Save the model
# model.save('emotion_recognition_model.h5')

# # Save the encoder
# import pickle
# with open('label_encoder.pkl', 'wb') as file:
#     pickle.dump(enc, file)
