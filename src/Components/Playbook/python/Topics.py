import time
import os
import json
from openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
# load_dotenv(dotenv_path='metronics_v8.2.0-main/src/Components/Playbook/python/.env', override=True)



# azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
# api_key = os.getenv("AZURE_OPENAI_API_KEY")
# print('azure_endpoint',azure_endpoint)
# print('api_key',api_key )


# Initialize Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint='https://topicmodelingforthottaneketta.openai.azure.com/',
    api_key='a279c736c8e64b3fa82f8f1958696cf6',
    api_version="2024-02-15-preview"
)

# Create the assistant
assistant = client.beta.assistants.create(
    model="gpt-4",  # Replace with model deployment name.
    instructions=(
        "You are an expert in topic modeling and text analysis. "
        "Analyze the following text and identify the main topics. Provide a list of 1-3 topics without a  description for each. Text: {text}"
    ),
    # tools=None,
    # tool_resources={},
    temperature=1,
    top_p=1
)

def process_topic_modeling(text_documents):
    print("text documents from client:",text_documents)
    # Create a thread
    thread = client.beta.threads.create()

    # Add user question to the thread
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=json.dumps({"textDocuments": text_documents})  # Send text documents as JSON
    )

    # Run the thread
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant.id
    )

    # Looping until the run completes or fails
    while run.status in ['queued', 'in_progress', 'cancelling']:
        time.sleep(1)
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id
        )

    if run.status == 'completed':
        messages = client.beta.threads.messages.list(
            thread_id=thread.id
        )
        # Initialize an empty list to hold the assistant's messages
        assistant_messages = []

        # Iterate through the messages to find the assistant's response
        for message in messages.data:
            if message.role == 'assistant':
                assistant_messages.append(message.content[0].text.value)

        return assistant_messages

    elif run.status == 'requires_action':
        raise Exception("The assistant requires further actions to complete the request.")
    else:
        raise Exception(f"Run status: {run.status}")

