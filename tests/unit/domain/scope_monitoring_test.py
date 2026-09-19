import pytest

from protab.domain.entities.scope_monitoring import (
    KnowledgeBase,
    Officials,
    ScopeMonitoring,
)
from protab.domain.exceptions import (
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
)


@pytest.fixture
def fixture_scope_monitoring():
    knowledge_base = KnowledgeBase(id="Test Knowledge")
    officials = Officials(main="Official", backup="Secondary Official")
    monitoring = ScopeMonitoring(
        name="Test Monitoring", knowledge=knowledge_base, officials=officials
    )
    return monitoring


def test_scope_monitoring_creation(fixture_scope_monitoring):
    monitoring = fixture_scope_monitoring
    assert monitoring.name == "Test Monitoring"
    assert isinstance(monitoring.knowledge.id, str)
    assert monitoring.officials.main == "Official"
    assert monitoring.officials.backup == "Secondary Official"


# test pour les exceptions
def test_knowledge_base_id_length():
    with pytest.raises(InvalidKnowledgeBaseIdError) as excinfo:
        KnowledgeBase(id="short")
    assert "KnowledgeBase id must be at least 10 characters long." in str(excinfo.value)


def test_knowledge_base_id_valid_boundary():
    # exactly 10 chars should pass
    kb = KnowledgeBase(id="a" * 10)
    assert kb.id == "a" * 10


def test_officials_empty_main():
    with pytest.raises(EmptyOfficialsError) as excinfo:
        Officials(main="", backup="Backup")
    assert "Both main and backup officials must be provided." in str(excinfo.value)


def test_officials_empty_backup():
    with pytest.raises(EmptyOfficialsError) as excinfo:
        Officials(main="Main", backup="")
    assert "Both main and backup officials must be provided." in str(excinfo.value)


def test_officials_blank_strings_rejected():
    # whitespace-only strings should be treated as empty
    with pytest.raises(EmptyOfficialsError):
        Officials(main=" ", backup="Backup")
    with pytest.raises(EmptyOfficialsError):
        Officials(main="Main", backup=" ")