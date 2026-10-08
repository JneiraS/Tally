from protab.domain.entities.day_status import DayStatus


def test_a_day_status_reads_back_from_its_stored_value():
    assert DayStatus.from_raw("completed") is DayStatus.COMPLETED
    assert DayStatus.from_raw("ko") is DayStatus.KO


def test_an_unreadable_status_reads_as_pending():
    # La colonne est du texte libre : une ligne à la main, une ancienne valeur ou
    # un NULL ne doivent pas faire échouer la lecture. Le repli est ``pending``,
    # l'état qu'une journée qui n'a pas encore été traitée porte déjà, donc
    # l'affichage reste juste.
    assert DayStatus.from_raw(None) is DayStatus.PENDING
    assert DayStatus.from_raw("") is DayStatus.PENDING
    assert DayStatus.from_raw("KO") is DayStatus.PENDING
    assert DayStatus.from_raw("termine") is DayStatus.PENDING
    assert DayStatus.from_raw(7) is DayStatus.PENDING


def test_a_day_status_is_a_closed_set_of_three_states():
    # Le remplacement de ``handled`` + ``completed`` par une seule valeur est
    # précisément ce qui supprime la combinaison interdite « terminée et KO » :
    # l'énumération rend cette combinaison non exprimable.
    assert {status.value for status in DayStatus} == {"pending", "completed", "ko"}


def test_a_day_status_serialises_to_its_stored_value():
    assert DayStatus.PENDING.value == "pending"
    assert DayStatus.COMPLETED.value == "completed"
    assert DayStatus.KO.value == "ko"