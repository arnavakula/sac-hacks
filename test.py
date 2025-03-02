import streamlit as st
import os
import time
from langchain.chat_models import ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
# Load environment variables
load_dotenv()

# Configure page
st.title("RAG Document Q&A With OpenAI and LangChain")

# Define API key
openai_api_key = "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"


# Define the prompt template
prompt = ChatPromptTemplate.from_template(
    """
    Answer the questions based on the provided context only.
    Please provide the most accurate response based on the question.
    
    <context>
    {context}
    </context>
    
    Question: {input}
    """
)

# Function to create vector embeddings
def create_vector_embedding():
    if "vectors" not in st.session_state:
        with st.spinner("Creating embeddings..."):
            try:
                # Set up embeddings with HuggingFace
                
                st.session_state.embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)

                
                # Use PyPDFLoader for a single PDF file
                pdf_path = "/Users/krishnagupta/Desktop/sac-hacks/output.pdf"  # Make sure this file exists
                if not os.path.exists(pdf_path):
                    st.error(f"File not found: {pdf_path}")
                    return False
                
                # Load the PDF file
                loader = PyPDFLoader(pdf_path)
                print(loader)
                st.session_state.docs = loader.load()
                
                # Check if documents were loaded
                if not st.session_state.docs:
                    st.error("No documents loaded from the PDF.")
                    return False
                
                # Split documents into chunks
                st.session_state.text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000, 
                    chunk_overlap=200
                )
                
                st.session_state.final_documents = st.session_state.text_splitter.split_documents(st.session_state.docs)
                
                # Check if we have documents after splitting
                if not st.session_state.final_documents:
                    st.error("No text chunks extracted from the documents.")
                    return False
                
                # Create vector embeddings
                st.session_state.vectors = FAISS.from_documents(
                    st.session_state.final_documents, 
                    st.session_state.embeddings
                )
                
                return True
                
            except Exception as e:
                st.error(f"Error creating embeddings: {str(e)}")
                return False
    return True

# File uploader for PDF
uploaded_file = st.file_uploader("Upload a PDF", type="pdf")

if uploaded_file:
    # Save the uploaded file
    with open("output.pdf", "wb") as f:
        f.write(uploaded_file.getbuffer())
    st.success("File uploaded successfully!")

# Button to create embeddings
if st.button("Document Embedding"):
    if create_vector_embedding():
        st.success("Vector Database is ready")

# User input
user_prompt = st.text_input("Enter your query from the research paper")

# Process the query if vectors are ready and user has entered a prompt
if user_prompt and "vectors" in st.session_state:
    try:
        # Instantiate the OpenAI model
        llm = ChatOpenAI(api_key=openai_api_key, model_name="gpt-4o")
        
        # Create retrieval chain
        document_chain = create_stuff_documents_chain(llm, prompt)
        retriever = st.session_state.vectors.as_retriever()
        retrieval_chain = create_retrieval_chain(retriever, document_chain)
        
        # Get response
        with st.spinner("Generating response..."):
            start = time.process_time()
            response = retrieval_chain.invoke({'input': user_prompt})
            elapsed = time.process_time() - start
            
            # Display response
            st.write(response['answer'])
            st.caption(f"Response time: {elapsed:.2f} seconds")
            
            # Use a Streamlit expander to show context documents
            with st.expander("Document similarity Search"):
                for i, doc in enumerate(response['context']):
                    st.markdown(f"**Document {i+1}:**")
                    st.write(doc.page_content)
                    st.write('------------------------')
    
    except Exception as e:
        st.error(f"Error processing query: {str(e)}")
elif user_prompt:
    st.warning("Please click 'Document Embedding' before querying.")