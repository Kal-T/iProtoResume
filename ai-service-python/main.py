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

class ResumeService(resume_pb2_grpc.AIServiceServicer):
    def __init__(self):
        self.vector_store = VectorStoreManager()

    def TailorResume(self, request, context):
        logger.info(f"Received TailorResume request for: {request.original_resume.full_name}")
        
        try:
            llm = LLMFactory.create_llm(provider="gemini")
            
            # --- 1. Prepare Data ---
            # Convert Proto to Dict for easier handling in prompt
            from google.protobuf import json_format
            resume_dict = json_format.MessageToDict(request.original_resume, preserving_proto_field_name=True)
            
            # --- 2. Construct Prompt with Style Guidelines ---
            system_instruction = """
            You are an expert Resume Writer with 20 years of experience in ATS optimization.
            Your goal is to rewrite the resume content to perfectly match the provided Job Description (JD).
            
            ### STYLE GUIDELINES (STRICTLY FOLLOW)
            1. **Tone**: Professional, confident, and active.
            2. **Action Verbs**: Start every bullet point with a strong action verb (e.g., "Architected", "Deployed", "Optimized").
            3. **Quantifiable Results**: Whenever possible, include metrics (e.g., "Reduced latency by 40%", "Increased revenue by $1M").
            4. **Conciseness**: Remove fluff. Be direct.
            5. **Keywords**: Naturally integrate keywords from the JD.
            
            ### OUTPUT FORMAT
            You must output a VALID JSON object that matches the structure of the input resume data.
            Do NOT encompass the JSON in markdown code blocks. Just valid JSON.
            
            The JSON must include the following tailored fields:
            - "summary": A compelling professional summary (max 4 lines).
            - "skills": A list of strings, prioritized by relevance to the JD.
            - "cover_letter": A professional cover letter (3 paragraphs) addressed to the Hiring Manager, tailored to the JD.
            - "experience": A list of experience objects. Use the exact same structure as input. 
            For "description": Rewrite it to highlight relevant achievements. 
            CRITICAL: The description MUST be formatted as a single string where EACH bullet point starts with "* ". 
            Example: "* Architected a scalable microservices system.\n* Reduced AWS costs by 40%."

            Do NOT invent new jobs. Only rewrite the content of the existing ones.
            """
            
            human_instruction = f"""
            ### IO DATA
            
            **Job Description**:
            {request.job_description}
            
            **Original Resume Data (JSON)**:
            {resume_dict}
            
            ### TASK
            Rewrite the 'summary', 'skills', and 'experience' sections based on the Style Guidelines and JD.
            Return ONLY the JSON.
            """
            
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [
                SystemMessage(content=system_instruction),
                HumanMessage(content=human_instruction)
            ]
            
            # --- 3. Call LLM ---
            logger.info("Sending request to LLM...")
            response = llm.invoke(messages)
            
            # --- 4. Parse Response ---
            import json
            import re
            
            content = response.content
            # Handle list format (newer LangChain returns content blocks)
            if isinstance(content, list):
                content = "".join(
                    part.get('text', '') if isinstance(part, dict) else str(part) 
                    for part in content
                )
            # Strip markdown code blocks if present
            content = re.sub(r'```json\n|\n```', '', str(content)).strip()
            content = re.sub(r'```\n|\n```', '', content).strip()
            
            logger.info("Parsing LLM response...")
            try:
                tailored_data = json.loads(content)
            except json.JSONDecodeError as je:
                logger.error(f"JSON Decode Error: {je}. Content: {content[:100]}...")
                raise ValueError("Failed to parse AI response as JSON")

            # --- 5. Merge & Return ---
            # We create a new dict merging original with tailored
            merged_resume = resume_dict.copy()
            merged_resume.update(tailored_data)
            
            # Convert back to Proto
            tailored_resume_proto = resume_pb2.ResumeData()
            json_format.ParseDict(merged_resume, tailored_resume_proto, ignore_unknown_fields=True)
            
            return resume_pb2.TailorResponse(
                tailored_resume=tailored_resume_proto,
                cover_letter=tailored_data.get("cover_letter", "Cover letter generation failed.")
            )

        except Exception as e:
            logger.error(f"Error tailoring resume: {str(e)}")
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return resume_pb2.TailorResponse()

    def AnalyzeResume(self, request, context):
        logger.info(f"Received AnalyzeResume request")
        
        try:
            llm = LLMFactory.create_llm(provider="gemini")
            
            # --- 1. Prepare Data ---
            from google.protobuf import json_format
            resume_dict = json_format.MessageToDict(request.resume, preserving_proto_field_name=True)
            
            # --- 2. Construct Prompt ---
            system_instruction = """
            You are an expert ATS (Applicant Tracking System) Auditor.
            Your task is to evaluate a resume against a Job Description (JD) and provide a strict semantic analysis.
            
            ### CRITERIA
            1. **Relevance**: How well do the skills and experience match the JD?
            2. **Impact**: Does the resume use action verbs and metrics?
            3. **Keyword Matching**: Are critical hard skills present (even if synonyms are used)?
            
            ### OUTPUT FORMAT
            Return a purely valid JSON object with the following fields:
            - "score": Integer (0-100).
            - "reasoning": A concise paragraph (max 3 sentences) explaining the score. Focus on the 'Why'.
            - "feedback": A list of strings (3-5 items) with specific actionable advice.
            - "missing_keywords": A list of strings (hard skills/technologies) found in JD but missing in Resume.
            
            Ensure the JSON is valid. Do not use markdown blocks.
            """
            
            human_instruction = f"""
            ### JOB DESCRIPTION
            {request.job_description}
            
            ### RESUME DATA
            {resume_dict}
            """
            
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [
                SystemMessage(content=system_instruction),
                HumanMessage(content=human_instruction)
            ]
            
            # --- 3. Call LLM ---
            logger.info("Sending Analysis request to LLM...")
            response = llm.invoke(messages)
            
            # --- 4. Parse Response ---
            import json
            import re
            
            content = response.content
            if isinstance(content, list):
                content = "".join(part.get('text', '') if isinstance(part, dict) else str(part) for part in content)
            
            content = re.sub(r'```json\n|\n```', '', str(content)).strip()
            content = re.sub(r'```\n|\n```', '', content).strip()
            
            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                # Fallback if JSON fails
                logger.error("Failed to parse Analysis JSON")
                data = {"score": 0, "reasoning": "Analysis failed", "feedback": [], "missing_keywords": []}

            return resume_pb2.AnalyzeResumeResponse(
                score=data.get("score", 0),
                reasoning=data.get("reasoning", "No reasoning provided"),
                feedback=data.get("feedback", []),
                missing_keywords=data.get("missing_keywords", [])
            )

        except Exception as e:
            logger.error(f"Error analyzing resume: {str(e)}")
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return resume_pb2.AnalyzeResumeResponse()

    def GenerateInterviewQuestions(self, request, context):
        logger.info(f"Received GenerateInterviewQuestions request")
        
        try:
            llm = LLMFactory.create_llm(provider="gemini")
            
            from google.protobuf import json_format
            resume_dict = json_format.MessageToDict(request.resume, preserving_proto_field_name=True)
            
            system_instruction = """
            You are an expert Technical Interviewer. 
            Based on the candidate's Resume and the Job Description, generate a list of 10 targeted interview questions.
            
            ### MIX OF QUESTIONS
            - 4 Technical (Hard Skills/Coding/System Design relevant to the role).
            - 4 Behavioral (STAR method based on their experience).
            - 2 Soft Skills/Cultural Fit.
            
            ### OUTPUT FORMAT
            Return a VALID JSON object with a single key "questions", which is a list of objects.
            Structure:
            {
              "questions": [
                {
                  "question": "...",
                  "type": "Technical",
                  "answer_guide": "STRATEGY: Mention Redis and async. EXAMPLE FROM RESUME: Refer to your time at [Company] where you optimized API latency by 40%."
                },
                ...
              ]
            }
            
            ### CONTENT RULES
            - **Question**: Must be relevant to the JD and Resume.
            - **Answer Guide**: Must have two parts:
              1. **Strategy**: What concepts to cover.
              2. **Personal Example**: A specific project or achievement from the CANDIDATE'S RESUME that answers this question. Use specific metrics/technologies from their background.
            """
            
            human_instruction = f"""
            ### JOB DESCRIPTION
            {request.job_description}
            
            ### RESUME
            {resume_dict}
            """
            
            from langchain_core.messages import SystemMessage, HumanMessage
            messages = [
                SystemMessage(content=system_instruction),
                HumanMessage(content=human_instruction)
            ]
            
            logger.info("Generating Interview Questions...")
            response = llm.invoke(messages)
            
            import json
            import re
            
            content = response.content
            if isinstance(content, list):
                content = "".join(part.get('text', '') if isinstance(part, dict) else str(part) for part in content)
            
            content = re.sub(r'```json\n|\n```', '', str(content)).strip()
            content = re.sub(r'```\n|\n```', '', content).strip()
            
            data = json.loads(content)
            questions_list = data.get("questions", [])
            
            response_proto = resume_pb2.InterviewPrepResponse()
            for q in questions_list:
                response_proto.questions.append(resume_pb2.InterviewQuestion(
                    question=q.get("question", ""),
                    type=q.get("type", "General"),
                    answer_guide=q.get("answer_guide", "")
                ))
                
            return response_proto

        except Exception as e:
            logger.error(f"Error generating interview questions: {str(e)}")
            context.set_details(str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return resume_pb2.InterviewPrepResponse()

from config import settings

def serve():
    # settings is already initialized and environment loaded
    port = settings.PORT
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    resume_pb2_grpc.add_AIServiceServicer_to_server(ResumeService(), server)
    server.add_insecure_port(f'[::]:{port}')
    logger.info(f"RAG Service started on port {port}")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
