import logging
import sys
from pydantic import BaseModel

class LogConfig(BaseModel):
    """Logging configuration to be set for the server"""

    LOGGER_NAME: str = "athenaos"
    LOG_FORMAT: str = "%(levelprefix)s | %(asctime)s | %(message)s"
    LOG_LEVEL: str = "DEBUG"

    # Logging config
    version: int = 1
    disable_existing_loggers: bool = False
    formatters: dict = {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": LOG_FORMAT,
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    }
    handlers: dict = {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
    }
    loggers: dict = {
        "athenaos": {"handlers": ["default"], "level": LOG_LEVEL},
    }

def setup_logging():
    from logging.config import dictConfig
    dictConfig(LogConfig().model_dump())
    logger = logging.getLogger("athenaos")
    logger.info("AthenaOS Logger Initialized")
    return logger

logger = setup_logging()
