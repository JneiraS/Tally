from .domain_error import DomainError


class InvalidKnowledgeBaseIdError(DomainError):
    """Raised when a KnowledgeBase id does not meet the minimum length requirement."""


class EmptyOfficialsError(DomainError):
    """Raised when main or backup officials are not provided or are blank."""