"""Who may act as a project administrator.

``project_admins`` is the storage; this port is the only way the application
asks about it. The lookup runs against the database on every call — never a
role flag carried by the session, which would stay valid for the remaining
session lifetime even after a ``remove-admin`` (the session lives 12 h, and
``authenticate()`` only runs at login).
"""

from typing import Protocol


class AdminDirectory(Protocol):
    def is_current_project_admin(self, code: str) -> bool:
        """Whether ``code`` is an administrator of the current project.

        The project is resolved by the adapter from the per-request context, so
        the caller — and the port — stays unaware of how tenancy propagates.
        Missing context is the adapter's business.

        Normalization only, no validation: this is a lookup, and a code the
        login screen would reject is simply not an administrator.
        """
        ...
