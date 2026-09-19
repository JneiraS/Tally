from protab.domain.exceptions import (
    DomainError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
    NegativeErrorsCountError,
    NegativeIncidentsCountError,
    IncidentsExceedErrorsError,
    InvalidFeaiReferenceError,
    DuplicateFeaiReferenceError,
    DuplicateDailyActivityError,
)


def test_domain_exceptions_inheritance():
    assert issubclass(DomainError, Exception)
    assert issubclass(InvalidKnowledgeBaseIdError, DomainError)
    assert issubclass(EmptyOfficialsError, DomainError)
    assert issubclass(NegativeErrorsCountError, DomainError)
    assert issubclass(NegativeIncidentsCountError, DomainError)
    assert issubclass(IncidentsExceedErrorsError, DomainError)
    assert issubclass(InvalidFeaiReferenceError, DomainError)
    assert issubclass(DuplicateFeaiReferenceError, DomainError)
    assert issubclass(DuplicateDailyActivityError, DomainError)
