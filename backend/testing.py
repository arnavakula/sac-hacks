from flask import Flask, request, jsonify
import os
import uuid
import requests
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from openai import OpenAI

app = Flask(__name__)

# Configuration details
PROJECT_ID = 'crypto-minutia-452500-r2'
LOCATION = 'us'

def process_pdf_from_url(pdf_url: str):
    # Download the PDF from the provided URL
    response = requests.get(pdf_url)
    if response.status_code != 200:
        raise ValueError("Failed to download the PDF from the provided URL.")

    pdf_bytes = response.content

    # Configure Document AI client
    opts = ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    # Create processor (consider reusing in production)
    parent = client.common_location_path(PROJECT_ID, LOCATION)
    processor = client.create_processor(
        parent=parent,
        processor=documentai.Processor(type_="OCR_PROCESSOR", display_name=f"My Processor {uuid.uuid4()}")
    )

    # Process document
    raw_document = documentai.RawDocument(content=pdf_bytes, mime_type="application/pdf")
    request_doc = documentai.ProcessRequest(name=processor.name, raw_document=raw_document)
    result = client.process_document(request=request_doc)

    # Extract OCR text
    document_text = result.document.text

    # OpenAI API processing
    openai_client = OpenAI(api_key="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")
    system_prompt = "You are an AI that structures exam questions..."
    user_prompt = f"Extracted Text:\n\n{document_text}\n\n Please structure the questions properly."

    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
        temperature=0.7
    )

    structured_text = response.choices[0].message.content
    return structured_text

@app.route('/process', methods=['POST'])
def process_endpoint():
    data = request.get_json()
    if not data or 'pdf_url' not in data:
        return jsonify({"error": "Missing 'pdf_url' in request body"}), 400

    try:
        structured_response = process_pdf_from_url(data['pdf_url'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"structured_text": structured_response})

if __name__ == '__main__':
    app.run(debug=True, port=5008)
