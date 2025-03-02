import streamlit as st
import os
import time
import tempfile
import fitz  # PyMuPDF
import cv2
import numpy as np
import pytesseract
from PIL import Image
from io import BytesIO
import base64
from langchain.chat_models import ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure page
st.set_page_config(page_title="PDF RAG with Handwritten Text OCR", layout="wide")
st.title("PDF RAG with Handwritten Text OCR")

# Initialize session state
if "initialized" not in st.session_state:
    st.session_state.initialized = False
    st.session_state.pdf_path = None
    st.session_state.extracted_text = []
    st.session_state.has_handwritten = False
    st.session_state.handwritten_text = []

# Sidebar for configuration
with st.sidebar:
    st.header("Configuration")
    
    # API Key input
    openai_api_key = "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"
    
    
    # OCR Confidence threshold
    ocr_confidence = st.slider("OCR Confidence Threshold", 0, 100, 40)
    
    # Check for Tesseract installation
    try:
        pytesseract.get_tesseract_version()
        st.success("Tesseract OCR detected")
    except:
        st.error("Tesseract OCR not found. Please install it.")
        st.info("Installation instructions: https://github.com/tesseract-ocr/tesseract")

# Function to detect if an image contains handwritten text using OpenAI
def detect_handwritten_text(image_path, api_key):
    """
    Uses OpenAI's vision capabilities to detect if an image contains handwritten text.
    Returns a tuple of (is_handwritten, extracted_text)
    """
    from openai import OpenAI
    
    client = OpenAI(api_key=api_key)
    
    with open(image_path, "rb") as f:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Does this image contain handwritten text? If yes, please transcribe it accurately."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}",
                            },
                        },
                    ],
                }
            ],
            max_tokens=1000,
        )
    
    result = response.choices[0].message.content
    
    # Determine if it contains handwritten text
    is_handwritten = "yes" in result.lower() and not "no handwritten text" in result.lower()
    
    # Extract the transcribed text if it's handwritten
    if is_handwritten:
        # Try to find the transcription after common phrases
        for phrase in ["Transcription:", "Here's the transcription:", "The text reads:"]:
            if phrase in result:
                extracted_text = result.split(phrase, 1)[1].strip()
                return True, extracted_text
        
        # If no specific phrase found, return everything after the first line
        lines = result.split('\n')
        if len(lines) > 1:
            extracted_text = '\n'.join(lines[1:]).strip()
        else:
            extracted_text = result
        
        return True, extracted_text
    
    return False, ""

# Function to process PDF and extract text + detect handwritten content
def process_pdf(pdf_path, api_key=None):
    extracted_text = []
    handwritten_text = []
    has_handwritten = False
    
    # Open the PDF
    pdf_document = fitz.open(pdf_path)
    total_pages = len(pdf_document)
    
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    for page_num, page in enumerate(pdf_document):
        status_text.text(f"Processing page {page_num + 1}/{total_pages}")
        
        # Get regular text
        text = page.get_text()
        if text.strip():
            extracted_text.append({
                "page": page_num + 1,
                "text": text,
                "type": "regular"
            })
        
        # Check for images that might contain handwritten text
        if api_key:  # Only process for handwritten text if API key is provided
            image_list = page.get_images(full=True)
            
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = pdf_document.extract_image(xref)
                image_bytes = base_image["image"]
                
                # Convert to PIL Image
                image = Image.open(BytesIO(image_bytes))
                
                # Save temporarily
                temp_img_path = f"temp_img_{page_num}_{img_index}.jpg"
                image.save(temp_img_path)
                
                # Check if it contains handwritten text
                try:
                    is_handwritten, hw_text = detect_handwritten_text(temp_img_path, api_key)
                    
                    if is_handwritten and hw_text:
                        has_handwritten = True
                        handwritten_text.append({
                            "page": page_num + 1,
                            "text": hw_text,
                            "type": "handwritten"
                        })
                except Exception as e:
                    st.warning(f"Error processing image on page {page_num + 1}: {str(e)}")
                
                # Remove temporary file
                if os.path.exists(temp_img_path):
                    os.remove(temp_img_path)
        
        # Also try to detect handwritten text in the page as image with Tesseract
        # This can catch handwritten text that's part of the page (not in embedded images)
        try:
            pix = page.get_pixmap()
            img_path = f"temp_page_{page_num}.png"
            pix.save(img_path)
            
            # Use Tesseract OCR
            img = cv2.imread(img_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply preprocessing to improve OCR for handwritten text
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                          cv2.THRESH_BINARY, 11, 2)
            
            # OCR with specific config for handwritten text
            config = f"--oem 1 --psm 6 -c tessedit_char_whitelist='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,?!:;()\"\'- '"
            ocr_text = pytesseract.image_to_string(thresh, config=config)
            
            # Only include OCR text if it's not too similar to already extracted text
            # and has reasonable confidence
            if ocr_text.strip() and not any(ocr_text in item["text"] for item in extracted_text):
                # Get confidence scores
                ocr_data = pytesseract.image_to_data(thresh, output_type=pytesseract.Output.DICT, config=config)
                confidences = [int(conf) for conf in ocr_data['conf'] if conf != '-1']
                
                # Only include if average confidence exceeds threshold
                if confidences and sum(confidences) / len(confidences) > ocr_confidence:
                    handwritten_text.append({
                        "page": page_num + 1,
                        "text": ocr_text,
                        "type": "handwritten_ocr"
                    })
                    has_handwritten = True
            
            # Remove temp file
            if os.path.exists(img_path):
                os.remove(img_path)
                
        except Exception as e:
            st.warning(f"Error with OCR on page {page_num + 1}: {str(e)}")
        
        # Update progress
        progress_bar.progress((page_num + 1) / total_pages)
    
    status_text.text("PDF processing complete!")
    
    # Combine both regular and handwritten text
    all_text = extracted_text + handwritten_text
    
    return all_text, has_handwritten, handwritten_text

# Function to create vector embeddings
def create_vector_embedding(texts):
    with st.spinner("Creating embeddings..."):
        try:
            # Convert the text data to LangChain documents
            documents = []
            
            for item in texts:
                # Create a LangChain document
                doc = Document(
                    page_content=item["text"],
                    metadata={
                        "page": item["page"],
                        "type": item["type"]
                    }
                )
                documents.append(doc)
            
            # Set up embeddings with HuggingFace
            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            
            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, 
                chunk_overlap=200
            )
            
            split_documents = text_splitter.split_documents(documents)
            
            # Create vector store
            vectors = FAISS.from_documents(split_documents, embeddings)
            
            return vectors
            
        except Exception as e:
            st.error(f"Error creating embeddings: {str(e)}")
            return None

# File uploader for PDF
uploaded_file = st.file_uploader("Upload a PDF", type="pdf")

if uploaded_file:
    # Create a temp file for the PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        tmp_file.write(uploaded_file.getbuffer())
        st.session_state.pdf_path = tmp_file.name
    
    st.success("File uploaded successfully!")

# Process PDF button
if st.button("Process PDF") and st.session_state.pdf_path:
    # Process the PDF
    st.session_state.extracted_text, st.session_state.has_handwritten, st.session_state.handwritten_text = process_pdf(
        st.session_state.pdf_path, 
        openai_api_key if openai_api_key else None
    )
    
    # Create vector embeddings
    if st.session_state.extracted_text:
        st.session_state.vectors = create_vector_embedding(st.session_state.extracted_text)
        if st.session_state.vectors:
            st.session_state.initialized = True
            st.success("Vector database is ready!")
    
    # Show extraction results
    if st.session_state.has_handwritten:
        st.subheader("Handwritten Text Detected")
        for item in st.session_state.handwritten_text:
            st.write(f"Page {item['page']} ({item['type']}): {item['text'][:100]}...")

# Define the prompt template
prompt = ChatPromptTemplate.from_template(
    """
    Answer the questions based on the provided context only.
    Pay special attention to any handwritten content in the context, as it may contain important information.
    Please provide the most accurate response based on the question.
    
    <context>
    {context}
    </context>
    
    Question: {input}
    """
)

# User input
user_prompt = st.text_input("Enter your query about the document")

# Process the query if vectors are ready and user has entered a prompt
if user_prompt and st.session_state.initialized:
    try:
        # Instantiate the OpenAI model
        llm = ChatOpenAI(api_key=openai_api_key, model_name="gpt-4o")
        
        # Create retrieval chain
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = st.session_state.vectors.as_retriever(search_kwargs={"k": 5})
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        
        # Get response
        with st.spinner("Generating response..."):
            start = time.time()
            response = retrieval_chain.invoke({'input': user_prompt})
            elapsed = time.time() - start
            
            # Display response
            st.subheader("Answer")
            st.write(response['answer'])
            st.caption(f"Response time: {elapsed:.2f} seconds")
            
            # Use a Streamlit expander to show context documents
            with st.expander("Document Context"):
                for i, doc in enumerate(response['context']):
                    text_type = doc.metadata.get("type", "unknown")
                    page_num = doc.metadata.get("page", "unknown")
                    
                    # Highlight handwritten content
                    if text_type == "handwritten" or text_type == "handwritten_ocr":
                        st.markdown(f"**Document {i+1} (Page {page_num}, {text_type}):**")
                        st.markdown(f"<div style='background-color: #ffffcc; padding: 10px;'>{doc.page_content}</div>", unsafe_allow_html=True)
                    else:
                        st.markdown(f"**Document {i+1} (Page {page_num}, {text_type}):**")
                        st.write(doc.page_content)
                    
                    st.write('------------------------')
    
    except Exception as e:
        st.error(f"Error processing query: {str(e)}")
elif user_prompt:
    st.warning("Please process the PDF before querying.")

# Clean up temporary files when the app is done
def cleanup():
    if st.session_state.pdf_path and os.path.exists(st.session_state.pdf_path):
        os.remove(st.session_state.pdf_path)

# Register the cleanup function to be called when the script reruns
import atexit
atexit.register(cleanup)