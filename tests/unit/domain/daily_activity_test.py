from datetime import date

import pytest

from protab.domain.entities.daily_activity import DailyActivity
from protab.domain.entities.day_status import KO_REASON_MAX_LENGTH, DayStatus
from protab.domain.exceptions import (
    DuplicateFeaiReferenceError,
    IncidentsExceedErrorsError,
    InvalidFeaiReferenceError,
    InvalidKoReasonError,
    KoReasonTooLongError,
    NegativeErrorsCountError,
    NegativeIncidentsCountError,
)


def test_daily_activity_creation_valid():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=3,
        incidents_created=1,
        feai=["INC000000001", "INC000000002"],
    )
    assert activity.day == date(2026, 9, 19)
    assert activity.errors_reported == 3
    assert activity.incidents_created == 1
    assert activity.feai == ["INC000000001", "INC000000002"]
    assert activity.status is DayStatus.PENDING
    assert activity.ko_reason is None


def test_daily_activity_errors_reported_negative():
    with pytest.raises(NegativeErrorsCountError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=-1,
            incidents_created=0,
            feai=[],
        )


def test_daily_activity_incidents_created_negative():
    with pytest.raises(NegativeIncidentsCountError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=0,
            incidents_created=-1,
            feai=[],
        )


def test_daily_activity_incidents_exceed_errors():
    with pytest.raises(IncidentsExceedErrorsError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=2,
            incidents_created=3,
            feai=["INC000000001"],
        )


def test_daily_activity_valid_feai_accepted():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001", "INC123456789"],
    )
    assert activity.feai == ["INC000000001", "INC123456789"]


def test_daily_activity_invalid_feai_format():
    with pytest.raises(InvalidFeaiReferenceError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=1,
            incidents_created=0,
            feai=["INVALID"],
        )


def test_daily_activity_duplicate_feai_rejected():
    with pytest.raises(DuplicateFeaiReferenceError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=1,
            incidents_created=0,
            feai=["INC000000001", "INC000000001"],
        )


@pytest.mark.parametrize(
    ("raw", "canonical"),
    [
        ("FE INC000000001", "FE-INC000000001"),
        ("FE-INC000000001", "FE-INC000000001"),
        ("FEAI-INC000000001", "FEAI-INC000000001"),
        ("FEAIINC000000001", "FEAI-INC000000001"),
        ("FE/INC000000001", "FE-INC000000001"),
        ("  FE - INC000000001  ", "FE-INC000000001"),
        ("INC000000001", "INC000000001"),
    ],
)
def test_daily_activity_canonicalises_a_prefixed_feai(raw, canonical):
    # Le domaine est le dernier rempart : une référence doit être stockée dans
    # une graphie unique quel que soit l'écrivain (front, curl, import), sinon
    # FE-INC… et FE INC… comptent pour deux références distinctes.
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=1,
        incidents_created=0,
        feai=[raw],
    )
    assert activity.feai == [canonical]


@pytest.mark.parametrize(
    "ref",
    [
        "FEAI000000001",  # préfixe sans code INC
        "X-INC000000001",  # préfixe d'une seule lettre
        "ABCDEF-INC000000001",  # préfixe de six lettres
        "FE-INC123",  # pas assez de chiffres
        "FE-INC1234567890",  # trop de chiffres
        "FE-INC00000000A",  # lettres au lieu de chiffres
    ],
)
def test_daily_activity_rejects_a_malformed_prefixed_feai(ref):
    with pytest.raises(InvalidFeaiReferenceError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=1,
            incidents_created=0,
            feai=[ref],
        )


def test_daily_activity_rejects_a_duplicate_written_with_another_separator():
    with pytest.raises(DuplicateFeaiReferenceError):
        DailyActivity(
            day=date(2026, 9, 19),
            errors_reported=1,
            incidents_created=0,
            feai=["FE INC000000001", "FE-INC000000001"],
        )


def test_daily_activity_starts_pending_and_has_no_ko_reason():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    assert activity.status is DayStatus.PENDING
    assert activity.ko_reason is None


def test_daily_activity_apply_status_marks_a_ko_with_its_reason():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    activity.apply_status(DayStatus.KO, ko_reason="Collecteur indisponible")
    assert activity.status is DayStatus.KO
    assert activity.ko_reason == "Collecteur indisponible"


def test_daily_activity_apply_status_is_idempotent():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    activity.apply_status(DayStatus.KO, ko_reason="Panne")
    activity.apply_status(DayStatus.KO, ko_reason="Panne")
    assert activity.status is DayStatus.KO
    assert activity.ko_reason == "Panne"


def test_daily_activity_completion_drops_the_ko_reason():
    # Une journée terminée ne peut pas porter un motif de blocage : le garder
    # donnerait deux états à la même chose. L'information n'est pas perdue, elle
    # vit dans audit_log.changes.
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    activity.apply_status(DayStatus.KO, ko_reason="Panne")
    activity.apply_status(DayStatus.COMPLETED)
    assert activity.status is DayStatus.COMPLETED
    assert activity.ko_reason is None


def test_daily_activity_raising_a_ko_keeps_the_counters():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=4,
        incidents_created=2,
        feai=["INC000000001"],
    )
    activity.apply_status(DayStatus.PENDING)
    assert activity.status is DayStatus.PENDING
    assert activity.ko_reason is None
    assert (activity.errors_reported, activity.incidents_created) == (4, 2)
    assert activity.feai == ["INC000000001"]


def test_daily_activity_refuses_a_reason_on_a_day_that_is_not_ko():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    with pytest.raises(InvalidKoReasonError):
        activity.apply_status(DayStatus.COMPLETED, ko_reason="Panne")


def test_daily_activity_refuses_a_reason_longer_than_the_domain_bound():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    with pytest.raises(KoReasonTooLongError):
        activity.apply_status(DayStatus.KO, ko_reason="x" * (KO_REASON_MAX_LENGTH + 1))


def test_daily_activity_strips_a_blank_ko_reason():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
    )
    activity.apply_status(DayStatus.KO, ko_reason="   ")
    assert activity.status is DayStatus.KO
    assert activity.ko_reason is None


def test_daily_activity_reads_a_ko_day_without_refusing():
    # Relecture : une ligne illisible ne doit pas vider la liste de tous les
    # périmètres, donc le constructeur n'a pas le droit de lever sur le motif.
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
        status=DayStatus.KO,
        ko_reason="  Collecteur HS  ",
    )
    assert activity.status is DayStatus.KO
    assert activity.ko_reason == "Collecteur HS"


def test_daily_activity_reads_a_stale_reason_without_refusing():
    # Une ligne qui porte un motif alors qu'elle est terminée est une Donnée
    # dégénérée, pas une raison de faire échouer la lecture.
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=0,
        incidents_created=0,
        feai=[],
        status=DayStatus.COMPLETED,
        ko_reason="Panne residuale",
    )
    assert activity.status is DayStatus.COMPLETED
    assert activity.ko_reason is None


# tests pour update()
def test_daily_activity_update_valid():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    activity.update(
        errors_reported=5,
        incidents_created=3,
        feai=["INC000000001", "INC000000002"],
    )
    assert activity.errors_reported == 5
    assert activity.incidents_created == 3
    assert activity.feai == ["INC000000001", "INC000000002"]


def test_daily_activity_update_preserves_day_and_status():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    activity.apply_status(DayStatus.KO, ko_reason="Panne")
    activity.update(
        errors_reported=4, incidents_created=2, feai=["INC000000001"]
    )
    assert activity.day == date(2026, 9, 19)
    assert activity.status is DayStatus.KO
    assert activity.ko_reason == "Panne"


def test_daily_activity_update_negative_errors():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    with pytest.raises(NegativeErrorsCountError):
        activity.update(errors_reported=-1, incidents_created=1, feai=["INC000000001"])


def test_daily_activity_update_negative_incidents():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    with pytest.raises(NegativeIncidentsCountError):
        activity.update(errors_reported=2, incidents_created=-1, feai=["INC000000001"])


def test_daily_activity_update_incidents_exceed_errors():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    with pytest.raises(IncidentsExceedErrorsError):
        activity.update(errors_reported=1, incidents_created=2, feai=["INC000000001"])


def test_daily_activity_update_invalid_feai():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    with pytest.raises(InvalidFeaiReferenceError):
        activity.update(errors_reported=2, incidents_created=1, feai=["BAD"])


def test_daily_activity_update_duplicate_feai():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    with pytest.raises(DuplicateFeaiReferenceError):
        activity.update(
            errors_reported=2,
            incidents_created=1,
            feai=["INC000000001", "INC000000001"],
        )


def test_daily_activity_update_canonicalises_a_prefixed_feai():
    activity = DailyActivity(
        day=date(2026, 9, 19),
        errors_reported=2,
        incidents_created=1,
        feai=["INC000000001"],
    )
    activity.update(
        errors_reported=2,
        incidents_created=1,
        feai=["FEAI INC000000002"],
    )
    assert activity.feai == ["FEAI-INC000000002"]
