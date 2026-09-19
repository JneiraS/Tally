from .domain_error import DomainError


class NegativeErrorsCountError(DomainError):
    """Raised when errors_reported is negative."""


class NegativeIncidentsCountError(DomainError):
    """Raised when incidents_created is negative."""


class IncidentsExceedErrorsError(DomainError):
    """Raised when incidents_created exceeds errors_reported."""


class InvalidFeaiReferenceError(DomainError):
    """Raised when a FEAI reference does not match the expected format."""


class DuplicateFeaiReferenceError(DomainError):
    """Raised when a FEAI reference is duplicated within the same activity."""


__all__ = [
    "NegativeErrorsCountError",
    "NegativeIncidentsCountError",
    "IncidentsExceedErrorsError",
    "InvalidFeaiReferenceError",
    "DuplicateFeaiReferenceError",
]