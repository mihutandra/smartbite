from logging.config import dictConfig

LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
# eg: 2025-12-11 08:29:40,675 [INFO] appLogger - okay!!

def setup_logging():
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": LOG_FORMAT,
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                },
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "formatter": "default",
                    "filename": "app.log",
                    "encoding": "utf-8",
                    "maxBytes": 1_000_000,   # ~1 MB per file
                    "backupCount": 5,        # keep last 5 log files: app.log.1 ... app.log.5
                },
            },
            "root": {
                "level": "INFO",
                "handlers": ["console", "file"],
            },
        }
    )
