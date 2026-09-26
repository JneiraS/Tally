"""Parsing of the officials columns that gate the quadrigramme.

Both ``official_main`` and ``official_backup`` may hold several codes separated
by ``/``, and the real data uses ``?`` as a human placeholder for "no backup
official". A placeholder must never become a usable login code.
"""

from protab.adapters.outbound.persistence.postgres_auth_repository import (
    _official_codes,
)


def test_splits_multiple_codes():
    assert _official_codes("MLOZ/MRAM") == {"MLOZ", "MRAM"}


def test_strips_spaces_and_uppercases():
    assert _official_codes(" mloz / MRAM ") == {"MLOZ", "MRAM"}


def test_placeholder_is_not_a_code():
    """``MRAM/ ?`` means "MRAM, no backup": ``?`` is not a quadrigramme."""
    assert _official_codes("MRAM/ ?") == {"MRAM"}


def test_ignores_punctuation_only_parts():
    assert _official_codes("ABCD / - / //") == {"ABCD"}


def test_handles_empty_and_none():
    assert _official_codes(None) == set()
    assert _official_codes("") == set()
    assert _official_codes("  /  ") == set()
