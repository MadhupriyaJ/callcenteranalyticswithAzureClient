import time
import json
from openai import AzureOpenAI

# Initialize Azure OpenAI client
client = AzureOpenAI(
    azure_endpoint="https://callcenterspeech.openai.azure.com/",  # Use environment variable or config
    api_key="8b088d783acc431e9b62e43efec537ba",  # Use environment variable or config
    api_version="2024-05-01-preview"
)

# Create the assistant
assistant = client.beta.assistants.create(
    model="gpt-4o",  # Replace with model deployment name.
    instructions=(
        "You are an expert in topic modeling and text analysis. "
        "Analyze the following text and identify the main topics. Provide a list of 1-3 topics with a one-line description for each. Text: {text}"
    ),
    tools=None,
    tool_resources={},
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
















# import os
# import json
# import requests
# import time
# from openai import AzureOpenAI

# client = AzureOpenAI(
#     azure_endpoint="https://callcenterspeech.openai.azure.com/",  # Use environment variable name
#     api_key="8b088d783acc431e9b62e43efec537ba",          # Use environment variable name
#     api_version="2024-05-01-preview"
# )

# assistant = client.beta.assistants.create(
#     model="gpt-4o",  # Replace with model deployment name.
#     instructions=(
#         "You are an expert in topic modeling and text analysis. "
#         "Analyze the following text and identify the main topics. Provide a list of 1-3 topics with a one-line description for each. Text: {text}"
#     ),  # Corrected to a single string
#     tools=None,  # Use None instead of undefined
#     tool_resources={},
#     temperature=1,
#     top_p=1
# )

# # Create a thread

# thread = client.beta.threads.create()

# # Add a user question to the thread
# message = client.beta.threads.messages.create(
#     thread_id=thread.id,
#     role="user",
#     content=("Before Salesforce users can access and use a call center, an administrator must complete various tasks.\n\n"
#              "Work with a developer or partner to create a computer-telephony integration (CTI) implementation that uses the Open CTI API and works with your existing telephony system. "
#              "Most call centers are created by installing a package from AppExchange. If you’re developing your own implementation, define a new call center record for every CTI system in use at your business.\n\n"
#              "Assign Salesforce users to the appropriate call center. A call center user must be associated with a call center to view the softphone. "
#              "Optionally, you can make further customizations. Configure call center phone directories with more directory numbers and updated phone number search layouts. "
#              "Customize softphone layouts for different user profiles, so that the softphone of a sales person shows related leads, accounts, and opportunities, "
#              "while the softphone of a support agent shows related cases and solutions. Next, let’s work on call center definition files.\n\n"
#              "Call Center Definition Files A call center definition file specifies a set of fields and values that are used to define a call center in Salesforce for a particular CTI system. "
#              "Salesforce uses call center definition files to support the integration with multiple CTI system vendors.\n\n"
#              "Create a Call Center Definition File If you have built a custom CTI adapter, you must write a call center definition file to support it. "
#              "Use a text or XML editor to define an XML file according to the guidelines outlined in these topics.\n\n"
#              "Import a Call Center Definition File To create your first call center for a CTI adapter that was just installed, you can import the adapter's default call center definition file into Salesforce.")
# )

# # Run the thread
# run = client.beta.threads.runs.create(
#     thread_id=thread.id,
#     assistant_id=assistant.id
# )

# # Looping until the run completes or fails
# while run.status in ['queued', 'in_progress', 'cancelling']:
#     time.sleep(1)
#     run = client.beta.threads.runs.retrieve(
#         thread_id=thread.id,
#         run_id=run.id
#     )

# if run.status == 'completed':
#     messages = client.beta.threads.messages.list(
#         thread_id=thread.id
#     )
#      # Initialize an empty list to hold the assistant's messages
#     assistant_messages = []
    
#     # Iterate through the messages to find the assistant's response
#     for message in messages.data:
#         if message.role == 'assistant':
#             assistant_messages.append(message.content[0].text.value)

#     # Print all assistant messages
#     print("### Assistant's Response:")
#     for msg in assistant_messages:
#         print(msg)
# elif run.status == 'requires_action':
#     # The assistant requires calling some functions
#     # and submit the tool outputs back to the run
#     print("The assistant requires further actions to complete the request.")
#     pass
# else:
#     print(f"Run status: {run.status}")
