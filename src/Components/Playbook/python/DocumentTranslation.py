





from azure.storage.blob import BlobServiceClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.translation.document import DocumentTranslationClient
# from datetime import datetime, timedelta
from datetime import datetime, timedelta, timezone

from azure.storage.blob import generate_blob_sas, BlobSasPermissions
import time
import uuid
import logging
import datetime

# Azure Blob Storage configuration
AZURE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=cssshahulblobstorage;AccountKey=T5fAz2ekgvBmiuR7CopcTsnNXs0dkRt17s8xKtqvCPg320yAlLKCz0uRPjORZcCal9pZHRvl4R0L+ASt0rVfJQ==;EndpointSuffix=core.windows.net"
AccountName='cssshahulblobstorage'
AccountKey='T5fAz2ekgvBmiuR7CopcTsnNXs0dkRt17s8xKtqvCPg320yAlLKCz0uRPjORZcCal9pZHRvl4R0L+ASt0rVfJQ=='
INPUT_CONTAINER_NAME = "inputdocs"
OUTPUT_CONTAINER_NAME = "outputcontainer"

# Azure Document Translation configuration
# KEY = "b34a7f6e07014be69f1fd3fddaa7b3c5"
# ENDPOINT = "https://cssshahultranslatorservice.cognitiveservices.azure.com/"
# NEW KEY
KEY = "2a12bff99d754c20a051d66c72c242cf"
ENDPOINT = "https://translatorforcallcenter.cognitiveservices.azure.com/"

def upload_and_translate_documents(files,languages):
    # Initialize Blob Service Client
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    input_container_client = blob_service_client.get_container_client(INPUT_CONTAINER_NAME)

    # Initialize Document Translation Client
    translation_client = DocumentTranslationClient(ENDPOINT, AzureKeyCredential(KEY))

     # Generate a unique identifier for the translation job
    # translation_job_id = str(uuid.uuid4())
    # Generate a unique identifier for the translation job using the current timestamp
    translation_job_id = str(int(time.time()))

    # Upload files to Azure Blob Storage and prepare for translation
    urls = []
    for file in files:
        blob_name = file.filename
        blob_client = input_container_client.get_blob_client(blob_name)
        blob_client.upload_blob(file, overwrite=True)
        urls.append(blob_client.url)
        print('uploaded successfully',blob_name)

    # Prepare the translation job
   
    source_uris=f'https://cssshahulblobstorage.blob.core.windows.net/inputdocs'
        
        # source_uris=[f"https://cssshahulblobstorage.blob.core.windows.net/inputdocs/{file.filename}" for file in files]
        # source_uris='https://cssshahulblobstorage.blob.core.windows.net/inputdocs/{blob_name}?sp=racwdt&st=2024-02-15T10:17:39Z&se=2024-02-15T18:17:39Z&sv=2022-11-02&sr=b&sig=XZgtRP404TfEZdeQP2Y34L8pGgPAlVno1njn5laWfos%3D'


    translation_results = []
    # Create a single target folder for all translations
    target_folder_name = f"{translation_job_id}"
    target_folder_uri = f"https://cssshahulblobstorage.blob.core.windows.net/outputcontainer/{target_folder_name}/"

    for language in languages:
        # Create a target URI for each language
     
        # target_folder_name = f"{language}"  # Use language code as folder name
        # target_blob_name = f"{blob_name.split('.')[0]}_{language}.txt"  # Append language code to original filename
        # target_blob_uri = f"https://cssshahulblobstorage.blob.core.windows.net/outputcontainer/{target_folder_name}/{target_blob_name}"
        target_blob_name = f"{blob_name.split('.')[0]}_{language}.txt"  # Append language code to original filename
        target_blob_uri = f"{target_folder_uri}/{target_blob_name}"


        # Start the translation job for each language
        poller = translation_client.begin_translation(source_uris, target_blob_uri, language)
        result = poller.result()  # Blocking call

        # Process results for each language
        for document in result:
            if document.status == "Succeeded":
                translation_results.append({
                    "language": language,
                    "originalName": document.source_document_url,
                    "translatedContent": document.translated_document_url
                })
                print("translated documents",translation_results)


    return translation_results


# def generate_file_url(file_path):
#     # folderName=upload_and_translate_documents()
#     file_url = f"https://cssshahulblobstorage.blob.core.windows.net/outputcontainer/1709011542//inputText%20(1)_bs.txt/inputText%20(1).txt?sp=r&st=2024-02-28T05:04:26Z&se=2024-02-28T13:04:26Z&spr=https&sv=2022-11-02&sr=b&sig=PWgXfa06PiCcSMF8x8VlddwdEzEQbwsGe7WuBrcPOD0%3D"
#     print('generate file URL',file_url)
#     return file_url



def generate_file_url(file_path):
    sas_token = generate_blob_sas(
        AccountName,
        'outputcontainer',
        file_path,  # blob name, e.g., '1709011542/inputText (1)_bs.txt/inputText (1).txt'
        account_key=AccountKey,
        permission=BlobSasPermissions(read=True),
        expiry = datetime.now(timezone.utc) + timedelta(hours=1),  # Set expiry time for the SAS token
    )
    file_url = f"https://{AccountName}.blob.core.windows.net/outputcontainer/{file_path}?{sas_token}"
    print('generated file URL with SAS token:', file_url)
    return file_url








