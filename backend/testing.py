from flask import Flask, request, jsonify, send_file
import requests
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from openai import OpenAI
import uuid

app = Flask(__name__)

# Configuration details for Google Cloud Document AI.
project_id = 'crypto-minutia-452500-r2'
location = 'us'

def process_pdf(pdf_bytes: bytes):
    processor_display_name = f"My Processor {uuid.uuid4()}"
    opts = ClientOptions(api_endpoint=f"{location}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    parent = client.common_location_path(project_id, location)
    processor = client.create_processor(
        parent=parent,
        processor=documentai.Processor(type_="OCR_PROCESSOR", display_name=processor_display_name),
    )

    raw_document = documentai.RawDocument(content=pdf_bytes, mime_type="application/pdf")

    request_doc = documentai.ProcessRequest(name=processor.name, raw_document=raw_document)
    result = client.process_document(request=request_doc)

    document = result.document
    ocr_text = document.text

    system_prompt = (
        "You are a highly precise assistant tasked with transforming unstructured OCR text into a fully structured, detailed summary that follows a strict format. "
        "For each exam question, your output must begin with a header formatted exactly as follows:\n\n"
        "### Question <number>: <question title> (<points> points)\n\n"
        "After the header, include any additional details or description present in the original text, and then include a section labeled 'Solution:' that contains the correct answer. "
        "Ensure all numerical data, equations, and instructions are preserved exactly."
    )

    user_prompt = f"Extracted Text:\n\n{ocr_text}\n\nPlease structure this text according to the given format."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    openai_client = OpenAI(api_key="")

    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7
    )

    structured_response = response.choices[0].message.content
    return structured_response


@app.route('/process', methods=['POST'])
def process_endpoint():
    try:
        data = request.get_json()
        pdf_url = data.get("pdf_url")

        if not pdf_url:
            return jsonify({"error": "Missing 'pdf_url' in request body."}), 400

        # Download the PDF
        response = requests.get(pdf_url)
        if response.status_code != 200:
            return jsonify({"error": f"Failed to download PDF. HTTP Status Code: {response.status_code}"}), 500

        pdf_bytes = response.content

        # Process the PDF
        structured_response = process_pdf(pdf_bytes)

        # Save to a file
        output_filename = "structured_response.txt"
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(structured_response)

        return send_file(output_filename, as_attachment=True, download_name="structured_response_que.txt")

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5008)
