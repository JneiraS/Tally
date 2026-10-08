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


class InvalidKoReasonError(DomainError):
    """Raised when a KO reason is given for a day that is not marked as KO."""


class KoReasonTooLongError(DomainError):
    """Raised when a KO reason exceeds the domain's own bound."""


__all__ = [
    "NegativeErrorsCountError",
    "NegativeIncidentsCountError",
    "IncidentsExceedErrorsError",
    "InvalidFeaiReferenceError",
    "DuplicateFeaiReferenceError",
    "InvalidKoReasonError",
    "KoReasonTooLongError",
]
