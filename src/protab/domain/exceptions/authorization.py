from .domain_error import DomainError


class NotProjectAdminError(DomainError):
    """Raised when a quadrigramme that is not a project administrator
    attempts an administrator-only action.

    Raised *before* any lookup, on purpose: a 404 would let a non-admin probe
    which scope ids exist. Translated as ``403`` at the API boundary.
    """
