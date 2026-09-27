"""Tenant isolation must fail closed when no project context is established.

A missing project context used to fall back to the ``"protab"`` project and to
an unfiltered ``SELECT``, which silently exposed every tenant's scopes. The
adapters must now refuse to read or write instead.
"""

import pytest

from protab.adapters.outbound.persistence.postgres_scope_monitoring_repository import (
    MissingProjectContextError,
    require_current_project,
    reset_current_project,
    set_current_project,
)


def test_returns_the_established_project():
    token = set_current_project("project-alpha")
    try:
        assert require_current_project() == "project-alpha"
    finally:
        reset_current_project(token)


def test_raises_when_no_context_is_established():
    with pytest.raises(MissingProjectContextError):
        require_current_project()
