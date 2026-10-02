from .domain_error import DomainError


class InvalidKnowledgeBaseIdError(DomainError):
    """Raised when a KnowledgeBase id does not meet the minimum length requirement."""


class EmptyOfficialsError(DomainError):
    """Raised when main or backup officials are not provided or are blank."""


class EmptyBillingCodeError(DomainError):
    """Raised when a ScopeMonitoring is created without a billing code."""


class DuplicateDailyActivityError(DomainError):
    """Raised when a ScopeMonitoring already has a DailyActivity for the given day."""


class InvalidScopeMonitoringIdError(DomainError):
    """Raised when a ScopeMonitoring id is empty or blank."""


class ScopeMonitoringNotFoundError(DomainError):
    """Raised when a ScopeMonitoring cannot be found for the given id."""


class DailyActivityNotFoundError(DomainError):
    """Raised when a DailyActivity cannot be found for the given day."""


class ScopeMonitoringNameAlreadyExistsError(DomainError):
    """Raised when a ScopeMonitoring with the same name already exists."""


class ScopeMonitoringAlreadyExistsError(DomainError):
    """Raised when a creation targets a ScopeMonitoring id that is already taken.

    Distinct from the name clash: the id is the identity of the row, so a
    creation must refuse it rather than merge into what is stored under it.
    """


class NoteTooLongError(DomainError):
    """Raised when a scope note exceeds the maximum accepted length."""
