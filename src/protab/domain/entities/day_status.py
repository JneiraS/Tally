from enum import Enum

# La borne est déclarée ici et reprise telle quelle par le schéma Pydantic : la
# recopier dans l'adaptateur ou dans le schéma la laisserait dériver du domaine.
KO_REASON_MAX_LENGTH = 500


class DayStatus(str, Enum):
    """The one status of a scope monitoring on a given day.

    This replaces a pair of booleans (``handled`` + ``completed``) that were
    always equal in production, because the only writer set both in the same
    statement. A single value makes the illegal combination — a completed day
    that also reports a blocking failure — inexpressible rather than merely
    discouraged, which a third boolean would not have been: four representable
    states, one of them forbidden and guaranteed by nothing.

    ``KO`` is not "not handled": it is *handled*, in the sense that somebody
    looked at the day and found it impossible to process because of a technical
    problem. That is the whole point of the value — it takes the day out of the
    backlog without pretending anything was measured.
    """

    PENDING = "pending"
    COMPLETED = "completed"
    KO = "ko"

    @classmethod
    def from_raw(cls, value: object) -> "DayStatus":
        """Rebuild a status from an untyped ``daily_activities.status`` value.

        Lenient on purpose, for the reason ``NonWorkingDays.from_raw`` and
        ``billing_code`` are: the column is plain text and the constructor of
        ``DailyActivity`` is the rehydration path of both adapters, so one
        unreadable row must not empty the scope list of the whole instance. An
        unknown value falls back to ``pending``, which is the state a day nobody
        has processed yet already carries — the page then shows the day as
        awaiting input, which is what an illegible row deserves.
        """
        if isinstance(value, cls):
            return value
        try:
            return cls(value)
        except ValueError:
            return cls.PENDING