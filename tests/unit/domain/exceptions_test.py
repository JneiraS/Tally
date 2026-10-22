from protab.domain.exceptions import (
    DailyActivityNotFoundError,
    DomainError,
    DuplicateDailyActivityError,
    DuplicateFeaiReferenceError,
    EmptyBillingCodeError,
    EmptyOfficialsError,
    IncidentsExceedErrorsError,
    InvalidFeaiReferenceError,
    InvalidKnowledgeBaseIdError,
    InvalidOfficialCodeError,
    InvalidScopeMonitoringIdError,
    NegativeErrorsCountError,
    NegativeIncidentsCountError,
    NotProjectAdminError,
    ScopeMonitoringNameAlreadyExistsError,
    ScopeMonitoringNotFoundError,
)


def test_domain_exceptions_inheritance():
    assert issubclass(DomainError, Exception)
    assert issubclass(InvalidKnowledgeBaseIdError, DomainError)
    assert issubclass(EmptyOfficialsError, DomainError)
    assert issubclass(EmptyBillingCodeError, DomainError)
    assert issubclass(NegativeErrorsCountError, DomainError)
    assert issubclass(NegativeIncidentsCountError, DomainError)
    assert issubclass(IncidentsExceedErrorsError, DomainError)
    assert issubclass(InvalidFeaiReferenceError, DomainError)
    assert issubclass(DuplicateFeaiReferenceError, DomainError)
    assert issubclass(DuplicateDailyActivityError, DomainError)
    assert issubclass(InvalidScopeMonitoringIdError, DomainError)
    assert issubclass(ScopeMonitoringNotFoundError, DomainError)
    assert issubclass(DailyActivityNotFoundError, DomainError)
    assert issubclass(ScopeMonitoringNameAlreadyExistsError, DomainError)
    assert issubclass(InvalidOfficialCodeError, DomainError)
    assert issubclass(NotProjectAdminError, DomainError)
