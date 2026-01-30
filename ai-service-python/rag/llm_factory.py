import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from config import settings

logger = logging.getLogger(__name__)

class LLMFactory:
    @staticmethod
    def create_llm(provider: str = None):
        # Use configured provider if none specified
        if not provider:
            provider = settings.AI_PROVIDER
            
        provider = provider.lower()
        
        # Determine model name: use env var if set, otherwise default
        model_name = settings.AI_MODEL
        
        if provider == "gemini":
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not found in environment variables")
            
            target_model = model_name if model_name else "gemini-1.5-flash"
            logger.info(f"Initializing Gemini ({target_model})")
            return ChatGoogleGenerativeAI(model=target_model, google_api_key=settings.GEMINI_API_KEY, temperature=0.7)
            
        elif provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            
            target_model = model_name if model_name else "gpt-3.5-turbo"
            logger.info(f"Initializing OpenAI ({target_model})")
            return ChatOpenAI(model=target_model, openai_api_key=settings.OPENAI_API_KEY, temperature=0.7)
            
        elif provider == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
            
            target_model = model_name if model_name else "claude-3-sonnet-20240229"
            logger.info(f"Initializing Anthropic ({target_model})")
            return ChatAnthropic(model=target_model, anthropic_api_key=settings.ANTHROPIC_API_KEY, temperature=0.7)
            
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
