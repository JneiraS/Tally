"""The bootstrap secrets must never fall back to a hardcoded default.

A missing ``PROTAB_DEFAULT_PROJECT_PASSWORD`` has to stop the API instead of
silently creating a project protected by a well-known credential. The same
goes for ``PROTAB_DEFAULT_PROJECT_ADMIN_CODE``: a project created without an
administrator cannot be reached again by anyone once it owns a scope, because
``authenticate()`` only accepts a quadrigramme declared by one.
"""

import pytest

from protab.adapters.outbound.persistence.postgres_auth_repository import (
    resolve_bootstrap_admin_code,
    resolve_bootstrap_password,
)


def test_returns_the_configured_password(monkeypatch):
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_PASSWORD", "s3cr3t-from-env")

    assert resolve_bootstrap_password() == "s3cr3t-from-env"


def test_trims_surrounding_whitespace(monkeypatch):
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_PASSWORD", "  s3cr3t  ")

    assert resolve_bootstrap_password() == "s3cr3t"


def test_missing_variable_raises(monkeypatch):
    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_PASSWORD", raising=False)

    with pytest.raises(RuntimeError, match="PROTAB_DEFAULT_PROJECT_PASSWORD"):
        resolve_bootstrap_password()


def test_blank_variable_raises(monkeypatch):
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_PASSWORD", "   ")

    with pytest.raises(RuntimeError, match="PROTAB_DEFAULT_PROJECT_PASSWORD"):
        resolve_bootstrap_password()


def test_returns_the_configured_admin_code(monkeypatch):
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", "MLOZ")

    assert resolve_bootstrap_admin_code() == "MLOZ"


def test_admin_code_trims_surrounding_whitespace(monkeypatch):
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", "  MLOZ  ")

    assert resolve_bootstrap_admin_code() == "MLOZ"


def test_missing_admin_code_raises(monkeypatch):
    monkeypatch.delenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", raising=False)

    with pytest.raises(RuntimeError, match="PROTAB_DEFAULT_PROJECT_ADMIN_CODE"):
        resolve_bootstrap_admin_code()


def test_blank_admin_code_raises(monkeypatch):
    monkeypatch.setenv("PROTAB_DEFAULT_PROJECT_ADMIN_CODE", "   ")

    with pytest.raises(RuntimeError, match="PROTAB_DEFAULT_PROJECT_ADMIN_CODE"):
        resolve_bootstrap_admin_code()
