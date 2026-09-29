"""``OfficialCode`` is the single-code form of an official identity.

A project administrator is one row in ``project_admins``, so one code. Unlike
``Officials``, which reads ``"A/B"`` lists, this value object never accepts a
separator: the whole string must be the code, or the row is unreachable.
"""

import pytest

from protab.domain.exceptions import InvalidOfficialCodeError
from protab.domain.value_objects.official_code import OfficialCode


def test_value_is_uppercased():
    assert OfficialCode("mloz").value == "MLOZ"


def test_surrounding_whitespace_is_trimmed():
    assert OfficialCode("  mloz  ").value == "MLOZ"


def test_inner_spaces_are_kept():
    """Only the ends are noise; a space inside is part of the identity."""
    assert OfficialCode(" mlo z ").value == "MLO Z"


def test_a_two_character_code_is_accepted():
    """``LoginRequest.quadrigramme`` allows two characters, so we must too."""
    assert OfficialCode("AB").value == "AB"


def test_a_list_separator_is_rejected():
    """``A/B`` is the Officials form; as an admin code it could never be typed
    back as a single matching value, so it must be refused at the door."""
    with pytest.raises(InvalidOfficialCodeError):
        OfficialCode("MLOZ/MRAM")


def test_a_lone_separator_is_rejected():
    with pytest.raises(InvalidOfficialCodeError):
        OfficialCode("/")


def test_a_substitute_character_is_rejected():
    """``?`` means "no backup official" in the scope columns; it is not a code."""
    with pytest.raises(InvalidOfficialCodeError):
        OfficialCode("?")


def test_an_alphanumeric_free_string_is_rejected():
    with pytest.raises(InvalidOfficialCodeError):
        OfficialCode(" - ")


def test_a_one_character_code_is_rejected():
    with pytest.raises(InvalidOfficialCodeError):
        OfficialCode("A")


def test_a_twenty_character_code_is_accepted():
    assert OfficialCode("A" * 20).value == "A" * 20


def test_a_twentyone_character_code_is_rejected():
    """``LoginRequest.quadrigramme`` caps at 20; a longer admin could never
    be typed at the login screen."""
    with pytest.raises(InvalidOfficialCodeError):
        OfficialCode("A" * 21)


def test_an_empty_code_is_rejected():
    with pytest.raises(InvalidOfficialCodeError):
        OfficialCode("   ")


def test_equality_compares_on_the_normalized_value():
    assert OfficialCode(" mloz ") == OfficialCode("MLOZ")
    assert OfficialCode("MLOZ") != OfficialCode("MRAM")


def test_existing_code_value_is_accepted():
    """Re-normalizing an already valid code must stay a no-op, or the CLI could
    not round-trip a value it just read back from the database."""
    code = OfficialCode("MLOZ")

    assert OfficialCode(code.value) == code
