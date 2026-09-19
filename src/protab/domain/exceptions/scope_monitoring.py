from .domain_error import DomainError


class InvalidKnowledgeBaseIdError(DomainError):
    """Raised when a KnowledgeBase id does not meet the minimum length requirement."""


class EmptyOfficialsError(DomainError):
    """Raised when main or backup officials are not provided or are blank."""


class DuplicateDailyActivityError(DomainError):
    """Raised when a ScopeMonitoring already has a DailyActivity for the given day."""