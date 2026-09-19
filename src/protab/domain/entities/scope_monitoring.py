from dataclasses import dataclass

from protab.domain.exceptions import InvalidKnowledgeBaseIdError


@dataclass
class KnowledgeBase:
    id: str

    def __post_init__(self):
        if len(self.id) < 10:
            raise InvalidKnowledgeBaseIdError(
                "KnowledgeBase id must be at least 10 characters long."
            )


@dataclass
class Officials:
    main: str
    backup: str

    def __post_init__(self):
        if not self.main.strip() or not self.backup.strip():
            from protab.domain.exceptions import EmptyOfficialsError

            raise EmptyOfficialsError(
                "Both main and backup officials must be provided."
            )
        self.main = self.main.strip()
        self.backup = self.backup.strip()


@dataclass
class ScopeMonitoring:
    name: str
    knowledge: KnowledgeBase
    officials: Officials