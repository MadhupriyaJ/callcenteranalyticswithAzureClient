# # hw.py

# from azure.core.credentials import AzureKeyCredential
# from azure.ai.textanalytics import TextAnalyticsClient

# text_analytics_endpoint = "https://languagecallcenter.cognitiveservices.azure.com/"
# text_analytics_key = "ece008fb2e1e47b19eb2dafd9c45d66c"

# text_analytics_client = TextAnalyticsClient(endpoint=text_analytics_endpoint, credential=AzureKeyCredential(text_analytics_key))

# def generateSummary(text_document, text_analytics_client):
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

from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient

text_analytics_endpoint = "https://languageforthottaneketta.cognitiveservices.azure.com/"
text_analytics_key = "e805b7a03c7b4f5cae34c26b8f70e9a8"

text_analytics_client = TextAnalyticsClient(endpoint=text_analytics_endpoint, credential=AzureKeyCredential(text_analytics_key))

def generateSummary(text_documents, text_analytics_client):
    print("text documents:",text_documents)
    if not text_documents:
        return {"abstract_summary": "", "extract_summary": ""}

    poller_abstract = text_analytics_client.begin_abstract_summary(text_documents)
    abstract_summary_results = poller_abstract.result()

    poller_extract = text_analytics_client.begin_extract_summary(text_documents)
    extract_summary_results = poller_extract.result()

    abstract_summaries = []
    extract_summaries = []

    for result in abstract_summary_results:
        if result.kind == "AbstractiveSummarization":
            abstract_summary = " ".join([summary.text for summary in result.summaries])
            abstract_summaries.append(abstract_summary)
        elif result.is_error is True:
            return f"Error: {result.error.code} - {result.error.message}"

    for result in extract_summary_results:
        if result.kind == "ExtractiveSummarization":
            lst_sentences = [sentence.text for sentence in result.sentences]
            extract_summary = "\n".join(lst_sentences)
            print("extract_summary:",extract_summary)
            extract_summaries.append(extract_summary)
        elif result.is_error is True:
            return f"Error: {result.error.code} - {result.error.message}"

    return {"abstract_summaries": abstract_summaries, "extract_summaries": extract_summaries}
