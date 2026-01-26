import logging
import os
import sys
from concurrent import futures

import grpc
from dotenv import load_dotenv

# Add parent directory to path to import shared protos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.proto import resume_pb2
from shared.proto import resume_pb2_grpc
from rag.vector_store import VectorStoreManager

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ResumeService(resume_pb2_grpc.ResumeServiceServicer):
    def __init__(self):
        self.vector_store = VectorStoreManager()

    def TailorResume(self, request, context):
        logger.info(f"Received TailorResume request for: {request.original_resume.full_name}")
        
        # 1. Simulate RAG: Query vector DB for relevant experience (Placeholder for now)
        relevant_chunks = self.vector_store.query_similar_experience(request.job_description)
        context_str = "\n".join(relevant_chunks) if relevant_chunks else "No specific context found."

        # 2. Placeholder logic (LLM Simulation)
        tailored_resume = resume_pb2.ResumeData(
            full_name=request.original_resume.full_name,
            email=request.original_resume.email,
            skills=list(request.original_resume.skills) + ["AI-Enhanced"],
            summary=f"Tailored using context: {context_str[:30]}... for Job: {request.job_description[:20]}..."
        )
        
        return resume_pb2.TailorResponse(
            tailored_resume=tailored_resume,
            cover_letter="Generated cover letter placeholder."
        )

def serve():
    load_dotenv()
    port = os.getenv("RAG_SERVICE_PORT", "50051")
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    resume_pb2_grpc.add_ResumeServiceServicer_to_server(ResumeService(), server)
    server.add_insecure_port(f'[::]:{port}')
    logger.info(f"RAG Service started on port {port}")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
