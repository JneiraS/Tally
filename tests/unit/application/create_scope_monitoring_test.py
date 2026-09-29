import pytest

from protab.adapters.outbound.persistence.in_memory_scope_monitoring_repository import (
    InMemoryScopeMonitoringRepository,
)
from protab.application.commands.create_scope_monitoring import (
    CreateScopeMonitoringCommand,
)
from protab.application.use_cases.create_scope_monitoring import (
    CreateScopeMonitoringUseCase,
)
from protab.domain.exceptions import (
    EmptyBillingCodeError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
    ScopeMonitoringNameAlreadyExistsError,
)

from tests.unit.application.recording_repository import (
    RecordingScopeMonitoringRepository,
)


def make_command(
    name="Scope A",
    knowledge_base_id="KB-00000001",
    official_main="Main",
    official_backup="Backup",
    billing_code="FACT-2026-PAI",
):
    return CreateScopeMonitoringCommand(
        name=name,
        knowledge_base_id=knowledge_base_id,
        official_main=official_main,
        official_backup=official_backup,
        billing_code=billing_code,
    )


def test_create_multiple_scope_monitorings():
    repo = InMemoryScopeMonitoringRepository()
    use_case = CreateScopeMonitoringUseCase(repo)

    ids = use_case.execute(
        [make_command(name="Scope A"), make_command(name="Scope B")]
    )

    assert len(ids) == 2
    assert len(set(ids)) == 2
    assert repo.find_by_id(ids[0]) is not None
    assert repo.find_by_id(ids[1]) is not None


def test_create_duplicate_name_raises_and_persists_nothing():
    repo = InMemoryScopeMonitoringRepository()
    use_case = CreateScopeMonitoringUseCase(repo)

    use_case.execute([make_command(name="Scope A")])

    with pytest.raises(ScopeMonitoringNameAlreadyExistsError):
        use_case.execute(
            [
                make_command(name="Scope B"),
                make_command(name="Scope A"),
            ]
        )

    # Atomicity: Scope B was not persisted
    assert repo.find_by_id("scope-b-id") is None
    assert repo.find_by_name("Scope B") is None


def test_create_invalid_knowledge_base_id_raises():
    repo = InMemoryScopeMonitoringRepository()
    use_case = CreateScopeMonitoringUseCase(repo)

    with pytest.raises(InvalidKnowledgeBaseIdError):
        use_case.execute([make_command(knowledge_base_id="short")])


def test_create_empty_official_raises():
    repo = InMemoryScopeMonitoringRepository()
    use_case = CreateScopeMonitoringUseCase(repo)

    with pytest.raises(EmptyOfficialsError):
        use_case.execute([make_command(official_main="")])


def test_create_stores_the_billing_code():
    repo = InMemoryScopeMonitoringRepository()
    use_case = CreateScopeMonitoringUseCase(repo)

    ids = use_case.execute([make_command(billing_code="FACT-2026-PAI")])

    assert repo.find_by_id(ids[0]).billing_code == "FACT-2026-PAI"


def test_create_blank_billing_code_raises_and_writes_nothing():
    repo = RecordingScopeMonitoringRepository(InMemoryScopeMonitoringRepository())
    use_case = CreateScopeMonitoringUseCase(repo)
    repo.reset()

    with pytest.raises(EmptyBillingCodeError):
        use_case.execute([make_command(billing_code="   ")])

    assert repo.writes == []
