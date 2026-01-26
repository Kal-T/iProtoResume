import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from config import settings

logger = logging.getLogger(__name__)

class LLMFactory:
    @staticmethod
    def create_llm(provider: str = "gemini"):
        provider = provider.lower()
        
        if provider == "gemini":
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not found in environment variables")
            logger.info("Initializing Gemini 1.5 Flash")
            return ChatGoogleGenerativeAI(model="gemini-3-flash-preview", google_api_key=settings.GEMINI_API_KEY, temperature=0.7)
            
        elif provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            logger.info("Initializing GPT-3.5 Turbo")
            return ChatOpenAI(model="gpt-3.5-turbo", openai_api_key=settings.OPENAI_API_KEY, temperature=0.7)
            
        elif provider == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
            logger.info("Initializing Claude 3 Sonnet")
            return ChatAnthropic(model="claude-3-sonnet-20240229", anthropic_api_key=settings.ANTHROPIC_API_KEY, temperature=0.7)
            
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
