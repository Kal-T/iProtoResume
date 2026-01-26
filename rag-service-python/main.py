import logging
import os
import sys
from concurrent import futures

import grpc

# Add parent directory to path to import shared protos
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shared.proto import resume_pb2
from shared.proto import resume_pb2_grpc
from rag.vector_store import VectorStoreManager
from rag.llm_factory import LLMFactory
from langchain_core.prompts import PromptTemplate

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ResumeService(resume_pb2_grpc.ResumeServiceServicer):
    def __init__(self):
        self.vector_store = VectorStoreManager()

    def TailorResume(self, request, context):
        logger.info(f"Received TailorResume request for: {request.original_resume.full_name}")
        
        # 1. RAG Retrieval 
        # (For MVP, we use the input JD directly as context if vector store is empty, 
        # but in a real app we'd query resume chunks. Here we'll pass the whole resume for tailoring)
        
        # 2. LLM Generation
        try:
            llm = LLMFactory.create_llm(provider="gemini") # Defaulting to Gemini
            
            prompt_template = """
            You are an expert Resume Writer. 
            Tailor the following resume summary and skills to match the job description.
            
            Original Resume Summary: {summary}
            Original Skills: {skills}
            
            Job Description: {job_description}
            
            Output strictly in this format:
            Summary: <Optimized Summary>
            Skills: <Comma separated list of top 5 relevant skills>
            """
            
            prompt = PromptTemplate(
                input_variables=["summary", "skills", "job_description"],
                template=prompt_template
            )
            
            chain = prompt | llm
            
            # Ensure valid values (avoid None/empty that might cause type errors)
            summary = request.original_resume.summary if request.original_resume.summary else "No summary provided"
            skills = ", ".join(request.original_resume.skills) if request.original_resume.skills else "No skills provided"
            job_desc = request.job_description if request.job_description else "No job description provided"
            
            response = chain.invoke({
                "summary": summary,
                "skills": skills,
                "job_description": job_desc
            })
            
            
            # Extract text from response (handle both string and structured formats)
            raw_content = response.content
            
            # If content is a list of dicts (newer LangChain format)
            if isinstance(raw_content, list):
                content = ""
                for part in raw_content:
                    if isinstance(part, dict) and 'text' in part:
                        content += part['text']
                    elif isinstance(part, str):
                        content += part
                content = content.strip()
            else:
                content = str(raw_content).strip()
            
            logger.info(f"Raw AI Response: {content[:200]}...")  # Log first 200 chars
            
            # Parse response with more flexible handling
            new_summary = ""
            new_skills = []
            
            try:
                if "Summary:" in content and "Skills:" in content:
                    parts = content.split("Skills:", 1)  # Split only once
                    new_summary = str(parts[0].replace("Summary:", "").strip())
                    
                    # Parse skills
                    skills_text = parts[1].strip()
                    # Remove any trailing periods, newlines, etc.
                    skills_text = skills_text.split('\n')[0].strip()
                    new_skills = [str(s.strip()) for s in skills_text.split(",") if s.strip()]
                    
                    logger.info(f"Parsed Summary: {new_summary[:50]}...")
                    logger.info(f"Parsed Skills: {new_skills}")
                elif "Summary:" in content:
                    # Only summary found
                    new_summary = str(content.replace("Summary:", "").strip())[:500]
                    new_skills = ["General"]
                else:
                    # No expected format, use raw content
                    new_summary = str(content).strip()[:500]
                    new_skills = ["AI Generated"]
                
                # Ensure we have valid values
                if not new_summary or len(new_summary) < 10:
                    new_summary = "AI-tailored professional summary optimized for the target role."
                if not new_skills or len(new_skills) == 0:
                    new_skills = ["AI Skill"]
                    
            except Exception as parse_error:
                logger.error(f"Parsing error: {parse_error}")
                new_summary = "Error parsing AI response"
                new_skills = ["AI Skill"]
            
            # Ensure all values are valid strings
            tailored_resume = resume_pb2.ResumeData(
                full_name=str(request.original_resume.full_name),
                email=str(request.original_resume.email),
                summary=new_summary
            )
            # Add skills one by one to avoid type issues
            for skill in new_skills:
                tailored_resume.skills.append(str(skill))
            
            return resume_pb2.TailorResponse(
                tailored_resume=tailored_resume,
                cover_letter="Cover letter generation pending..."
            )
            
        except Exception as e:
            logger.error(f"AI Error: {e}")
            # Fallback to echo if AI fails
            tailored_resume = resume_pb2.ResumeData(
                full_name=request.original_resume.full_name,
                email=request.original_resume.email,
                skills=list(request.original_resume.skills) + ["AI-Offline"],
                summary=f"Error generating AI content: {str(e)}"
            )
            return resume_pb2.TailorResponse(
                tailored_resume=tailored_resume,
                cover_letter="Error generating cover letter."
            )

from config import settings

def serve():
    # settings is already initialized and environment loaded
    port = settings.PORT
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    resume_pb2_grpc.add_ResumeServiceServicer_to_server(ResumeService(), server)
    server.add_insecure_port(f'[::]:{port}')
    logger.info(f"RAG Service started on port {port}")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
