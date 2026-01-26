import chromadb
import os
import logging
from typing import List

logger = logging.getLogger(__name__)

class VectorStoreManager:
    def __init__(self):
        # Use persistent storage for local dev
        self.persist_directory = os.path.join(os.path.dirname(__file__), "../chroma_db")
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        
        # Collection for Resumes
        self.collection = self.client.get_or_create_collection(
            name="resumes",
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"ChromaDB initialized at {self.persist_directory}")

    def add_job_description(self, job_id: str, text: str):
        """
        Store job description to compare against (Simulated for this MVP, 
        usually we store the Resume and query with the Job Description)
        """
        # For RAG tailoring, we usually:
        # 1. Store the User's master resume experiences as chunks.
        # 2. Query those chunks using the Job Description.
        # 3. Feed retrieved chunks to LLM.
        pass

    def store_resume_chunks(self, resume_id: str, chunks: List[str]):
        """
        Store resume experience sections as vectors.
        """
        ids = [f"{resume_id}_{i}" for i in range(len(chunks))]
        self.collection.add(
            documents=chunks,
            ids=ids,
            metadatas=[{"source": "resume", "resume_id": resume_id} for _ in chunks]
        )
        logger.info(f"Stored {len(chunks)} chunks for resume {resume_id}")

    def query_similar_experience(self, query_text: str, n_results: int = 3) -> List[str]:
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        # Chroma returns list of lists (one for each query)
        if results and results['documents']:
            return results['documents'][0]
        return []
