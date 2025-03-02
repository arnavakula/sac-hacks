# from google.oauth2 import service_account
# from google.cloud import documentai_v1 as documentai

# # Set your project, location, and processor details
# project_id = 'crypto-minutia-452500-r2'
# location = 'us'
# processor_id = 'e693151434e73e85'
# file_path = '/Users/krishnagupta/Desktop/sac-hacks/Unknown.png'

# # Construct the full resource name
# name = f'projects/{project_id}/locations/{location}/processors/{processor_id}'

# # Specify the path to your service account key file
# service_account_path = "/Users/krishnagupta/Desktop/sac-hacks/crypto-minutia-452500-r2-89f3fb690209.json"
# credentials = service_account.Credentials.from_service_account_file(service_account_path)

# # Create a Document AI client with credentials
# client = documentai.DocumentProcessorServiceClient(credentials=credentials)

# # Read the file content
# with open(file_path, 'rb') as image_file:
#     image_content = image_file.read()

# # Configure the process request with entity_extraction_params
# request = documentai.ProcessRequest(
#     name=name,
#     raw_document=documentai.RawDocument(
#         content=image_content,
#         mime_type='image/png'
#     )
# )

# # Process the document
# result = client.process_document(request=request)

# # Print the OCR text
# document = result.document
# print("OCR Text:")
# print(document.text)


# from google.oauth2 import service_account
# from google.cloud import documentai_v1beta3 as documentai

# # Set your project, location, and processor details
# project_id = 'crypto-minutia-452500-r2'
# location = 'us'
# processor_id = 'e693151434e73e85'
# file_path = '/Users/krishnagupta/Desktop/sac-hacks/Unknown.png'

# # Construct the full resource name for the processor
# name = f'projects/{project_id}/locations/{location}/processors/{processor_id}'

# # Specify the path to your service account key file
# service_account_path = "/Users/krishnagupta/Desktop/sac-hacks/crypto-minutia-452500-r2-89f3fb690209.json"
# credentials = service_account.Credentials.from_service_account_file(service_account_path)

# # Create a Document AI client using the beta API
# client = documentai.DocumentProcessorServiceClient(credentials=credentials)

# # Read the file content
# with open(file_path, 'rb') as image_file:
#     image_content = image_file.read()

# # Configure the process request with entity extraction parameters
# request = documentai.ProcessRequest(
#     name=name,
#     raw_document=documentai.RawDocument(
#         content=image_content,
#         mime_type='image/png'
#     ),
#     process_options=documentai.ProcessOptions(
#         # Specify the entity extraction parameters.
#         entity_extraction_params=documentai.EntityExtractionParams(
#             entity_types=["invoice_date"]  # Replace with the appropriate entity types for your processor.
#         )
#     )
# )

# # Process the document
# result = client.process_document(request=request)

# # Print the OCR text (and any extracted entities if available)
# document = result.document
# print("OCR Text:")
# print(document.text)

# # If you want to inspect the entities extracted:
# if document.entities:
#     print("\nExtracted Entities:")
#     for entity in document.entities:
#         print(f"Type: {entity.type_}, Value: {entity.mention_text}")



from google.api_core.client_options import ClientOptions
from google.cloud import documentai  # type: ignore

# Set your project, location, and file details.
project_id = 'crypto-minutia-452500-r2'
location = 'us'
processor_id = 'e693151434e73e85'
file_path = '/Users/krishnagupta/Desktop/sac-hacks/WhatsApp Image 2025-03-01 at 18.04.01.jpeg'

def quickstart(project_id: str, location: str, file_path: str, processor_display_name: str = "My Processor5"):
    # You must set the `api_endpoint` if you use a location other than "us".
    opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")

    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    # The full resource name of the location, e.g.:
    # `projects/{project_id}/locations/{location}`
    parent = client.common_location_path(project_id, location)

    # Create a Processor
    processor = client.create_processor(
        parent=parent,
        processor=documentai.Processor(
            type_="OCR_PROCESSOR",  # Refer to the documentation for available processor types.
            display_name=processor_display_name
          
        ),
    )

    # Print the processor information
    print(f"Processor Name: {processor.name}")

    # Read the file into memory
    with open(file_path, "rb") as image:
        image_content = image.read()

    # Load binary data with the correct MIME type for a PNG image.
    raw_document = documentai.RawDocument(
        content=image_content,
        mime_type="image/jpeg",  # Use "image/png" for PNG files.
    )

    # Configure the process request.
    request = documentai.ProcessRequest(name=processor.name, raw_document=raw_document)

    # Process the document.
    result = client.process_document(request=request)

    # Print the OCR text.
    document = result.document
    print("The document contains the following text:")
    print(document.text)

# Call the quickstart function.
if __name__ == "__main__":
    quickstart(project_id, location, file_path)
