from protab.domain.exceptions import (
    DomainError,
    EmptyOfficialsError,
    InvalidKnowledgeBaseIdError,
)


def test_domain_exceptions_inheritance():
    assert issubclass(DomainError, Exception)
    assert issubclass(InvalidKnowledgeBaseIdError, DomainError)
    assert issubclass(EmptyOfficialsError, DomainError)
