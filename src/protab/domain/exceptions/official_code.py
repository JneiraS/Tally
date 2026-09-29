from .domain_error import DomainError


class InvalidOfficialCodeError(DomainError):
    """Raised when an official code cannot be used as a single login identity."""
