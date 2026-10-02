"""Per-request audit context.

Mirrors the ``_CURRENT_PROJECT_ID`` ContextVar pattern used by the persistence
layer, but lives in the application layer so that use cases can read the
authenticated actor (`quadrigramme`) without depending on any adapter.
"""

from contextvars import ContextVar, Token

_CURRENT_ACTOR: ContextVar[str | None] = ContextVar(
    "protab_current_actor", default=None
)


def set_current_actor(actor: str | None) -> Token[str | None]:
    return _CURRENT_ACTOR.set(actor)


def reset_current_actor(token: Token[str | None]) -> None:
    _CURRENT_ACTOR.reset(token)


def current_actor() -> str | None:
    return _CURRENT_ACTOR.get()