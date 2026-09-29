from dataclasses import dataclass

from protab.domain.exceptions import InvalidOfficialCodeError

MIN_LENGTH = 2
MAX_LENGTH = 20
SEPARATOR = "/"


@dataclass
class OfficialCode:
    """A single official identity, normalized the way login normalizes it.

    ``Officials`` reads the ``"A/B"`` lists of a scope; this is the other form,
    where one row of ``project_admins`` holds exactly one code. The separator
    is therefore rejected rather than split on: an administrator stored as
    ``"MLOZ/MRAM"`` would only ever match a login typed with that literal
    string, which is precisely the impersonation the scope columns guard
    against.

    The length bounds mirror ``LoginRequest.quadrigramme``, so a code accepted
    here is always typeable at the login screen.
    """

    value: str

    def __post_init__(self):
        candidate = (self.value or "").strip().upper()
        if not candidate:
            raise InvalidOfficialCodeError("An official code cannot be blank.")
        if SEPARATOR in candidate:
            raise InvalidOfficialCodeError(
                f"An official code is a single identity, not a list: {self.value!r}."
            )
        if not any(char.isalnum() for char in candidate):
            raise InvalidOfficialCodeError(
                f"An official code must hold an alphanumeric character: {self.value!r}."
            )
        if not MIN_LENGTH <= len(candidate) <= MAX_LENGTH:
            raise InvalidOfficialCodeError(
                f"An official code must be between {MIN_LENGTH} and {MAX_LENGTH} "
                f"characters long: {self.value!r}."
            )
        self.value = candidate

    def __str__(self) -> str:
        return self.value
