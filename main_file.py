from google.api_core.client_options import ClientOptions
from google.cloud import documentai  # type: ignore
from openai import OpenAI
from google.api_core.client_options import ClientOptions
# Set your project, location, and file details.
project_id = 'crypto-minutia-452500-r2'
location = 'us'
processor_id = 'e693151434e73e85'
file_path = '/Users/krishnagupta/Desktop/sac-hacks/ECS 20 midterm liza.pdf'

def quickstart(project_id: str, location: str, file_path: str, processor_display_name: str = "My Processor29"):
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
            type_="OCR_PROCESSOR",
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
        mime_type="application/pdf",  # Use "image/png" for PNG files.
    )

    # Configure the process request.
    request = documentai.ProcessRequest(name=processor.name, raw_document=raw_document)

    # Process the document.
    result = client.process_document(request=request)

    # Print the OCR text.
    document = result.document
    print("The document contains the following text:")
    ocr_text = document.text
    print("OCR Output:")
    print(ocr_text)
  

    # Now, use the extracted OCR text as input for OpenAI API.
    system_prompt = (
        "You are a highly precise assistant tasked with transforming unstructured OCR text into a fully structured, detailed summary. Your output must include every detail found in the input, without omitting or losing any information—even if it appears messy or redundant. Organize the content under clear, descriptive headings that mirror the sections of the original text (for example, 'Student Details', 'Analysis Problem 1', etc.). Use bullet points and subheadings where applicable to enhance clarity. If there are any obvious OCR errors or formatting issues, correct them for clarity without altering or inventing new content. Do not add any information beyond what is provided in the OCR text. Ensure that all numerical data, equations, and instructions are preserved exactly as in the original input."
    )
    user_prompt = f"Extracted Text:\n\n{ocr_text}\n\n"
    "Please provide a structured summary of the above text. Ensure you capture every detail exactly as presented, reformatting it with clear headings and bullet points. "
    "Do not omit any content, and only correct minor OCR errors for readability without introducing any new information."


    # Prepare the messages for the ChatCompletion endpoint.
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    openai_client = OpenAI(api_key="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")

    # Call the OpenAI ChatCompletion API.
    response = openai_client.chat.completions.create(
        model="gpt-4",  # or use "gpt-3.5-turbo"
        messages=messages,
        temperature=0.7  # adjust as needed
    )

    # Extract and print the structured response.
    structured_response = response.choices[0].message.content
    print("\nStructured Response from OpenAI:")
    print(structured_response)
    

    # Save the structured response to a text file.
    output_file = "structured_response1.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(structured_response)
    print(f"\nStructured response saved to {output_file}")

# Call the quickstart function.
if __name__ == "__main__":
    quickstart(project_id, location, file_path)
