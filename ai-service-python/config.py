import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Config, cls).__new__(cls)
            cls._instance._load_config()
        return cls._instance

    def _load_config(self):
        # Load .env from project root (one level up from ai-service-python)
        # file is at ai-service-python/config.py
        base_dir = os.path.dirname(os.path.abspath(__file__)) # ai-service-python
        root_dir = os.path.dirname(base_dir) # iProtoResume root
        env_path = os.path.join(root_dir, '.env')
        
        load_dotenv(env_path)
        logger.info(f"Loaded configuration from: {env_path}")

        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
        
        # New Dynamic Config
        self.AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()
        self.AI_MODEL = os.getenv("AI_MODEL")  # If None, factory uses default

        self.PORT = os.getenv("RAG_SERVICE_PORT", "50051")
        self.CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", os.path.join(base_dir, "chroma_db"))

# Global config instance
settings = Config()
