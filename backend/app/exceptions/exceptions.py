from dataclasses import dataclass
from typing import Any, Optional

@dataclass(slots=True)
class DomainError(Exception):
    message: str
    code: str = "domain_error"
    entity: Optional[str] = None
    identifier: Any = None

    def __str__(self) -> str:
        return self.message


class NotFound(DomainError):
    def __init__(self, entity: str, identifier: Any = None, message: str | None = None):
        super().__init__(
            message or f"{entity} not found",
            code="not_found",
            entity=entity,
            identifier=identifier,
        )


class AlreadyExists(DomainError):
    def __init__(self, entity: str, identifier: Any = None, message: str | None = None):
        super().__init__(
            message or f"{entity} already exists",
            code="already_exists",
            entity=entity,
            identifier=identifier,
        )


class StatusError(DomainError):
    def __init__(self, entity: str, identifier: Any = None, message: str | None = None):
         super().__init__(
            message or f"{entity} has wrong status",
            code="status_error",
            entity=entity,
            identifier=identifier,
        )

class Unauthorized(DomainError):
    def __init__(self, message: str | None = None):
        super().__init__(
            message or "Unauthorized", 
            code="unauthorized")


class Forbidden(DomainError):
    def __init__(self, message: str | None = None):
        super().__init__(
            message or "Forbidden", 
            code="forbidden")


class ValidationError(DomainError):
    def __init__(self, message: str, field: str | None = None):
        super().__init__(message, code="validation_error", entity=field)
        
