# AGENT.md

## 1. Purpose

You are a software development agent responsible for designing, implementing, testing, refactoring, and maintaining this Python project.

All code changes MUST follow these principles:

- **Test-Driven Development (TDD)**
- **SOLID principles**
- **Hexagonal Architecture (Ports and Adapters)**
- Clear separation of responsibilities
- Low coupling
- High cohesion
- Maintainability
- Testability
- Modern Python practices
- Explicit and controlled dependencies

Code quality and architectural integrity take priority over implementation speed.

---

# 2. Core Architectural Principles

The project follows **Hexagonal Architecture**, also known as **Ports and Adapters Architecture**.

The architecture must protect the application core from external technical concerns.

The core application must not depend directly on:

- Web frameworks
- Databases
- ORMs
- External APIs
- File systems
- Message brokers
- CLI frameworks
- Specific infrastructure libraries

External technologies must be connected through well-defined ports and adapters.

---

# 3. Recommended Project Structure

Use a structure similar to:

```text
src/
└── application/
    ├── domain/
    │   ├── entities/
    │   ├── value_objects/
    │   ├── services/
    │   ├── exceptions/
    │   └── repositories/
    │
    ├── application/
    │   ├── commands/
    │   ├── queries/
    │   ├── use_cases/
    │   └── dto/
    │
    ├── ports/
    │   ├── inbound/
    │   └── outbound/
    │
    └── adapters/
        ├── inbound/
        │   ├── api/
        │   ├── cli/
        │   └── ...
        │
        └── outbound/
            ├── persistence/
            ├── external_services/
            └── ...
```

Tests should follow the same architectural boundaries:

```text
tests/
├── unit/
│   ├── domain/
│   └── application/
│
├── integration/
│   └── adapters/
│
└── e2e/
```

The exact directory structure may be adapted to the project, but the architectural boundaries MUST remain explicit.

---

# 4. Dependency Rule

Dependencies MUST always point toward the application core.

```text
Adapters
    ↓
Ports
    ↓
Application
    ↓
Domain
```

The domain must remain independent of infrastructure.

### Forbidden

```python
# domain/user.py

from flask import ...
from sqlalchemy.orm import ...
import requests
```

### Preferred

```python
from typing import Protocol


class UserRepository(Protocol):
    def find_by_id(self, user_id: UserId) -> User | None:
        ...
```

The concrete implementation belongs to an adapter:

```python
class SqlAlchemyUserRepository:
    ...
```

---

# 5. Domain Layer

The domain contains the core business rules.

It should contain concepts such as:

- Entities
- Value Objects
- Domain Services
- Domain Exceptions
- Domain Events
- Domain-specific interfaces

The domain MUST NOT contain infrastructure concerns.

The domain should be:

- Framework-independent
- Database-independent
- Highly testable
- Deterministic whenever possible

Example:

```python
@dataclass
class Money:
    amount: Decimal
    currency: str

    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise CurrencyMismatchError()

        return Money(
            amount=self.amount + other.amount,
            currency=self.currency,
        )
```

---

# 6. Application Layer

The application layer orchestrates use cases.

A use case should:

1. Receive a command or input DTO.
2. Retrieve required data through ports.
3. Invoke domain behavior.
4. Persist changes through ports.
5. Return an appropriate result.

Example:

```python
class CreateUser:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def execute(self, command: CreateUserCommand) -> User:
        user = User.create(
            name=command.name,
            email=command.email,
        )

        self.repository.save(user)

        return user
```

A use case MUST NOT:

- Create database connections directly.
- Call external HTTP APIs directly.
- Depend directly on an ORM.
- Depend directly on a web framework.
- Contain infrastructure-specific logic.

---

# 7. Ports

Ports define contracts between the application core and external systems.

There are two categories.

## 7.1 Inbound Ports

Inbound ports define what the application exposes.

Example:

```python
class CreateUserUseCase(Protocol):
    def execute(self, command: CreateUserCommand) -> User:
        ...
```

Inbound adapters call inbound ports.

Examples:

```text
REST Controller
CLI
Message Consumer
Scheduled Job
       ↓
Inbound Port
       ↓
Use Case
```

---

## 7.2 Outbound Ports

Outbound ports define what the application requires from external systems.

Example:

```python
class UserRepository(Protocol):
    def save(self, user: User) -> None:
        ...

    def find_by_id(self, user_id: UserId) -> User | None:
        ...
```

The application defines the contract.

The infrastructure implements it.

```text
Application
     ↓
UserRepository
     ↑
SqlAlchemyUserRepository
```

---

# 8. Adapters

Adapters connect the application to the outside world.

## 8.1 Inbound Adapters

Examples:

- REST API
- GraphQL
- CLI
- Message consumers
- Scheduled jobs

Their responsibility is to translate external input into application commands.

```text
HTTP Request
     ↓
Controller
     ↓
Command
     ↓
Use Case
```

Controllers MUST NOT contain business logic.

---

## 8.2 Outbound Adapters

Examples:

- PostgreSQL
- SQLite
- SQLAlchemy
- Redis
- HTTP APIs
- File systems
- Message brokers

They implement outbound ports.

```text
Use Case
   ↓
Repository Port
   ↓
Persistence Adapter
   ↓
Database
```

---

# 9. Test-Driven Development

TDD is mandatory for new behavior.

Follow the cycle:

```text
RED
 ↓
GREEN
 ↓
REFACTOR
```

## RED

Write a test describing the expected behavior before implementing the functionality.

The test must fail for the expected reason.

Example:

```python
def test_user_cannot_be_created_with_invalid_email():
    with pytest.raises(InvalidEmailError):
        User.create(
            name="John",
            email="invalid",
        )
```

## GREEN

Implement the minimum amount of code required to make the test pass.

Do not implement speculative functionality.

## REFACTOR

Once the tests are green:

- Remove duplication.
- Improve naming.
- Simplify the implementation.
- Apply SOLID principles.
- Verify architectural boundaries.

Tests must remain green after refactoring.

---

# 10. Testing Strategy

Tests should be organized according to the architectural boundaries.

Preferred test pyramid:

```text
        E2E
       /   \
 Integration
   /       \
 Unit Tests
```

Favor a large number of fast unit tests, a smaller number of integration tests, and a limited number of E2E tests.

---

## 10.1 Unit Tests

Unit tests should primarily cover:

- Domain entities
- Value objects
- Domain services
- Use cases

External dependencies should be replaced with appropriate test doubles when necessary.

Prefer simple **fakes** over excessive mocking.

Do not mock implementation details merely to make a test pass.

Tests should verify observable behavior.

---

## 10.2 Integration Tests

Integration tests verify that adapters correctly interact with their external dependencies.

Examples:

```text
Repository + Database
API + Application
External API Adapter + External API
Message Adapter + Message Broker
```

Do not mock away the very dependency that the integration test is intended to verify.

---

## 10.3 End-to-End Tests

E2E tests verify complete business flows.

Example:

```text
HTTP Request
     ↓
API
     ↓
Application
     ↓
Domain
     ↓
Repository
     ↓
Database
```

Keep E2E tests limited to critical user journeys.

---

# 11. SOLID Principles

All design decisions should respect SOLID.

## S — Single Responsibility Principle

A class should have one clearly defined responsibility.

Avoid:

```python
class UserService:
    # validation
    # database access
    # HTTP calls
    # email sending
    # business logic
```

Prefer focused components with clear responsibilities.

---

## O — Open/Closed Principle

Components should be open for extension but closed for unnecessary modification.

Prefer dependency-based extension:

```python
class PaymentProcessor:
    def __init__(self, gateway: PaymentGateway):
        self.gateway = gateway
```

Avoid large conditional structures that require modifying existing code for every new implementation.

---

## L — Liskov Substitution Principle

Implementations of a port must be substitutable without violating the contract.

Example:

```text
UserRepository
├── SqlAlchemyUserRepository
├── InMemoryUserRepository
└── FakeUserRepository
```

Each implementation must respect the same behavioral contract.

---

## I — Interface Segregation Principle

Prefer small, focused interfaces.

Avoid large interfaces containing unrelated responsibilities.

Bad:

```python
class UserRepository:
    create()
    update()
    delete()
    export()
    send_email()
    generate_report()
```

Prefer separate contracts when responsibilities are unrelated.

---

## D — Dependency Inversion Principle

High-level application logic must not depend on low-level implementation details.

Depend on abstractions:

```text
Application
     ↓
    Port
     ↑
Adapter
```

Example:

```python
class NotificationService:
    def __init__(self, sender: NotificationSender):
        self.sender = sender
```

The service does not depend directly on SMTP, HTTP, or a specific provider.

---

# 12. Dependency Injection

Dependencies MUST be injected rather than instantiated inside business logic.

Preferred:

```python
class OrderService:
    def __init__(
        self,
        repository: OrderRepository,
        payment: PaymentGateway,
    ):
        self.repository = repository
        self.payment = payment
```

Avoid:

```python
class OrderService:
    def __init__(self):
        self.repository = SqlAlchemyOrderRepository()
        self.payment = StripePaymentGateway()
```

Concrete dependency wiring should happen in a **Composition Root**.

Example:

```text
main.py
   ↓
Composition Root
   ↓
Concrete Adapters
   ↓
Application
```

---

# 13. Framework Isolation

Frameworks and infrastructure libraries are implementation details.

They must remain at the outer layers of the architecture whenever possible.

The domain MUST NOT depend on:

```text
Flask
FastAPI
Django
SQLAlchemy
Redis
Requests
Celery
```

or equivalent infrastructure technologies.

The goal is to make it possible to replace a framework or infrastructure component without rewriting the domain.

---

# 14. Type Safety

Use modern Python type hints.

Preferred:

```python
def find_user(user_id: UserId) -> User | None:
    ...
```

Avoid untyped APIs:

```python
def find_user(user_id):
    ...
```

Use where appropriate:

- Type hints
- `Protocol`
- `dataclass`
- `Enum`
- Value Objects
- Explicit return types

Avoid `Any` unless there is a justified technical reason.

## 14.1 Type checking is enforced, not merely requested

Type hints that nothing checks are documentation. `mypy` runs over `src/protab`
via `make typecheck`, with `disallow_untyped_defs` on: an unannotated function
fails the check, so the convention above is a command and not an intention.
Tests stay out of scope (`files` covers the application core only) — they are
untyped by design and their behaviour is pinned by assertions.

Two settings are load-bearing and should not be dropped casually:

- `mypy_path = "src"` + `explicit_package_bases`. `protab` is installed in
  editable mode, so without them mypy resolves the project's own imports
  through `site-packages` and reports 107 `[import-untyped]` errors that say
  nothing about the code.
- `disallow_untyped_defs`. This is what turned a missing method into an error
  rather than a silent `Any`.

`mypy` covers the **production wiring**: an adapter is checked against the
Protocol at the injection site (`create_app(repository=...)`). It cannot see the
in-memory adapter used by tests, nor the recording decorator, so those are
covered separately by the contract test (§11).

---

# 15. Error Handling

Business errors should be represented using domain-specific exceptions or explicit result types.

Example:

```python
class UserAlreadyExistsError(DomainError):
    pass
```

Infrastructure exceptions should not leak into the domain.

Translate technical exceptions at the adapter boundary.

Example:

```text
Database IntegrityError
        ↓
Repository Adapter
        ↓
UserAlreadyExistsError
        ↓
Application
```

---

# 16. Configuration and Secrets

Configuration must remain separate from business logic.

Never hard-code:

- Passwords
- API keys
- Tokens
- Credentials
- Environment-specific URLs
- Infrastructure-specific paths

Use appropriate configuration mechanisms and environment variables.

Secrets must never be committed to the repository.

---

# 17. Code Quality

Code should prioritize:

- Clear naming
- Small and cohesive functions
- Small and focused classes
- Low complexity
- Minimal duplication
- Explicit dependencies
- Readability
- Maintainability

Avoid:

- Dead code
- Unnecessary abstractions
- Premature optimization
- Premature generalization
- Excessive comments

Comments should explain **why**, not simply restate **what** the code does.

---

# 18. Avoid Premature Abstraction

Do not introduce an abstraction simply because SOLID or Hexagonal Architecture allows it.

Every abstraction should have a clear purpose.

Prefer:

```text
Simple + Testable + Decoupled
```

over:

```text
Complex + Over-engineered + Highly abstract
```

The architecture exists to protect business logic, not to maximize the number of interfaces or classes.

---

# 19. Development Workflow

For every new feature or significant change, follow this process.

### Step 1 — Understand

Identify:

- The requested behavior
- Business rules
- Existing architecture
- Existing tests
- External dependencies
- Relevant architectural boundaries

### Step 2 — Identify Responsibilities

Determine what belongs to:

```text
Domain
Application
Inbound Port
Outbound Port
Inbound Adapter
Outbound Adapter
```

### Step 3 — Write Tests

Write tests describing the expected behavior.

Start with the smallest meaningful test.

### Step 4 — Implement

Implement only what is required to satisfy the tests.

### Step 5 — Run Tests

Run the relevant tests and then the complete test suite.

Example:

```bash
pytest
```

### Step 6 — Refactor

Review:

- SOLID compliance
- Dependency direction
- Duplication
- Naming
- Complexity
- Architectural boundaries

### Step 7 — Add Integration Tests

Add or update integration tests when an adapter or external integration has changed.

### Step 8 — Update Documentation

Determine whether the change affects:

- README
- Architecture documentation
- API documentation
- Development documentation
- Configuration documentation
- `AGENT.md`

Update all affected documentation as part of the same task.

### Step 9 — Final Validation

Before considering the task complete:

```text
[ ] Unit tests pass
[ ] Integration tests pass
[ ] Relevant E2E tests pass
[ ] Type checking passes
[ ] Linting passes
[ ] Architecture is respected
[ ] SOLID principles are respected
[ ] Domain remains infrastructure-independent
[ ] Dependencies are correctly inverted
[ ] No secrets are present
[ ] Documentation is up to date
[ ] AGENT.md is up to date
```

---

# 20. Modifying Existing Code

Before modifying an existing feature:

1. Read the relevant implementation.
2. Read the existing tests.
3. Identify dependencies.
4. Identify the architectural boundary.
5. Add or modify tests first.
6. Implement the change.
7. Run the test suite.
8. Refactor where appropriate.
9. Update affected documentation.

Do not modify unrelated components without a clear reason.

Avoid architectural changes when a local change is sufficient.

---

# 21. Documentation as a First-Class Requirement

Documentation is part of the implementation.

It must remain synchronized with the actual codebase.

Documentation must be reviewed whenever a change affects:

- Architecture
- Business rules
- Public APIs
- Use cases
- Ports
- Adapters
- Configuration
- Dependencies
- Development workflow
- Testing strategy
- Deployment
- Developer conventions

Documentation must explain **what the system does and why**, not simply reproduce the implementation.

Avoid documentation that duplicates obvious information already expressed clearly by the code.

---

# 22. AGENT.md Must Remain Up to Date

`AGENT.md` is a **living document** and a source of truth for the project's development rules.

It MUST be updated whenever project evolution changes:

- Development rules
- Architectural principles
- Directory structure
- Coding conventions
- TDD requirements
- Testing strategy
- SOLID guidelines
- Hexagonal Architecture rules
- Required tools
- Required commands
- Dependencies
- Documentation requirements

If a change makes any rule in `AGENT.md` inaccurate or obsolete, update `AGENT.md` **as part of the same task**.

Never knowingly leave `AGENT.md` describing an architecture, workflow, convention, or requirement that is no longer true.

---

# 23. Documentation Synchronization

The codebase and its documentation must always describe the same system.

Before completing a task, verify:

```text
[ ] Code matches the documentation
[ ] Documentation matches the code
[ ] Architecture documentation matches the actual architecture
[ ] Documented commands still work
[ ] Documented examples are still valid
[ ] Configuration documentation is current
[ ] API documentation is current where applicable
[ ] AGENT.md reflects the current development rules
```

If documentation becomes outdated because of a code change, it MUST be corrected in the same change.

A feature is not considered complete until all necessary documentation has been updated.

Long-form reference material lives in `docs/`, and the README keeps a link plus a short example rather than a
duplicate. `docs/cli.md` is the reference for the `protab-project` CLI: a new subcommand, argument or refusal
message is documented there, and `protab-project --help` must list it.

---

# 24. Forbidden Practices

Do not:

- Put business logic in controllers.
- Put business logic in repositories.
- Access a database directly from a use case.
- Call external APIs directly from the domain.
- Import infrastructure frameworks into the domain.
- Use global state for dependencies without justification.
- Introduce unnecessary singletons.
- Mock everything.
- Skip tests for new behavior.
- Bypass ports to save a few lines of code.
- Introduce infrastructure dependencies into the core without justification.
- Leave documentation outdated.
- Leave `AGENT.md` outdated.
- Add speculative abstractions without a concrete need.

---

# 25. Definition of Done

A task is complete only when all applicable conditions are satisfied:

```text
[ ] Expected behavior is covered by tests
[ ] TDD workflow has been followed
[ ] Unit tests pass
[ ] Integration tests pass where applicable
[ ] E2E tests pass where applicable
[ ] SOLID principles are respected
[ ] Hexagonal Architecture is respected
[ ] Dependency direction is correct
[ ] Domain is independent from infrastructure
[ ] Dependencies are injected
[ ] Type checking passes
[ ] Linting passes
[ ] No unnecessary complexity was introduced
[ ] No secrets are committed
[ ] Documentation is updated
[ ] AGENT.md is updated if project rules or architecture changed
```

A task MUST NOT be considered complete merely because the code works.

It must also satisfy the project's architectural, testing, quality, and documentation requirements.

---

# 26. Final Decision Rules

When making an architectural or implementation decision, prioritize:

1. **Correctness**
2. **Business rules**
3. **Testability**
4. **Simplicity**
5. **Separation of responsibilities**
6. **Low coupling**
7. **Maintainability**
8. **Extensibility**

Do not apply SOLID or Hexagonal Architecture dogmatically.

The purpose of the architecture is to protect the domain, isolate technical concerns, and make the system easier to test and maintain.

When uncertain, prefer the simplest design that preserves these boundaries.

---

# 27. Final Principle

Every implementation should allow the following answers to be "yes":

- Can the domain be tested without infrastructure?
- Can a use case be tested without a real database?
- Can the database be replaced without modifying the domain?
- Can the web framework be replaced without modifying the domain?
- Are business rules independent from technical details?
- Do dependencies point toward the application core?
- Are tests describing expected behavior?
- Does the implementation respect SOLID without unnecessary abstraction?
- Is the documentation synchronized with the implementation?
- Is `AGENT.md` synchronized with the project's current architecture and development rules?

If any answer is "no", review the implementation before considering the task complete.

---

# 28. ProTab — Notes d'infrastructure

Conventions propres au dépôt ProTab, qui complètent les règles générales ci-dessus.

## 28.1 Persistance

- Le port outbound `ScopeMonitoringRepository` (sync, `Protocol`) a **deux** implémentations :
  - `InMemoryScopeMonitoringRepository` — utilisé uniquement par injection explicite dans les tests.
  - `PostgresScopeMonitoringRepository` — obligatoire pour l'API quand `DATABASE_URL` est défini ;
    `psycopg` (sync) + `psycopg_pool`. Le schéma est créé **idempotemment au démarrage**
    (`CREATE TABLE IF NOT EXISTS`, pas d'outil de migration). Les contraintes DB (nom unique, unique
    `(scope_id, day)`) sont traduites en exceptions de domaine par l'adapter.
- **`save()` crée, il ne réécrit rien.** L'insertion est en `ON CONFLICT (id) DO NOTHING` : un `save`
  sur un id déjà pris lève `ScopeMonitoringAlreadyExistsError` (`409`) **avant** toute écriture, au lieu
  de fusionner. L'ancien `ON CONFLICT DO UPDATE` + `DELETE` des activités attendait là un cas
  d'usage qui mute un périmètre existant : cet usage est interdit, car il réécrit des jours qu'il
  n'a pas relus après une édition concurrente. Les mutations passent donc par des écritures ciblées du
  port — `insert_daily_activity`, `update_daily_activity`, `set_activities_status`, `update_note` —
  chacune ne touchant que les lignes nommées, avec `rowcount == 0` traduit en
  `DailyActivityNotFoundError` ou `ScopeMonitoringNotFoundError`. Le refus a supprimé le cas
  particulier de la note (§28.1) : il n'y a plus de `DO UPDATE` auquel il faille l'exclure, donc plus
  d'asymétrie à documenter. Verrouillé par `test_save_refuses_an_existing_scope`,
  `test_a_refused_save_leaves_a_concurrent_note_intact` et
  `tests/unit/adapters/scope_monitoring_repository_save_test.py`.
- **`set_activities_status` est le seul upsert du dépôt, et le seul endroit où un `ON CONFLICT DO UPDATE`
  est légitime.** La clause n'y réécrit que `status` et `ko_reason` de lignes nommées : elle ne fusionne
  jamais des compteurs qu'un appelant n'a pas relus, ce qui était l'objection qui a retiré la clause de
  `save()`. Un jour sans ligne est créé **à compteurs nuls**, sans quoi le KO serait inatteignable là où
  il est utile — une journée que personne n'a pu traiter. Conséquence à tenir : **`rowcount` ne distingue
  plus un jour absent d'un jour mis à jour** (PostgreSQL compte un `UPDATE` même sans changement), donc le
  refus de terminer un jour inexistant **vit dans le use case** (`SetActivitiesStatusUseCase`), pas dans
  l'adapter. Verrouillé par `test_set_activities_status_creates_a_missing_day_at_zero` et
  `test_complete_unknown_day_does_not_partially_persist`.
- **`daily_activities.status` remplace deux booléens, `handled` et `completed`.** Une seule colonne
  `TEXT` à trois valeurs (`pending` / `completed` / `ko`), plus `ko_reason`. Les deux drapeaux étaient
  **toujours égaux** en production — le seul écrivain faisait les deux dans le même `SET` — donc rien n'est
  perdu en les supprimant. Ajouter `ko` à côté aurait produit quatre états dont un **interdit**
  (« terminée et KO ») et garanti par rien, c'est-à-dire exactement le piège absorbé en silence de
  `incidents ⊆ erreurs` ci-dessous. L'énumération rend la combinaison non exprimable.
  La migration est un `ADD COLUMN IF NOT EXISTS` + `UPDATE` de backfill + `DROP COLUMN`, le tout dans un
  **`DO $$` gardé sur l'existence de `completed`** : sans ce garde, le **premier redémarrage** échoue,
  car le deuxième démarrage lit une colonne que le premier a supprimée — une migration qui ne marche
  qu'une fois casse tous les déploiement suivant sa mise à niveau. **Aucun `CHECK`** sur `status` : même
  piège que `billing_code`, un `ALTER TABLE ADD CONSTRAINT` bloquerait le démarrage sur une ligne écrite
  à la main. Verrouillé par `test_the_status_migration_carries_completed_days_over` et
  `test_the_status_migration_is_idempotent`.
- **`scope_monitorings.note` est un texte libre nullable, et la première route qui modifie un périmètre.**
  `PATCH /scope-monitorings/{id}` avec `{note}` ne touche qu'à elle — ni `name`, ni `billing_code`, ni les
  officiels (la deuxième écriture ciblée du périmètre est celle des officiels, cf.
  « Édition des responsables » ci-après). La borne `NOTE_MAX_LENGTH = 2000` est déclarée **dans le domaine** et reprise par le schéma
  Pydantic, jamais recopiée ; une requête trop longue est donc refusée en `422` à la frontière entrante,
  tandis que `set_note()` conserve l'invariant pour les autres appelants. Deux règles distinctes, comme
  pour `NonWorkingDaysRequest` : le constructeur hydrate **sans** refuser une note trop longue (une seule
  ligne dégénérée viderait la liste des périmètres, cf. `billing_code` ci-dessus), la validation est un
  invariant d'écriture. Une note blanche est normalisée en `None` partout — domaine, API et TypeScript
  (`ScopeMonitoring.note` : `string | null`) — donc « pas de note » n'a qu'un état, pas deux.
- **Édition des responsables : `PATCH /scope-monitorings/{id}/officials`, réservée aux administrateurs du
  projet.** C'est la demande qui a réalisé la forme anticipée par §28.1 et la prévision de §28.3 bis
  (« si la demande revient ») : écriture ciblée du port `update_officials` + use case + événement d'audit,
  **pas un `save()`**. Les arbitraires à ne pas casser :
  - **la permission est jugée avant la lecture du périmètre** (`AdminDirectory`
    → `NotProjectAdminError` → `403`) : un `404` d'abord laissait le refus servir de détecteur
    d'identifiants de périmètres. Pour un admin, un id inconnu reste une `404` métier, comme les autres
    écritures ciblées ;
  - **la porte `is_current_project_admin` relit `project_admins` en base à chaque requête** — jamais un
    drapeau en session, qui survivrait 12 h à une révocation CLI. Elle résout le projet dans le tenant
    courant côté adapter, le port ne connaît pas de `project_id` ;
  - **`auth=None`, la vérification est simplement absente** : le use case est construit sans porte en
    mode dégradé (dev/tests) et l'édition reste permise, comme le reste — cohérence avec
    `project_context`, pas une brèche nouvelle ;
  - **pas de nouvelle règle de format** sur les codes : même tolérance `strip` que la création via
    `Officials` — la relation « administrateur ≠ officiel du périmètre » est conservée, et éditer les
    officiels ne touche jamais `project_admins`, donc un admin ne peut pas se verrouiller lui-même ;
  - l'événement `scope_officials_updated` ne porte **que les champs réellement modifiés**, et valeurs
    identiques ⇒ aucun événement ; le front duplique l'état admin dans `AuthSession.is_admin`,
    calculé par le serveur à chaque `/auth/me` et `/auth/login` — jamais déduit côté client.
  Verrouillé par `tests/unit/application/update_scope_officials_test.py` et
  `tests/integration/adapters/officials_api_test.py`.
- **`daily_activities.ko_reason` est un texte libre nullable, qui n'existe que sur un jour KO.** La borne
  `KO_REASON_MAX_LENGTH = 500` est déclarée **dans le domaine** et reprise par le schéma Pydantic, comme
  `NOTE_MAX_LENGTH`. **Trois portes, dont deux à contre-courant**, et c'est délibéré :
  - *écriture* — `DailyActivity.apply_status()` **refuse** un motif fourni pour un statut ≠ `ko`
    (`InvalidKoReasonError`). L'ignorer silencieusement laisserait l'appelant croire le motif enregistré.
    Le schéma `SetStatusRequest` refuse la même chose en `422` pour les appelants HTTP ;
  - *relecture* — `__post_init__` **normalise sans refuser** (motif résiduel sur un jour terminé ⇒ `None`).
    Le constructeur est le chemin de réhydratation des deux adapters ; une ligne dégénérée qui lèverait
    viderait la liste des périmètres de l'instance. Même arbitrage que `billing_code` et `from_raw()` ;
  - *effacement* — compléter une journée KO **efface le motif de la ligne**, sinon une journée terminée
    porterait un motif de blocage, soit deux états pour une chose. L'information n'est pas perdue : elle
    est dans `audit_log.changes`, ce qui est précisément le moment où on la consultera. Verrouillé par
    `test_the_reason_a_completion_erased_stays_in_the_audit_trail`.
- **`daily_activities` n'a pas de `project_id`**, la tenancy passe par `scope_monitorings`. Les écritures
  ciblées sur un périmètre joignent donc `scope_monitorings` et filtrent `s.project_id` ; l'insert est en
  plus conditionné à l'existence du périmètre dans le projet courant, sans quoi la clé étrangère
  accepterait un `scope_id` d'un autre tenant. Une écriture qui ne filtre pas le projet est un défaut,
  même si la ligne visée existe.
- `InMemoryScopeMonitoringRepository` renvoie **les objets qu'elle stocke**. Elle ne peut donc pas
  prouver qu'un cas d'usage écrit de façon ciblée : `tests/unit/application/recording_repository.py`
  enregistre les appels au port pour cela, et la garantie « les autres jours sont intacts » se vérifie
  dans `postgres_scope_monitoring_repository_test.py`. Un nouveau port doit être implémenté par les
  **deux** adapters (Liskov, AGENTS.md §11) — et plus par le décorateur d'enregistrement, qui est une
  troisième implémentation. **Ce n'est plus à vérifier à la main** :
  `tests/unit/ports/scope_monitoring_repository_contract_test.py` compare, par réflexion, les méthodes
  publiques du `Protocol` à celles des trois implémentations, et compare aussi l'ordre des paramètres.
  L'assertion est une **inclusion**, jamais une égalité : `PostgresScopeMonitoringRepository` possède
  `connect`/`close` qui n'appartiennent à aucun port. Vérifier que ce test échoue en retirant une
  méthode d'un adapter, sinon il ne prouve rien.
- **Les deux adapters sont interchangeables, pas seulement compatibles.** L'in-memory doit donc refuser
  ce que le SQL refuse, avec les mêmes exceptions : un `save()` sur un id déjà pris y lève
  `ScopeMonitoringAlreadyExistsError`, sur un nom déjà pris
  `ScopeMonitoringNameAlreadyExistsError`. Sans cela, un cas d'usage passerait sous test et
  échouerait en production sur la même ligne de code. Verrouillé par
  `tests/unit/adapters/scope_monitoring_repository_save_test.py`.
- Le core (domaine + application) ne doit **jamais** importer `psycopg`/`psycopg_pool` ni référencer
  les tables SQL : ils ne vivent que sous `adapters/outbound/persistence/`.
- **`scope_monitorings.billing_code` est obligatoire à la création mais nullable en base.** Les deux
  règles sont dans le domaine (`ScopeMonitoring.create()` → `EmptyBillingCodeError`) et dans le schéma
  Pydantic, jamais dans la colonne : `NOT NULL` ferait échouer l'`ALTER TABLE ... ADD COLUMN IF NOT
  EXISTS` du démarrage sur une table déjà peuplée, et surtout le constructeur — chemin de réhydratation des
  deux adapters — refuse de lever sur une ligne lue, donc une seule ligne ancienne illisible viderait
  toute la liste. Le champ est `str | None` côté domaine, API (`ScopeResponse`) et TypeScript
  (`ScopeMonitoring.billing_code` : `string | null`) ; les lignes sans code s'affichent « — ». Format
  **libre**, `strip`é, **non unique** : deux périmètres peuvent partager un code. Aucun `UNIQUE` en base.
  Il n'existe **aucune route de mise à jour du code de facturation** : `PATCH /scope-monitorings/{id}`
  ne modifie que la note (§28.1). C'est un choix assumé, pas une dette : la reprise d'un code manquant
  se fait en SQL, procédure dans `docs/cli.md` §9 — hors journal d'audit, puisque `audit_log` ne voit
  que les use cases. Ouvrir cette route pour un champ unique y ajouterait un troisième format
  d'écriture (`name` est `UNIQUE` **mondial**, les officiels sont des listes délimitées par `/`) sans
  résoudre un besoin exprimé ; si la demande revient, la forme attendue est une écriture ciblée du
  port plus un use case et un événement d'audit, pas un `save()`.
- **Le CSV d'import a gagné une 5e colonne** (`name, knowledge_base_id, official_main, official_backup,
  billing_code`), donc `REQUIRED_HEADERS` la rend obligatoire : un fichier préparé avant l'évolution est
  rejeté en `400 « Invalid headers » ». C'est la conséquence directe de l'obligation, pas un durcissement
  opportun. L'export, lui, ajoute `code_facturation` **en dernier** pour ne pas décaler les colonnes
  existantes des fichiers déjà produits.
- La table `scope_monitorings` impose une clé étrangère `project_id -> projects.id` avec suppression en
  cascade, comme `auth_sessions` et `daily_activities`. L'adapter applique cette contrainte de façon
  idempotente au démarrage pour les bases existantes ; toute réparation de données doit donc restaurer un
  `project_id` valide avant de l'ajouter.
- L'API de production utilise une session HTTP-only et filtre les périmètres par `project_id` ; les routes
  métier sont protégées par l'authentification projet/quadrigramme.
- **`projects.non_working_days` est un `NonWorkingDays`, pas un `dict`.** La colonne est du JSONB non typé,
  donc `NonWorkingDays.from_raw()` (dans `domain/value_objects/`) est **lenient** : une entrée illisible
  est écartée, jamais signalée, pour la même raison que `billing_code` ci-dessus — une seule ligne ancienne
  ne doit pas vider le calendrier de tous les projets de l'instance. Deux conséquences à tenir :
  - **un défaut ne doit jamais être un `dict` partagé.** Un `dict.copy()` est superficiel et laisse les deux
    copies partager les listes ; les `tuple` du value object rendent l'erreur impossible. C'est le défaut que
    `tests/unit/domain/non_working_days_test.py::test_two_defaults_share_no_mutable_state` verrouille.
  - **vide ≠ défaut.** `NonWorkingDays()` = « tous les jours sont ouvrés » (case décochée dans la modale),
    `NonWorkingDays.default()` = « week-end exclu », l'installation qui n'a rien configuré. Une colonne
    `NULL` lit le défaut, jamais le vide.
  - **présente mais illisible ≠ vide.** `{"excluded_weekdays": ["nope"]}` retombait sur une liste vide, donc
    sur « tous les jours sont ouvrés », et les week-ends seraient entrés dans le KPI de couverture. Une
    liste non vide dont **aucune** entrée ne survit à la normalisation retombe donc sur le défaut ; une
    liste `[]` reste un choix. Le repli n'existe que pour les jours récurrents : il n'y a pas d'équivalent
    pour les dates ponctuelles. Verrouillé par
    `postgres_auth_repository_test.py::test_an_unreadable_column_reads_as_the_default_calendar`.
  - **une semaine entière n'est pas un calendrier.** `[1,2,3,4,5,6,7]` ne laisse **aucun** jour
    ouvré : la vue mono-jour chercherait une date ouvrée jusqu'à la limite de `Date` — mesuré, 20 M
    d'itérations en 58 s sans terme, puis `RangeError`. La page principale gelait, pas l'écran vide.
    La modale ne peut pas produire ce réglage (décocher tout donne `[]`), mais un `curl` si : les deux
    portes sont donc nécessaires, à deux étages. **À l'écriture**, `NonWorkingDaysRequest` (Pydantic)
    refuse `len(set(values)) == ISO_WEEKDAY_COUNT` en `422` — c'est la frontière entrante, le même
    endroit que les bornes. **À la relecture**, `from_raw()` retombe sur le défaut : un calendrier sans
    jour ouvré est inexploitable, donc illisible au sens du repli ci-dessus, et une ligne déjà en base
    ne doit pas pouvoir geler l'UI. Ne pas remonter l'exception côté lecture : une seule ligne
    dégénérée viderait le calendrier de tous les projets (§28.1). Verrouillé par
    `test_project_settings_reject_a_calendar_without_any_working_day` et
    `non_working_days_test.py::test_a_calendar_without_any_working_day_reads_as_the_default`.
  - L'adapter ne valide donc plus rien sur ce champ : il persiste `to_dict()` et relit par `from_raw()`.
    `NonWorkingDaysRequest` (Pydantic) prend ses bornes dans le **domaine**
    (`MIN_ISO_WEEKDAY`/`MAX_ISO_WEEKDAY`) — jamais dans l'adapter, dont l'import créerait une dépendance
    domain → infrastructure. Le format de série ne change pas : `{"excluded_weekdays": [...],
    "excluded_dates": [...]}`.
- **Une durée, une seule déclaration.** `SESSION_DURATION` (adapter) fixe l'expiration en base ;
  `SESSION_COOKIE_MAX_AGE_SECONDS` s'en **déduit** (`int(SESSION_DURATION.total_seconds())`) au lieu de
  redéclarer `12 * 60 * 60`. Deux durées séparées laisseraient un cookie promettre une session déjà morte,
  sans le moindre symptôme. Verrouillé par
  `tests/integration/adapters/auth_api_test.py::test_session_cookie_expires_with_the_session_it_carries`.
  Même règle pour les paramètres de hachage : `SCRYPT_N`/`SCRYPT_R`/`SCRYPT_P` sont lus par `_hash_password`
  **et** `_check_password`, un écart entre les deux listes invalidant tous les mots de passe existants sans
  lever d'erreur.
- **Isolation multi-tenant par défaut** : le projet courant est porté par un `ContextVar` posé par la
  dépendance `project_context`. Les adaptateurs PostgreSQL appellent `require_current_project()` et
  lèvent `MissingProjectContextError` si le contexte est absent — aucun repli sur un projet par défaut.
  Toute requête SQL d'un adapter doit filtrer sur `project_id` **sans condition**.
- **Allowlist de routes** : l'authentification est activée par la dépendance `project_context`, donc une
  nouvelle route qui l'oublierait fuiterait entre tenants. `tests/integration/adapters/route_authorization_test.py`
  inverse la polarité : seules les routes de `PUBLIC_ROUTES` (`/healthz`, `/projects`, `/auth/*`, docs)
  peuvent être non authentifiées. Ajouter une route publique = ajouter son chemin à cette liste.
- **Chemins d'API** : déclarés une seule fois côté front dans `src/FrontEnd/src/constants/routes.ts`
  sous deux constantes : `AUDIT_LOG_PATH = "/api/audit-log"` (endpoint API, présent dans
  `app.py` / `nginx.conf` / `vite.config.ts`) et `AUDIT_LOG_PAGE_PATH = "/audit-log"`
  (route SPA, **absente** des couches serveur). Ne pas restaurer l'ancien chemin haché
  `6d857a9d…-log` : la sécurité repose sur le cookie de session, pas sur l'opacité du chemin.
  Le journal d'audit est ainsi `GET /api/audit-log`.

## 28.2 Configuration

- Chargée via `load_dotenv()` (`src/protab/adapters/inbound/api/config.py`) + `os.getenv`.
- Variables : `PROTAB_HOST`, `PROTAB_PORT`, `DATABASE_URL` (DSN PostgreSQL),
  `PROTAB_TEST_DATABASE_URL` (tests), `PROTAB_COOKIE_SECURE` (drapeau `Secure` du cookie de session),
  `PROTAB_DEFAULT_PROJECT_PASSWORD` (obligatoire au premier démarrage).
- Seuls des défauts/conteneurs de dev sont commités (cf. `.env.example`) ; aucun secret réel.
- **Fail-closed** : aucun secret devinable ne doit être réintroduit. `PROTAB_DEFAULT_PROJECT_PASSWORD` et le
  contexte de projet lèvent une `RuntimeError` explicite quand elles sont absentes, plutôt que de retomber
  sur une valeur par défaut. Toute nouvelle dépendance de sécurité suit la même règle.
- **Fail-closed là où le secret sert, pas à chaque démarrage** : `resolve_bootstrap_password()` n'est
  appelé que si la ligne du projet bootstrap est absente. Exiger le secret à chaque `connect()` casserait
  le redémarrage de toute installation déjà initialisée, pour une valeur jamais utilisée.
  `docker-compose.yml` transmet donc la variable sans garde (`${…:-}`) : l'application est l'unique
  point d'application de la règle, Compose ne doit pas la rejouer.
- Le cookie de session est `HttpOnly` + `SameSite=Lax` ; `Secure` n'est activé que si `PROTAB_COOKIE_SECURE`
  est truthy (`1`, `true`, `yes`, `on`). En Docker Compose l'API est publiée sur `127.0.0.1` uniquement.
- **401 = session perdue, pas panne réseau** : le frontend le traite globalement via
  `protabApi.setUnauthorizedHandler` (branché dans `App.tsx`) et revient à `LoginPage`, au lieu d'afficher
  une boîte « Échec du chargement » dont « Réessayer » ne peut pas réussir. `POST /auth/login` est exclu :
  un 401 y signifie mot de passe erroné et reste une erreur de formulaire. Tout nouveau client HTTP doit
  conserver cette exclusion, sinon un mauvais mot de passe vide le formulaire.

## 28.3 Authentification : quadrigrammes et rotation du mot de passe

- **Les deux colonnes `officials` sont des listes, pas des scalaires.** `official_main` et `official_backup`
  encodent un ou plusieurs quadrigrammes séparés par `/`. Le parseur commun est `_official_codes()` dans
  `postgres_auth_repository.py`, utilisé par `authenticate()` pour **les deux** colonnes ; casse et espaces
  ignorés. Traiter `official_main` comme un scalaire (le cas avant ce correctif) rendait `LAMA/JMAB`
  inutilisable et, à l'inverse, la chaîne brute `"LAMA/JMAB"` recevable comme code.
- **Un substitut de saisie n'est pas un code.** Le `?` des données réelles signifie « pas de suppléant ».
  Toute partie sans caractère alphanumérique est écartée. La chaîne complète n'est jamais un code valide, même
  si elle satisfait le `min_length`/`max_length` du schéma : c'est une usurpation dans le journal d'audit.
- **Ne pas resserrer la validation du quadrigramme sans vérifier les données.** Le login accepte
  volontairement des formes larges car un projet sans périmètre doit accepter n'importe quel quadrigramme
  (bootstrap du premier périmètre). Une contrainte de format stricte risquerait de verrouiller des saisies
  manuelles déjà en base.
- **Rotation : `protab-project set-password <code>`** (`src/protab/project_admin.py`). Mot de passe saisi par
  `getpass`, jamais en argument. `PostgresAuthRepository.set_project_password()` remplace le hash **et
  supprime les `auth_sessions` du projet**. Cette révocation n'est pas cosmétique : c'est le geste correct
  quand un mot de passe a été divulgué, et elle est couverte par
  `tests/integration/adapters/project_admin_test.py`. La forme historique `protab-project <code> <nom>`
  reste valide.

### 28.3 bis Administrateurs de projet : `project_admins`

- **La fenêtre de bootstrap n'est pas collante.** `authenticate()` est sans état : dès qu'un projet possède
  **un seul** périmètre, `if not scopes: return True` ne s'exécute plus, et le quadrigramme doit figurer dans
  un `official_main`/`official_backup`. La personne qui crée le premier périmètre perd donc son accès à
  l'instant où elle l'enregistre, sans aucun filet : ni colonne « admin », ni liste d'administrateurs, ni
  mémorisation du premier quadrigramme. Le seul vestige est `audit_log.actor` — et le login **n'est pas
  audité**, donc un quadrigramme qui se connecte puis ne fait rien ne laisse aucune trace.
- **C'est ce que `project_admins` corrige.** Une ligne par administrateur
  (`project_id`, `code`, `created_at`, PK `(project_id, code)`), FK `ON DELETE CASCADE` sur `projects` — sans
  quoi un code de projet recyclé hériterait des administrateurs du tenant précédent. `authenticate()` accepte
  le code s'il est dans `project_admins` **ou** dans un périmètre : c'est un union, pas un remplacement, donc
  nommer un administrateur ne retire rien aux officials.
- **Une ligne, pas une colonne `TEXT` délimitée par `/`.** L'identifiant d'un administrateur est supprimé par
  nom, en addition et en cascade (`remove_admin` supprime aussi ses `auth_sessions` dans la même
  transaction) : la concaténation de chaînes est précisément la famille de bug que §28.1 interdit. Une
  colonne délimitée rendrait `created_at` par administrateur impossible.
- **L'administrateur donne un accès permanent, pas un rôle.** Aucun drapeau en session, aucun `403`, aucune
  route de gestion, aucun écran : une fois connecté, il a exactement les droits d'un officiel. Ne pas
  réintroduire un cache de rôle dans `auth_sessions` — `authenticate()` n'est appelé **qu'au login**, donc un
  rôle mémorisé serait périmé pendant toute la durée de vie de la session (12 h). C'est aussi pourquoi
  `remove_admin` révoque les sessions : sans cela, un administrateur révoqué resterait utilisable 12 h.
- **Le statut est strictement per-projet.** `authenticate()` filtre sur le `project_id` du payload de login,
  et `GET /projects` est public : sans ce filtre, un seul code administrateur ouvrirait tous les tenants de
  l'instance. Couvert par `test_admin_is_scoped_to_its_own_project`.
- **Fail-closed au bootstrap.** `PROTAB_DEFAULT_PROJECT_ADMIN_CODE` est obligatoire au premier démarrage,
  résolue par `resolve_bootstrap_admin_code()` **après** le mot de passe (sinon `test_connect_reports_the_
  password_before_the_admin_code` renommerait l'échec du mot de passe). Un projet sans administrateur ne
  serait pas « non protégé » : il serait impossible à ouvrir, ce qui est un verrouillage, pas un défaut de
  sécurité. `docker-compose.yml` transmet la variable en `${…:-}` comme le mot de passe (§28.2).
- **`OfficialCode` est le forme scalaire, volontairement distincte d'`Officials`.** Refuse `/` (une liste
  n'est pas une identité : `"MLOZ/MRAM"` stocké comme admin ne serait atteignable qu'en tapant cette chaîne
  littérale), exige un alphanumérique, et borne à 2–20 caractères — les bornes de `LoginRequest.quadrigramme`,
  pour qu'un administrateur stocké soit toujours saisissable à l'écran de connexion. Le refus est à la porte,
  dans la CLI comme dans l'adapter : un administrateur que personne ne peut taper est un verrouillage
  déguisé en autorisation.
- **`protab-project` administer les *projets*, pas les utilisateurs.** Le module porte sur la gestion des
  projets (création, mot de passe) ; les administrateurs qu'il nomme sont des quadrigrammes. Les deux sens
  cohabitent volontairement, `protab-project` restant le point d'entrée de l'administration d'hôte. La seule
  voie de secours hors session est la CLI : elle demande la base, pas un cookie. **La référence de la CLI
  est `docs/cli.md`** — inventaire, arguments, messages d'erreur, dépannage d'un projet verrouillé, usage
  Docker. Toute nouvelle sous-commande se documente là, et non dans le README qui n'en garde que le lien et
  deux exemples.
- **`remove-admin` refuse le dernier administrateur**, avec la commande SQL de contournement dans le message.
  `protab-project set-password` **ne** vous sauverait pas : il supprime les sessions, donc il verrouille.
- **`project_admins` fait partie de `connect()`**, donc `TRUNCATE ... projects ... CASCADE` la vide avec le
  projet : les fixtures `truncate_all()` n'ont rien à ajouter.
- **Ajouter un administrateur ne remplace pas la mise à jour d'un périmètre.** Les routes qui modifient
  un périmètre existant restent les écritures ciblées : la note (`PATCH /scope-monitorings/{id}`,
  tout officiel) et les officiels (`PATCH /{id}/officials`, administrateurs seulement — cf.
  « Édition des responsables » §28.1). Ni `name`, ni `billing_code` : `name` reste `UNIQUE` **mondial**
  (donc pas par projet), et ce dernier garde la forme anticipée dans §28.1, application si la demande
  revient. Déclarer un quadrigramme supplémentaire ou corriger un code dans un périmètre existant passe
  encore par le SQL direct ou par un nouveau périmètre ; **éditer les responsables n'a jamais donné
  d'accès** — le login lit `project_admins` et les officiels des périmètres, pas l'historique des éditions.


## 28.4 Tests d'intégration PostgreSQL

- `tests/integration/adapters/postgres_scope_monitoring_repository_test.py` est ignoré (`skip`) tant que
  `PROTAB_TEST_DATABASE_URL` n'est pas défini. Le lancer via `make test-db` (base `protab_test` créée si absente).
- `tests/integration/adapters/postgres_auth_repository_test.py` fournit lui-même
  `PROTAB_DEFAULT_PROJECT_PASSWORD` via `monkeypatch`, puisque l'authent refuse de démarrer sans.
- `tests/integration/adapters/project_admin_test.py` dépend également de `PROTAB_TEST_DATABASE_URL` et fait de
  même. Il exercise la CLI `protab-project` contre la vraie base (en patchant `getpass` et `sys.argv`) : c'est
  volontaire, il vérifie le SQL de rotation et la révocation des sessions, pas la logique d'argparse.

## 28.5 Conteneurisation & commandes utiles

- **`docs/docker-architecture.md` est la référence de la topologie** : réseau bridge par défaut, statut
  des trois ports publiés (dont `api` en boucle locale seule et `db` sur `0.0.0.0`), ordre de démarrage
  encodé par les healthchecks, chaîne de construction des deux images et blocs `location` de nginx. Toute
  évolution de `docker-compose.yml`, d'un `Dockerfile` ou de `nginx.conf` s'y répercute.
- `docker-compose.yml` : `db` (postgres:17-alpine, volume `pgdata`, healthcheck), `api` (Dockerfile backend
  multi-stage uv), `frontend` (Dockerfile node → nginx, proxy `/scope-monitorings` → `api`, même origine).
- Cibles Makefile : `db-up`, `db-down`, `db-shell`, `docker-up`, `docker-down`, `project-admin`, `test-db`,
  `resources`. `project-admin` est un relais vers `docker compose exec api protab-project $(ARGS)` :
  **sans `-T`**, car `getpass` exige un terminal, et **sans dépendance** à `docker-up`, qui déclencherait
  une reconstruction complète de la stack à chaque appel d'administration.
- Dépendances runtime ajoutées pour la persistance : `psycopg[binary]`, `psycopg-pool`.
- La configuration des pools PostgreSQL est centralisée dans `adapters/outbound/persistence/postgres_pool.py` :
  `min_size=2`, `max_size=10`, timeout de 30 s, recyclage `max_lifetime=1800 s` et pré-ping `SELECT 1`.
- `node_modules` n'est **jamais** versionné : dépendances résolues depuis `package-lock.json` (`npm ci`).
  Même règle pour les artefacts de build front (`*.tsbuildinfo`, régénéré par `tsc -b` derrière
  `npm run build`) : déclarés dans `src/FrontEnd/.gitignore`, pas à la racine.
- **`src/FrontEnd/.dockerignore` est distinct de celui de la racine** : le contexte de build de l'image
  `frontend` est `./src/FrontEnd` (`docker-compose.yml`), donc seul ce fichier filtre ce que `COPY . .`
  embarque. Un artefact absent du `.gitignore` racine peut malgré tout entrer dans l'image.
- **Un motif `.dockerignore` sans `/` initial ne correspond qu'à la racine du contexte.** `node_modules/`
  exclut `./node_modules` et laisse passer `./src/FrontEnd/node_modules`. La règle est donc `**/` pour tout
  motif imbriqué, dans les deux fichiers. Ce n'est pas une précaution théorique : c'était **220 Mio de
  `node_modules` dans l'image de l'API**, qui n'exécute aucun JavaScript, soit 420.7 → 188.8 Mio
  décompressés et 100.6 → 55.8 Mio sur disque — sans toucher au `Dockerfile`, et un contexte de build
  passé de ~236 Mio à ~16 Mio. La sémantique est expliquée dans `docs/docker-architecture.md` §3, avec le
  motif d'un `Dockerfile` de test qui prouve la sémantique par l'image construite.
- **`make resources` est le garde-fou de ce défaut, pas un simple relevé** (`scripts/measure-usage.sh`) :
  il liste les répertoires de développement présents dans les images **en service**, donc un
  `node_modules` revenu se lit comme un chiffre non nul et non comme une dérive de taille qu'on ne voit
  pas. Il distingue aussi les deux métriques de poids, qui diffèrent d'un facteur 5 : `docker images`
  raisonne en décompressé (564 Mio pour la stack) alors que seule la taille des blobs compressés
  (193 Mio) est ce qui occupe le disque d'un serveur. Chiffres, méthode et dimensionnement :
  `docs/ressources.md`.
- **La stack n'a aucun `mem_limit` ni `cpus`.** Ce n'est pas un oubli mais une décision de déploiement
  assumée, à trancher avec les valeurs d'un `make resources` pris sur le serveur cible : un `mem_limit`
  trop bas sur PostgreSQL provoque un échec au démarrage plutôt qu'une dégradation progressive. Conséquence
  immédiate à connaître : la colonne mémoire de `docker stats` affiche la RAM de l'hôte, pas un plafond.

## 28.6 FrontEnd : vue mono-jour et état local des saisies

- **Une seule fabrique de fixtures : `src/test/factories.ts`** (`makeScope`,
  `makeActivity`, `makeScopes`). Même arbitrage que `CHECKBOX_CLASS` et
  `routes.ts`, avec la mesure qui le justifie : ajouter `note` au contrat
  TypeScript avait produit **40 erreurs** de `tsc`, dont 35 dans
  `ScopeListPage.test.tsx`, une par littéral. Le remède « rendre le champ
  optionnel » aurait été le mauvais : il réintroduirait `undefined` là où
  l'  API n'a qu'un état absent (`note` et `billing_code` sont `string | null`),
  donc deux erreurs pour un seul cas. **La factory garde donc les
  défauts réalistes et le champ reste requis** ; un fichier de test ne doit pas
  pouvoir mentir sur la forme d'une réponse.
- **Un helper local qui délègue est acceptable, un helper qui redéclare les
  défauts ne l'est pas.** Les helpers positionnels (`scope(id, name, days)`)
  restent pour la lisibilité des assertions, mais délèguent à `makeScope` :
  `knowledge_base_id`, `billing_code`, `note` et `daily_activities` ne sont
  écrits qu'une fois dans le dépôt. Si un test asserte sur un officiel
  (`export.test.ts`), la valeur doit rester explicite — la délégation l'a
  d'ailleurs fait échouer, ce qui prouve que le test observait bien la donnée.

- **Une seule classe pour toutes les cases à cocher : `CHECKBOX_CLASS`**
  (`src/constants/ui.ts`). Le même arbitrage que `constants/routes.ts` : une valeur
  dupliquée dérive, et ici la dérive était mesurée — trois hauteurs, `text-*`
  contre `accent-*`, deux jetons de bordure, deux traitements de focus pour six
  cases. **La constante doit rester une chaîne littérale complète** : Tailwind
  extrait les noms de classes par analyse statique du source, donc une classe
  recombinée par concaténation ne serait jamais générée et le style disparaîtrait
  sans erreur de compilation. **La preuve n'est ni `tsc` ni jsdom, c'est le CSS
  compilé** : `grep -c` sur `dist/assets/index-*.css` pour chaque nom, en
  n'oubliant pas que Tailwind v4 échappe le point d'un `h-3.5` en `h-3\.5` et le
  séparateur de variante en `dark\:accent-nord-8`. Un build sans erreur n prouve
  rien ici.
- **`accent-*` et non `text-*` pour une case à cocher.** C'est `accent-color` qui
  colore une case native ; la couleur de texte n'est qu'un contournement dont le
  rendu dépend du navigateur, si bien que deux cases identiques n'affichaient pas
  la même couleur. Le curseur et l'anneau de focus viennent de la constante, ce qui
  est sans risque : chaque case est enveloppée dans un `<label>` d'au moins 36 px
  (`min-h-9`), donc la cible cliquable reste bien au-dessus du plancher AA même à
  14 px. Un `cursor-pointer` local reste possible pour une case nue, hors label.
- **`AnalyticsFilterBar.test.tsx` verrouille l'unicité du style** : toutes les
  cases de la carte doivent partager un seul `className`. C'est un **garde-fou de
  classe, pas un test de rendu** — jsdom ne calcule aucune couleur, donc seul
  l'égalité des chaînes est vérifiable. Vérifier qu'il échoue en cassant une
  occurrence, sinon il ne prouve rien.

- **L'échelle ISO des jours se décide dans `src/constants/nonWorkingDays.ts`, nulle part
  ailleurs.** Même arbitrage que `constants/routes.ts` : `getUTCDay()` et `getDay()`
  numérotent à partir du dimanche alors que l'ISO part du lundi, et la dérive était
  déjà réelle — `[6, 7]` en dur dans le défaut front, les bornes réécrites dans le
  validateur Pydantic, et deux conversions dimanche → ISO recopiées dans `kpi.ts` et
  dans `analytics.ts`. `toIsoWeekday()` et `toMondayFirstIndex()` prennent le
  **numéro** du jour et non la `Date` : l'appelant garde ainsi la main sur son
  horloge, ce qui compte car `kpi.ts` raisonne en UTC sur des dates ISO et
  `auditStats.ts` en heure locale (son audience est locale). Les fusionner
  uniformiserait un affichage qui ne doit pas l'être. `WEEKDAY_LABELS` a quitté
  `WorkingDaysModal.tsx` pour la même raison que le reste, et
  `NonWorkingDays.excluded_weekdays` est typée `IsoWeekday[]` : c'est le seul endroit
  où le compilateur peut refuser un `[0]` ou un `[8]`. Le défaut front doit rester
  aligné sur `NonWorkingDays.default()` côté API, que
  `src/test/nonWorkingDays.test.ts` verrouille avec le dimanche — la conversion 0 → 7
  n'étant exercée par aucun autre test.
- **La page principale est mono-jour, pas un cumul.** `ScopeListPage` n'affiche que les compteurs du
  jour sélectionné ; le jour à l'ouverture est `defaultDisplayDay()` (`utils/kpi.ts`) : la date du jour
  si elle est ouvrée, sinon le dernier jour ouvré. Un jour non ouvré n'a rien à afficher ni à saisir,
  et l'ouvrir sur la date du jour rendait un historique réimporté invisible alors qu'il était présent
  dans le détail de chaque périmètre.
- **La page de détail l'est devenue aussi, après coup.** Elle listait l'historique complet sous la carte
  de saisie, alors que seul le `DateNavigator` de la carte bougeait : revenir de trois jours laissait
  le tableau inchangé et se lisait comme un empilement de lignes — le symptôme était réel, sa cause
  fausse, et aucune ligne n'était jamais dupliquée (`daily_activities` a une PK `(scope_id, day)`).
  Un troisième bloc, « Relevé du {date} » — un tableau d'une ligne — avait existé entre les deux : il
  faisait doublon avec l'éditeur, et il ne bougeait pas quand on changeait de jour, ce qui se lisait
  comme un empilement. **Les deux problèmes avaient la même cause : deux zones pour la même
  journée.** Il est supprimé ; ses 82 lignes avec. Aujourd'hui deux blocs seulement : la carte
  « Saisie du {date} » (éditeur, statut, **et le sélecteur de jour**) et le `<details>` « Historique
  des journées », qui liste **toutes** les journées, jour affiché compris — il l'excluait pour ne pas
  le montrer deux fois à côté de son propre tableau, et ce tableau ayant disparu, l'exclusion
  disparaissait avec lui.
- **Un seul éditeur de saisie sur toute la page de détail, sinon la duplication se paie deux fois.**
  L'éditeur saisit les compteurs en autosave ; lui adjoindre un tableau récapitulatif — ou un second
  éditeur — offrirait la même écriture par deux routes : deux validations et deux copies des règles
  FEAI à faire diverger. `ActivityRow` reste partagé par l'historique et par les lignes du tableau,
  faute de quoi elles divergeraient au premier bouton ajouté. **Ne pas réintroduire de tableau par
  jour** : il avait exactement les deux défauts qu'on cherchait à supprimer. Verrouillé par
  `n'expose qu'une seule zone de saisie sur toute la page` — dupliquer l'éditeur en fait échouer
  **quatre** tests, dont `suit le sélecteur de jour sans jamais dupliquer l'éditeur`.
- **Deux clés identiques sur deux frères, c'est un bug React, pas un avertissement.** `DayStatusPanel`
  et `TodayActivityEditor` portent tous deux `key={editorDay}` et sont frères : React refuse de les
  réconcilier et **abandonne le rendu**, ce qui vide le tableau sans lever la moindre erreur. Seul le
  panneau en garde une, et il se resynchronise sur `day` par effet au lieu d'être remonté.
- **Le flush de fin de saisie n'est pas du code mort — surtout pas.** `TodayActivityEditor` annule le
  timer au démontage puis écrit la saisie en attente ; c'est ce qui évite de perdre un compteur saisi
  dans la fenêtre de 800 ms du debounce. Il faut que `doSave` **accepte d'écrire après le démontage**
  (`{ unmounting: true }`) : la garde `if (!mountedRef.current) return`, qui existe pour ne pas écrire
  dans l'état React, annulait l'écriture elle aussi. Verrouillé par
  `enregistre la saisie en attente quand le composant se démonte`.
- **Un état « aucune saisie » doit rester atteignable.** Si le jour affiché ne contient aucune activité
  alors qu'une autre journée en contient, un bandeau `role="status"` nomme la dernière saisie et propose
  de l'afficher. Le bandeau « N périmètres non traités » du dernier jour ouvré l'emporte : il nomme les
  périmètres concernés et filtre la liste sur eux, la notice « aucune saisie » n'est qu'un repli. Deux
  `role="status"` simultanés rendraient l'un des deux inatteignable.
- **Un jour KO est traité, et cette définition est dans `constants/dayStatus.ts`.** `isHandled(status)`
  vaut vrai pour `completed` **et** pour `ko`, et c'est la seule ligne à écrire pour l'obtenir. Le
  prédicat des non traités (`ScopeListPage.tsx:102`) et le filtre « à traiter » l'utilisent : sans cette
  exception, un périmètre bloqué par une panne remonterait chaque matin, indéfiniment, sans qu'aucun
  travail reste à faire — le statut n'aurait alors aucune utilité. Verrouillé par
  `ne compte pas une journée KO parmi les périmètres non traités`.
- **La même règle s'applique à la notice « aucune saisie », sinon le dépôt définit « traité » deux fois
  et n'en respecte qu'une.** `showEmptyDayNotice` comparait des **dates** et ignorait le statut : sur une
  journée entièrement KO, elle annonçait « aucune saisie le 6 oct. » alors que la journée contient des
  lignes, et proposait d'aller voir le 8. Symptôme exact : un utilisateur qui vient de remplir ses
  périmètres lit « vide », **parce que ce qu'il a rempli est précisément ce qui rend la journée invisible
  à `latestActivityDay`**. La condition porte donc sur « la journée affichée porte-t-elle au moins une
  activité », pas sur « porte-t-elle une mesure ». Verrouillé par `n annonce pas « aucune saisie » quand
  la journée est signalée KO`. Deux pièges de fixture : le jour visé doit être **ouvré** (un samedi est
  ignoré par le calendrier) et la navigation doit partir d'un jour qui porte des saisies, sinon
  `latestData.day === selectedDay` et la notice ne s'affiche même pas.
- **Le statut est écrit par `DayStatusPanel`, dans l'en-tête de la carte « Activité du jour », jamais dans
  `TodayActivityEditor`.** L'éditeur fait un autosave à 800 ms : lui faire porter un clic sur « Signaler
  un KO » mettrait deux mécanismes d'écriture en concurrence sur la même ligne. Le motif est un
  **brouillon**, comme la note du périmètre — un autosave enverrait un `PATCH` par frappe, donc un
  événement d'audit par caractère tapé. Le panneau ne recharge rien : il renvoie le statut enregistré et
  le parent met à jour `scope.daily_activities` en place, sinon le `fetchScopeDetail` effacerait le jour
  sélectionné.
- **Les éditeurs relisent le statut dans un ref, pas dans la prop de montage.** `TodayActivityEditor` et
  `InlineActivityCounters` émettent l'objet `DailyActivity` vers `onChanged` ; le statut est écrit par une
  autre action, il peut donc changer entre deux sauvegardes sans remontage. Une closure de montage
  émettrait une valeur périmée, et comme rien ne recharge la page, l'écran mentirait sur la base. D'où le
  `dayStatusRef` resynchronisé par un effet.
- **Le KO en lot passe par `BatchKoModal`, sur les lignes déjà sélectionnées du tableau jour par jour.**
  Un seul motif pour tout le lot — une panne a une seule cause — et il reste facultatif. Le lot ne
  recharge **rien**, contrairement à « Marquer comme terminé » qui appelle `fetchScopeDetail` : il passe
  par `handleDayStatusChanged`, sinon le jour sélectionné dans la carte « Activité du jour » disparaîtrait.
  Limite assumée : seules les journées **qui ont déjà une ligne** sont sélectionnables ; une journée sans
  aucune saisie — le cas d'une panne — passe par le sélecteur de date du panneau. Le libellé du bouton
  **porte son compte** (« Signaler les 5 jours en KO ») : sans cela il ferait doublon avec celui du panneau
  de statut, et rien ne dirait au lecteur que l'un agit sur la sélection et l'autre sur le jour affiché.
- **`/analyse` exclut les jours KO de ses chiffres, et en contrepartie les compte.** Sans l'exclusion,
  une journée KO à compteurs nuls compterait comme une saisie dans `sumByLabel`, `traitees`,
  `coverageRate` et les cellules de la heatmap — donc **améliorerait artificiellement le taux de
  couverture** tout en aplatissant la courbe d'erreurs. La contrepartie est obligatoire :
  `PeriodSummary.relevesKo` les compte et `AnalyticsKpiCards` les **affiche**, en ligne
  conditionnelle sous les cartes KPI — donc seulement s'il y en a, sans quoi la couverture chuterait
  sans que rien n'explique pourquoi. Ce n'est pas une carte : pas de delta (moins de KO n'est pas
  forcément mieux) ni de sparkline (une tendance n'apprend rien), c'est une **explication du
  dénominateur**. Le filtre KO vit dans `measuredActivitiesIn` (`utils/kpi.ts`), un seul endroit, pas
  dans chaque appelant qui réadditionne des cellules.
- **Un relevé KO est une cellule périmètre × jour, pas une journée — et le vocabulaire doit le dire.**
  Deux périmètres bloqués le **même** jour font deux relevés : la ligne en affiche « 2 relevés KO
  (périmètre × jour) », jamais « 2 journées », qui ferait croire à deux dates de panne. C'est
  l'unité du dénominateur de `coverageRate` (« cellules périmètre × jour »), donc l'explication
  rapporte au chiffre qu'elle sert à expliquer. Le champ s'appelle `relevesKo` et la fonction
  `countKoCells` : un nom qui dit « jours » dans une grandeur qui n'en compte pas fait dériver le
  prochain qui s'en sert. Verrouillé par `compte les relevés KO par périmètre et par jour, pas par
  journée`, qui échoue aussi si le mot « journée » revient.
- **L'export CSV ajoute `Statut` et `Motif KO` en fin de ligne, jamais au milieu.** `traite` et
  `termine` restent en place et sont dérivés du statut, pour la raison déjà documentée lors de
  `code_facturation` : un tableur configuré sur un export antérieur doit continuer de viser les bonnes
  lettres.
- **`InlineActivityCounters` ne rejoue pas `initialActivity`.** Ses `useState` sont initialisés au
  montage seulement, et `existsRef` (existe-t-il déjà une ligne pour ce jour ?) n'est jamais
  resynchronisé. Sans remontage, changer de jour laisse les compteurs affichés sur la journée précédente
  **et** l'autosave `PATCH` réécrit alors la journée affichée avec ces valeurs périmées : perte de
  données silencieuse, d'autant plus grave qu'elle n'apparaît que dans le journal d'audit. D'où
  l'invariant : toute occurrence rendue pour un jour données doit porter
  `key={`${scope.id}-${selectedDay}`}` — c'est déjà le cas de `TodayActivityEditor` sur la page de
  détail. Le flush de la saisie en cours au unmount (`useEffect` de nettoyage) reste ainsi correct.
- Vérifier une correction de saisie avec un test qui **change de jour** : un test qui ne fait qu'afficher
  la journée du jour passe même avec des compteurs périmés.
- **La croix FEAI supprime immédiatement et propose « Annuler », sans confirmation.** Ces éditeurs sont
  en ligne et à autosave : la croix déclenche le `PATCH` comme n'importe quelle autre saisie, il n'y a
  pas de brouillon à annuler. Une modale avant chaque suppression taxerait l'interaction la plus rapide
  de l'app, casserait la parité avec `Backspace` (qui supprime déjà la dernière référence) et ne
  corrigerait pas la vraie cause des mauvais taps : la taille de la cible. C'est **l'annulation qui
  rend acceptable une cible de 24 px** (plancher AA, et non les 44 px d'Apple) — si l'on retire
  l'annulation, il faut remonter la cible, pas ajouter une modale. Un appui long ne serait pas une
  alternative : geste caché, inaccessible au clavier, et il slows down chaque suppression.
  `ActivityFormModal` est le contre-exemple volontaire : là la liste est un brouillon avec « Annuler »
  et « Enregistrer les modifications », la suppression est donc réversible gratuitement — ni modale, ni
  toast d'annulation.
- **L'annulation porte sur toute la rafale, pas sur la seule dernière suppression.** Un toast unique qui
  n'annule que le dernier retrait laisse les précédents définitivement perdus, et le debounce rend les
  rafales *plus* fréquentes qu'on ne le croit : deux suppressions à 1,5 s s'effacent en **un seul
  `PATCH`**, donc en un seul écrasement — c'est le cas « mauvaise batch collée » qui a le plus besoin d'un
  retour. `undoBurstRef` accumule les retraits tant qu'ils tombent dans `UNDO_DURATION_MS` (constante
  exportée par `useToast`, identique à la durée de vie du toast : deux fenêtres, une seule) et l'action
  rejoue les entrées **à l'envers**, chacune par « retirer puis insérer à l'index » sur l'état courant.
  Chaque `index` est la position *après* retrait où la référence doit revenir, ce qui rend l'opération
  idempotente : un parent qui n'a pas re-rendu rend quand même la liste d'origine, et une référence
  *ajoutée* pendant la rafale est préservée. Filtrer puis slicer à `index + 1` décalerait la référence
  d'un rang — l'ordre des `feai` est significatif, `filter` le préserve.
- **Le toast d'annulation est unique et ne touche pas les autres toasts.** `showUndo` réutilise un id
  fixé, donc deux suppressions successives ne coexistent pas ; les toasts d'erreur ou de succès, eux,
  ne sont pas remplacés. Les minuteries sont conservées par id dans une `Map` : sans cela, le timer du
  toast remplacé effacerait le nouveau avant sa durée.
- **Un composant qui n'émet que des toasts consomme `useToastActions()`, pas `useToast()`.** Les deux
  contextes sont distincts et la valeur du premier est stable : un `FeaiTagInput` abonné à `useToast()`
  re-renderait à chaque toast de l'app, et il y en a deux instances par périmètre (table + carte mobile,
  toutes deux au DOM). `useToast()` reste la porte de sortie pour qui doit lire `toasts`.
- `React.memo` n'aurait rien acheté ici : le parent crée une nouvelle fonction `onChange` à chaque rendu,
  donc la comparaison de props échoue de toute façon. Le découpage des contextes est ce qui règle le
  coût de rendu, pas la mémoïsation.
- **Aucun toast d'annulation dans `ActivityFormModal`, et ce n'est pas un oubli.** `Modal` est en `z-50`
  comme `ToastContainer` : le toast flotterait par-dessus le modal, en bas à droite, à côté de son bouton
  « Annuler » (`ActivityFormModal.tsx:396`) qui **jette toute la saisie en cours**. Deux contrôles, le même
  libellé, deux sens opposés, dont un destructeur. Si la suppression dans ce modal doit devenir
  réversible, la forme correcte est un « référence retirée — restaurer » **en place** dans la liste.
- **La note du périmètre est un brouillon, pas un autosave.** Avec les responsables (ScopeOfficialsCard),
  ce sont les seuls champs éditables de la page qui ne soient pas des compteurs d'activité : une note se
  rédige au clavier, donc un autosave enverrait un `PATCH`
  par frappe — et donc un événement d'audit par caractère tapé. D'où le `ScopeNoteCard` dédié, avec
  « Enregistrer » / « Annuler », sur la carte entre l'identité et l'activité du jour. Le bouton compare la
  valeur **nettoyée** à la valeur enregistrée : « note » et «  note  » sont le même enregistrement, donc
  « Annuler » ne doit pas s'activer pour rien. Le `2000` affiché vient d'une constante locale, alignée sur
  le domaine sans le dupliquer dans la comparaison — seule la frontière serveur fait foi, d'où le refus
  en `422` et non un `maxLength` qui tronquerait la saisie.
- **La carte renvoie la note enregistrée, la page ne recharge rien.** `onSaved(note)` met à jour l'état
  local : un `fetchScopeDetail()` au retour du `PATCH` remettrait `isLoading` à vrai et effacerait la
  journée sélectionnée.
- **Les images sont importées depuis `src/assets/`**, jamais référencées par une URL `public/` : l'import
  laisse Vite hasher le fichier et valide le chemin à la compilation. `tsconfig.json` déclare déjà
  `"types": ["vite/client"]`, un `import x from './x.svg'` type-check donc sans configuration ajoutée.
  Attention en test : Vite *inline* en `data:` URI l'asset sous `assetsInlineLimit` (4 Ko par défaut) et
  sert l'autre en fichier, donc la valeur du `src` dépend du bundler. Comparer le `src` à l'asset importé,
  jamais à un nom de fichier.
- **`ThemeProvider` enveloppe toute l'application, page de connexion comprise.** Il est monté dans `App`,
  qui n'est qu'une coquille au-dessus d'`AppContent` : une branche rendue en dehors (chargement de session,
  `LoginPage`) n'avait aucun contexte, donc aucune classe `dark:` ne pouvait s'activer et la préférence
  enregistrée n'était appliquée qu'**après** connexion — un flash de thème à chaque login. Tout composant
  qui dépend du thème passe par `useTheme()` ; ne jamais dupliquer l'état de thème ni lire `localStorage`.
- Un fond décoratif est masqué aux lecteurs d'écran (`alt=""` + `aria-hidden="true"`) et ne capte pas le
  pointeur. Sur une page en `flex`, le conteneur doit être `relative` et la carte `relative z-10` : un
  enfant `absolute` sans `z-index` est peint **au-dessus** du contenu non positionné.
- **Un nom `truncate` qui entre dans une rangée flex a besoin de `min-w-0`, pas seulement de `min-w-0`
  sur son parent.** Un item flex a `min-width: auto` : il ne rétrécit pas sous sa largeur min-content, et
  `truncate` implique `white-space: nowrap`, donc min-content = texte entier. Le `min-w-0` du `<div>`
  parent ne sert à rien — c'est l'item lui-même (le `<Link>` du nom) qui doit le porter, faute de quoi
  la pastille de code de facturation se fait chasser hors de la carte au lieu que le nom s'ellipse.
  Testé par `compareDocumentPosition` dans `ScopeListPage.test.tsx`, en scoping **le même conteneur**
  pour la pastille et le nom : `FOLLOWING` est aussi Positionné entre sous-arbres disjoints, donc deux
  rendus distincts du même périmètre (le `<tr>` et le `<li>` mobile portent tous deux `role="link"`) se
  répondraient mutuellement.
- **La pastille de code de facturation précède le nom, pas le badge KB.** Elle est dans la même rangée
  `flex items-center gap-1.5` que le nom, en table comme en carte mobile et en page de détail, où elle est
  le premier enfant du titre. Aucun libellé visible « Code de facturation : » : l'`aria-label` du composant
  porte déjà l'information, et sur le détail le sous-groupe `gap-1.5` pastille↔nom cohabite avec le
  `gap-2.5` nom↔badge KB, donc la distinction visuelle se fait par le gap et non par un libellé.
- **L'outline d'un graphique se retire sur le `<svg>`, pas sur le wrapper.** Tant que recharts n'a pas
  `accessibilityLayer`, il n'est pas focusable et aucun anneau n'est peint : `rootTabIndex` vaut alors
  `undefined` et aucun `tabIndex` n'est posé. L'outline par défaut ne disparaît donc que le jour où le mode
  accessible est activé, où `RootSurface` pose `tabIndex={0}` et `role="application"` **sur le `<svg
  class="recharts-surface">`**. Le `className` passé à `<LineChart>` atterrit sur le `.recharts-wrapper`
  (`RechartsWrapper.js:347`) et ne l'atteint pas : il faut une variante arbitraire descendant
  `[&_.recharts-surface]:…` portée par notre conteneur, ou le `outline: none` est un no-op.
- **Une carte pose `bg-white` ET `dark:bg-nord-1`, sur la même chaîne.** Dans une carte
  sombre, un fond *enfoncé* (en-tête de tableau, ligne dépliée, pied) prend `dark:bg-nord-0`
  avec son opacité, et doit rester plus sombre que le fond : sinon il se fond dans les lignes. Le
  tableau du journal d'audit avait oublié son pendant sombre — **seul cas restant dans le dépôt**,
  vérifié par contrôle croisé sur `pages/` et `components/`. Le symptôme était trompeur : le texte
  et les en-têtes étant bien thémés, seules les lignes de données restaient claires. Et aucun
  test jsdom ne l'attrape : `setup.ts` ne charge pas Tailwind et jsdom ne calcule aucun layout,
  donc `getComputedStyle` renverrait `rgb(255, 255, 255)` quel que soit le `className`. D'où le
  **garde-fou de classe** de `AuditLogPage.test.tsx`, même catégorie que `expectDoesNotClip` — il
  échoue quand la classe disparaît, et la preuve réelle reste le coup d'œil sur la page.
- **`outline-none` sans `outline-solid` ne remplace rien, il supprime.** `focus-visible:outline-2` compile
  en `outline-style: var(--tw-outline-style)`, et c'est `outline-none` qui met cette variable à `none` sur le
  même élément : le substitut ne serait jamais peint, et l'on perdrait l'anneau du navigateur *et* le
  nôtre. Toujours parejaire `outline-none` et `focus-visible:outline-solid` — c'est vérifiable dans le CSS
  compilé, pas à l'œil. **`ring-*` ne convient pas ici** : Tailwind l'implémente en `box-shadow`, que le
  `<svg>` ne peint pas. Un test jsdom ne prouve aucun de ces deux faits : `setup.ts` ne mocke ni
  `ResizeObserver` ni les dimensions, `RootSurface` renvoie `null` sous 0×0, donc le `<svg>` n'est jamais
  monté et le test porte sur le conteneur — un garde-fou de classe, pas de rendu.
- **La page `/analyse` dérive entièrement de `GET /scope-monitorings`.** Aucun
  endpoint d'agrégation, aucun use case, aucune migration : la liste renvoie déjà les
  périmètres avec leur historique. Un serveur d'agrégation n'aurait de sens qu'au-delà
  de ce que le navigateur tient — et il faudrait l'avoir mesuré avant de le créer.
- **Toute la logique de `/analyse` est pure et vit dans `utils/analytics.ts`.** Les
  composants ne calculent rien : ils reçoivent des agrégats et les rendent. C'est ce qui
  rend la page testable sans rendu — **les sparklines SVG maison** (`Sparkline.tsx`)
  remplacent Recharts sur cette page (pas de recharts, pas de problème d'outline,
  365 kB économisés). Les données viennent de `aggregateByDay` / `aggregateByWeek`
  et `coverageByColumn` — code pur déjà testé et jamais rendu avant ce changement.
- **Un seul sens de tri pour le classement : du plus dégradé au moins dégradé.** Y
  compris pour le taux de transformation, donc croissant. Faire varier le sens selon la
  métrique est une faute d'usage, pas une commodité : un superviseur cherche qui traiter
  en premier. Un taux indéfini (aucune erreur) passe en dernier dans **les deux** sens,
  et jamais comme un 0 % — un `null` mal trié placerait le meilleur périmètre en tête.
- **L'arriéré et les erreurs ne sont pas la même quantité** : une aire empilée
  d'erreurs brutes se lirait comme un backlog qui n'en est pas un.
- **Un cumul n'a pas sa place sur une page de consultation.** La page de détail ne
  porte qu'un graphique, « Tendance des erreurs et incidents », en valeurs
  quotidiennes : c'est le graphique qui répond à la seule question actionnable —
  quel jour a eu des erreurs sans incident. Le cumul erreurs/incidents a été retiré
  (avec `buildCumulativeTrend`) pour deux raisons cumulatives, dont une
  **algébrique** : son arriéré valait `erreurs - incidents`, donc empiler
  `incidents` + `arriéré` reconstruisait `erreurs`, et la courbe du dessus
  reproduisait exactement le haut de son propre empilement. Le graphique affichait
  deux fois le même total dans deux registres visuels, lisibles comme deux mesures
  distinctes. S'y ajoute le fait qu'un cumul ne croît que par construction : il
  répond « combien depuis le début ? », ce qui ne change plus après quelques
  semaines. Ne pas le réintroduire en version « plus jolie » : sans la seconde
  courbe du dessus, la seule grandeur cumulative défendable est l'arriéré, et elle
  se lit comme un nombre dans les KPI.
- **`incidents ⊆ erreurs` est une convention de saisie, garantie nulle part.** Ni
  `CHECK` SQL (`errors_reported` et `incidents_created` sont deux `INTEGER NOT
  NULL DEFAULT 0` indépendants), ni validation croisée Pydantic, ni règle de
  domaine — `InvalidIncidentsCreatedError` existe mais n'est jamais levée. Pire,
  la relation est **absorbée en silence** : `trailingErrors` fait
  `max(erreurs - incidents, 0)` et `transformationRate` fait
  `round(incidents / erreurs * 100)`, donc une saisie incohérente donne un
  arriéré de 0 et un taux > 100 % — des chiffres plausibles, non signalés. Ne pas
  « durcir » ça par une contrainte : un `CHECK` ajouté au schéma idempotent du
  démarrage est un no-op sur une base déjà peuplée (`CREATE TABLE IF NOT EXISTS`),
  et un vrai `ALTER TABLE ... ADD CONSTRAINT` bloquerait le démarrage sur une
  ligne historique incohérente — même piège que `billing_code` (§28.1). La
  garantie, si on la veut un jour, passe par une exception de domaine et un
  avertissement affichable, jamais par une colonne.
- **Les deux plafonds de lisibilité de `/analyse` sont explicites parce qu'ils
  contredisent le choix de l'utilisateur** : au-delà de 120 jours on force la semaine (et on
  le dit), au-delà de 15 périmètres le classement affiche `+N autres périmètres`.
  Un plafond silencieux fait passer une sélection pour respectée alors qu'elle ne
  l'est pas.
- **L'URL de `/analyse` est un reflet de l'état local, pas sa source.** Écrire l'URL
  depuis le `setState` met un effet de bord dans un updater (React peut l'appeler deux fois
  en mode strict). `scopeIds` s'écrit **toujours**, avec la sentinelle `-` pour une
  sélection vide : une clé absente se lit « tous les périmètres », donc l'URL d'une
  sélection vide ramènerait l'utilisateur à la vue complète. L'écriture est suspendue
  pendant le chargement des périmètres.
- **Le classement de `/analyse` est une liste HTML, pas un graphique à barres.** La
  valeur est en texte (la barre est `aria-hidden`), la barre est calée sur le pire
  périmètre. **Le taux de transformation n'est plus inversé** (la barre suit
  `totalErrors`, un taux indéfini n'a pas de barre). Un taux indéfini n'a aucune
  barre — une barre nulle se lirait comme un 0 %.
- **La heatmap de `/analyse` porte les erreurs brutes par jour ou par semaine.** Une
  ligne représente un périmètre, une colonne une jour ou une semaine ISO selon le
  réglage `granularity`, et l'intensité de la cellule est proportionnelle à
  `errors_reported`. Un `0` signifie une saisie sans erreur ; une cellule sans
  activité affiche `—` et porte le libellé accessible « aucune saisie ». Elle suit
  le réglage `granularity` : un regroupement forcé en semaine rendrait le sélecteur
  « Par jour » mensonger. Le classement sous la heatmap trie sur le total d'erreurs
  de la période. L'évolution d'une cellule compare la colonne à la
  précédente **affichée** — en vue journalière, deux colonnes consécutives peuvent
  être séparées par un week-end filtré — et reste indéfinie quand la base est absente
  ou nulle.
- **La heatmap déborde, et doit pouvoir défiler.** En vue journalière, 120 jours font
  120 colonnes d'au moins 2 rem : un `overflow-hidden` y.clipperait des colonnes hors
  d'atteinte, visuellement **et** au clavier, ce qui est pire qu'une barre de
  défilement. Le conteneur est donc `overflow-x-auto`, la colonne des noms est
  `sticky left-0`, et la région prend `tabIndex={0}` quand elle déborde réellement
  (au-delà de 12 colonnes) — un conteneur défilant non focusable est inatteignable au
  clavier (WCAG 2.1.1), et un `tabIndex` permanent serait un point d'arrêt sans effet.
  **Le coin `sticky` de l'en-tête est opaque** (`bg-slate-50` au lieu de
  `bg-slate-50/80`) pour éviter l'artefact de superposition au défilement. Les filets
  blancs entre cellules sont remplacés par `gap-px` + `rounded-[3px]` +
  `border-slate-100/60 dark:border-nord-2`. Les paliers d'intensité passent de 3
  non contigus à **5 paliers continus AA-conformes** (`blue-100` → `blue-200` →
  `blue-300` → `blue-700` → `blue-900` en clair, `nord-2` → `nord-3` → `nord-7` →
  `nord-8` → `nord-9` en sombre), chaque palier portant son texte `text-xs` à
  ≥4,5:1. Une **légende visuelle** (5 pastilles + « `—` : aucune saisie ») est rendue
  sous la matrice depuis le même tableau unique `HEATMAP_SCALE`. En vue journalière,
  un **séparateur de semaine** (filet `border-l-2`) marque le changement de semaine
  ISO. Le **total par périmètre** apparaît dans la cellule de nom (droite,
  `ml-auto tabular-nums`), évitant une colonne supplémentaire qui dupliquerait le
  classement.
- **Un test de `/analyse` ne doit pas chercher un nombre global.** En vue
  journalière, les en-têtes de colonne portent « 11 », « 12 »… Un `getByText("11")`
  sur la page entière peut donc tomber sur la heatmap au lieu du compteur KPI :
  passer par `within(screen.getByRole("region", { name: /résumé/i }))`.
- **Le classement est un doublon assumé de la heatmap.** `ErrorRanking` trie les
  mêmes `totalErrors` que les lignes de la heatmap, sur un seul critère décroissant
  (l'ancien tri à deux sens selon la métrique, avec taux de transformation, a été
  supprimé avec l'aire empilée). Il est conservé pour l'ordre, la navigation vers
  le détail et la valeur en texte : le supprimer est possible, le « réparer » en
  réintroduisant une métrique ne l'est pas.
- **La première carte de `/analyse` suit la hiérarchie de décision.** `Période` et
  `Affichage` sont regroupés en réglages secondaires ; `Périmètres comparés` est
  un bloc pleine largeur, avec l'explication de son effet sur les graphiques, le
  compteur `N sur M`, des actions globales explicitement nommées et désactivées
  quand elles n'ont plus d'effet. Une sélection vide est volontairement atteignable
  et signale la conséquence dans la carte, sans laisser un écran de graphiques vide
  sans explication.
- **Le filtre de codes de facturation est multi-sélectionnable en chips.** Il inclut
  une option `Sans code` pour les lignes historiques sans code. **Tous les codes sont
  accessibles** (plus de `+N autres` non cliquable). Il ne détruit jamais
  `scopeIds` : il réduit seulement les périmètres analysés et les actions globales
  s'appliquent aux périmètres visibles après filtrage. Retirer tous les codes
  sélectionnés restaure la sélection de périmètres précédente.
- **La sélection des périmètres passe par un multi-select compact.** La carte n'affiche
  jamais la liste complète en permanence : un déclencheur affiche la recherche et le
  compteur, puis ouvre un popover desktop ou la `Modal` existante sur mobile. La liste
  contient une recherche, de vraies cases à cocher, « Tout cocher », « Tout décocher »
  et « Terminé ». La sélection est appliquée immédiatement, sans état intermédiaire.
  Le conteneur de la liste peut donc être `max-h-72 overflow-y-auto` : il reste dans le
  popover, n'augmente pas la hauteur de la carte, et reste atteignable au clavier.
  **Sur mobile (< 768 px), la carte de filtres se replie** derrière un bouton
  « Filtres » avec compteur de réglages actifs ; l'export reste dans l'en-tête.
- **`PageNav` n'est monté que dans le pied de page.** Il était aussi dans l'en-tête, où
  « Périmètres » faisait doublon avec le logo : on a retiré l'instance de `Navbar`, pas ses
  entrées, ce qui laisse `PageNav` complet pour le mobile. **Le pied de page est le seul chemin
  vers Analyse et Journal sur téléphone**, là où Ctrl+Alt n'existe pas : le supprimer de `App.tsx`
  les rendrait inatteignables sur mobile. `NavLink` a besoin de `end` sur `SCOPE_LIST_PATH` :
  sans lui, `/` est active sur toutes les pages et « Périmètres » serait marqué courant partout.
  `aria-current` porte l'information d'état actif, pas la couleur.
- **Les deux vues hors en-tête passent par `PageShortcuts`** (`Ctrl+Alt+G`, `Ctrl+Alt+L`), un seul
  `keydown` pour les deux liaisons — deux composants dupliqueraient la même garde. La touche est
  comparée en minuscules, et `shiftKey` est explicitement refusé pour ne pas capter une mainlevée
  que le bureau envoie pour autre chose. Le raccourci navigue **modale ouverte comprise**, ce qui
  démonte une saisie en cours : il est global, il ne consulte donc pas l'état des modales qui vit
  dans `AppContent`, et c'est un choix assumé.
- **`/analyse` n'a pas de location nginx.** Le `try_files $uri $uri/ /index.html` de la SPA
  sert déjà les routes inconnues, donc un bloc dédié serait un no-op — et une
  illusion d'étape obligatoire. En revanche, une route **d'API** imposera son
  entrée dans `vite.config.ts` (proxy de dev) sous peine de CORS.
 - Tests : `npm test` (vitest, 338 tests) et `npm run lint` (`tsc --noEmit`). Le
  `beforeEach` de `ScopeListPage.test.tsx` fixe la date du jour ; elle doit être un
  **jour ouvré** (lundi 2026-09-21), sinon la page s'ouvre sur le jour ouvré précédent
  et tous les scénarios décalent d'un jour. `setup.ts` allonge
  `asyncUtilTimeout` : le délai d'une seconde par défaut ne suffit pas quand la suite
  lance un jsdom par fichier en parallèle, et l'échec qui en résulte est une
  panne de machine, pas une régression. Même origine pour `pool: "threads"` dans
  `vite.config.ts` : en `forks`, un processus node par cœur × un jsdom par fichier
  se fait tuer par l'OOM sur une machine chargée, et l'échec affiché est un worker
  mort, non un test rouge.
- **Le filtre recherche de la page principale classe par où la requête a porté, pas par ordre
  alphabétique.** Un quadrigramme apparu en `official_main` (responsable) doit remonter avant ceux où il
  n'est qu'en `official_backup` (suppléant), eux-mêmes avant les hits nom / KB / code de facturation.
  Le prédicat de filtre et le calcul du rang sont **le même** (`utils/search.ts` : `matchesSearchQuery`,
  `officialMatchRank`, `sortByOfficialRelevance`) : deux règles séparées classeraient différemment de ce
  qui a filtré, et afficheraient « sans correspondance » un périmètre retenu à l'écran. La comparaison
  porte sur la chaîne entière, sans split sur `/`, pour cette même raison. L'ordre d'arrivée est conservé
  à rang égal (index d'origine en second critère, pas de confiance implicite en la stabilité de `sort`) ;
  l'API renvoyant `ORDER BY name`, chaque groupe reste alphabétique. Requête vide ⇒ tous les rangs égaux
  ⇒ liste du serveur intacte.
- **Le raccourci « mes périmètres » écrit dans le champ de recherche, il ne porte pas son propre
  filtre.** L'icône `UserRound` à droite de l'input remplit `searchQuery` avec le `quadrigramme`
  transmis en prop depuis `App.tsx` (`session.quadrigramme`), et un second clic le vide — `aria-pressed`
  porte l'état, libellé stable. Deux raisons pour ne pas faire un filtre séparé : une seule règle de
  correspondance à maintenir (un prédicat `official_main`/`official_backup` exact serait un **deuxième**
  juge, et les deux divergeiraient), et le tri responsable-suppléant ci-dessus s'applique alors sans
  une ligne de code. **Corollaire assumé** : `matchesSearchQuery` est un `includes` sur tous les
  champs, donc un périmètre qui porte le code dans son **nom** survit au filtre — il arrive en dernier.
  « Où je suis officiel » et « ce que le nom contient » ne sont pas la même question, et le raccourci
  répond à la seconde, qui est celle du champ de recherche qu'il remplit. Conséquence annexe : le
  compteur « Affichage de X sur Y » et l'export (`filteredScopes`) suivent le raccourci, puisque
  c'est la liste filtrée qui les alimente. Verrouillé par `filtre la liste sur mon quadrigramme`,
  dont la fixture comporte un hit par le nom **et** un périmètre Stranger qui doit disparaître — le
  second est le seul qui prouve que le bouton filtre, le premier qu'il classe seulement.
- **Le quadrigramme ne se lit pas dans `localStorage`.** Il vient de `GET /auth/me` et vit dans l'état
  React de `App.tsx`, passé en prop — exactement comme `projectName` vers `Navbar`. Une session n'est
  pas persistée côté front : le cookie de session est `HttpOnly`, donc illisible en JS. Un `getItem`
  sur une clé que rien n'écrit lit `null`, se `JSON.parse` en `{}`, et rend silencieusement une
  chaîne vide : un bouton affiché, actif, et sans effet. Si une session doit survivre à un
  rechargement, elle vient de `protabApi.getSession()`, pas du stockage local.

## 28.7 Journal d'audit : trois filtres qui ont été cassés, et pourquoi

  Les trois défauts ci-dessous ont coexisté sans qu'aucun test ne les voie : ils vivaient dans
  l'angle mort entre l'adaptateur SQL et l'écran. Toute règle de filtre nouvelle doit se poser la
  question « qu'est-ce que l'utilisateur tape, et que le serveur lui rend-il ? ».

- **Le champ périmètre demandait un UUID.** La saisie brute partait en `scope_id`, comparé par
  égalité : filtrer par le nom d'un périmètre renvoyait zéro ligne, et le placeholder affichait
  `(scope_id)` pour le rappeler. Le paramètre est désormais `scope_ids` (un tuple, liste vide = pas
  de filtre) et l'écran passe par `ScopePicker`, donc par les **noms**. Le nom du périmètre est résolu
  par la route (`find_all_scope_names`), jamais dénormalisé dans `audit_log` : le journal ne doit pas
  garder une copie d'un nom que `scope_monitorings` porte déjà.
- **L'acteur comparait l'égalité d'un code stocké en majuscules.** `actor = %s` sur une colonne
  alimentée par `create_session` (`quadrigramme.strip().upper()`) renvoyait zéro ligne pour `abcd`
  comme pour le partiel `AB`. C'est désormais `ILIKE 'préfixe%'`. **Conséquence assumée** : un
  préfixe *élargit*, donc on ne peut pas isoler exactement un acteur dont le code est un préfixe d'un
  autre — sans effet sur des quadrigrammes de même longueur, qui est le cas réel. La normalisation
  (`.strip().upper()`, blanc = aucun filtre) est faite **une seule fois à la frontière entrante**
  (`app.py`), sinon les deux adaptateurs la redéclarent et divergent. `ILIKE` n'utilise pas
  `idx_audit_log_actor` (un btree ne sert pas un `ILIKE`) : acceptable à l'échelle d'un journal, et
  préféré à un `LIKE` pré-majusculé parce que l'insensibilité à la casse ne doit pas dépendre de la
  façon dont la colonne est stockée aujourd'hui.
- **La période filtrait `day`, la colonne qui est `NULL` sur un tiers du journal.** `day` est la
  journée *métier concernée* ; les créations de périmètre, imports CSV et notes de périmètre n'en ont
  pas. Brancher l'existant `from_date`/`to_date` sur des champs date aurait fait disparaître ces
  événements sans le moindre signe. La période filtre donc **`created_at`** — « quand le changement a
  été enregistré », ce que la promesse de la page annonce — et `from_date`/`to_date` ont disparu,
  personne ne les envoyant. Verrouillé par
  `tests/integration/adapters/postgres_audit_trail_repository_test.py::test_list_period_keeps_events_without_a_business_day`
  et son écho `audit_log_api_test.py::test_get_audit_log_period_keeps_events_without_a_business_day`.

  - **La fenêtre est semi-ouverte** (`from_created_at` inclusif, `to_created_at` exclusif) et les
    bornes sont des **instants**, pas des dates. Le serveur n'a aucun fuseau, donc le front résout les
    minuits locaux (`isoDateToLocalDayStart` / `isoDateToNextLocalDayStart`, `utils/date.ts`) — le même
    fuseau qui affiche les horodatages et indexe la heatmap, sinon le filtre et l'affichage se
    contrediraient. `new Date("2026-09-19")` est lu en UTC par `Date` et décalerait la journée à
    l'heure d'été ; la borne haute est le **lendemain**, car `23:59:59` perd la dernière seconde.
- **Le debounce doit observer la valeur différée, pas l'objet d'état.** Une frappe produit un objet
  `filters` neuf ; un effet indexé sur son identité déclenche une requête par caractère et rend le
  debounce inerte tout en ayant l'air posé. D'où le `useMemo` sur les champs (`AuditLogPage.tsx`),
  chaque champ listé par identité. Complété par un `requestIdRef` : sans lui, la réponse lente de
  `AB` peut atterrir après celle de `ABCD`. `useDeferredValue` ne conviendrait pas — il garde la valeur
  périmée interactive.
- **`ScopePicker` est partagé entre `/analyse` et le journal**, et prend donc un `label` : hériter du
  « Périmètres analysés » nommerait la mauvaise chose à un lecteur d'écran. Toute page qui filtre par
  périmètre récupère le composant, pas une copie.
- **Le plafond de 500 est annoncé seulement quand il est atteint** (`events.length === 500`). Le pied
  de page affirmait « sur les 500 plus récents » sur un journal de trois événements ; une limite
  affichée en permanence est une limite invisible. La page n'a pas de pagination — c'est un choix
  assumé, pas une dette : le filtre par période rend le plafond moins contraignant.
- **Une carte qui abrite un popover ne doit pas le rogner.** Les deux cartes de filtres
  (`AuditLogFilterBar`, `AnalyticsFilterBar`) portaient `overflow-hidden`, et le popover de
  `ScopePicker` est en `position: absolute` **à l'intérieur** d'elles : il était donc coupé à leur bord
  bas, sans le moindre symptôme en console. Sur le journal, le sélecteur étant le 2ᵉ fieldset sur 3,
  environ 150px d'un popover de ~448px restaient visibles — la recherche et une ligne, puis plus rien.
  Le `rounded-t-xl` de l'en-tête remplace le rognage, qui n'existait que pour arrondir les coins
  supérieurs. **`overflow-hidden` sur le popover lui-même reste correct** (il le découpe sur ses propres
  coins, cf. `Navbar.tsx:137`) : c'est l'ancêtre qui pose problème.
  Verrouillé par `expectDoesNotClip` (`src/test/overflowGuard.ts`), appelé dans les deux tests de barre
  de filtres. C'est un **garde-fou de classe, pas une preuve de rendu** : jsdom ne calcule aucun layout
  *et* ne charge pas Tailwind, donc `getComputedStyle(...).overflow` renverrait `visible` quel que soit
  le `className` — une assertion sur le style calculé passerait toujours. Le coup d'œil sur la page
  reste la seule preuve. Le chemin mobile est immunisé : le `Modal` est en `position: fixed`, dont le
  bloc conteneur est le viewport, donc un `overflow-hidden` d'un ancêtre ne le rogne pas.

## 28.8 Références FEAI : une graphie stockée, une saisie tolérante

- **La forme canonique est `[PREFIXE-]INC\d{9}`, préfixe facultatif de 2 à 5 lettres**
  (`FE-INC000000001`). `FEAI` et `FEAI-` désignent la même famille : le préfixe est
  générique et non unique, comme `billing_code` (§28.1). Aucun préfixe n'est
  enregistré à part, donc rien à migrer : `INC000000001` reste valide tel quel.
- **Une seule graphie est stockée, donc la canonicalisation est un invariant du domaine.**
  `canonical_feai()` (`daily_activity.py`) réduit les séparateurs (espace, tiret, slash) à un
  tiret unique et insère le tiret d'un préfixe collé au code ; `_validate()` **retourne** la
  liste canonique, consommée par `__post_init__` comme par `update()`. La canonique se juge donc
  au double endroit qui compte : le doublon et le stockage. Sans elle, `FE INC000000001` et
  `FE-INC000000001` seraient deux références distinctes dans la même journée, et le compteur
  d'erreurs par FEAI ne serait pas recomptable.
- **Le doublon se juge sur la forme canonique**, jamais sur la chaîne saisie — même raison.
  `validateActivityForm` normalise avant de valider, et `FeaiTagInput.addCode` compare au
  `values.includes(code)` déjà canonique.
- **`normalizeFeai()` ne touche pas à la casse** : les deux Points d'entrée mettaient déjà tout en
  majuscules, et `isValidFeai('inc000000001') === false` reste le contrat testé. Élargir
  `isValidFeai` aux minuscules aurait supprimé cette garantie sans rien demander à personne.
- **Une longueur de référence est une constante, jamais un `12` littéral.** Trois copies du
  nombre existaient (`FeaiTagInput`, `maxLength`, `code.length === 12`, `maxLength`) et le
  préfixe les rendait toutes fausses — le modal refusait une référence valide *et* son indicateur
  vert ne s'allumait jamais. `FEAI_MAX_LENGTH = 18` (5 + 1 + 12) est la seule déclaration ; côté
  Python, `_FEAI_PATTERN` borne déjà la longueur, donc rien à déclarer de plus.
- **Le `trim()` à la frappe est interdit dans un champ dont le contenu comporte une séparatrice.**
  `handleFeaiChange` faisait `val.trim().toUpperCase()` : taper `FE ` renvoyait `FE`, la forme
  avec espace — la forme naturelle de la saisie — était littéralement impossible à saisir. La
  normalisation se fait à l'enregistrement (`cleanedFeai`), pas à la frappe ; seul
  `aria-label` du bouton de suppression garde son `trim()`.
- **Le brouillon reste brut, la persistance est canonique.** Dans `ActivityFormModal`, une
  référence en cours porte ce que l'utilisateur a tapé ; après enregistrement elle est relue
  `FE-INC000000001`. C'est assumé : retransformer la frappe ferait sauter le curseur, et c'est
  la forme stockée qui fait foi.
- **Les deux implémentations de saisie ne partagent que les règles.** `FeaiTagInput` (pustes,
  annulation par rafale) et `ActivityFormModal` (brouillon) ont chacune leur UI, mais
  `normalizeFeai`/`isValidFeai` sont le seul juge — d'où l'intérêt de `normalizeFeai` dans
  `utils/validation.ts` : toute divergence de message ou de doublon se paie deux fois.
  Verrouillé par `ActivityFormModal.test.tsx`, créé pour ce point : la modale n'avait
  **aucun** test.
- **Un `aria-label` par champ, pas un `placeholder` comme nom accessible.** Le `placeholder`
  disparaît dès la première frappe ; `Référence FEAI ${idx + 1}` reste et donne un nom au champ
  dans les deux implémentations.


## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.

### Keeping the graph current

- Run `make graph-update` **before** committing, so the graph lands in the same commit as the code it describes. The graph is versionned for exactly this reason: a stale graph misleads the next agent more surely than an absent one, and it is cheaper to ship one current file than to rediscover the architecture.
- A `post-commit` hook rebuilds the graph in the background as a safety net for a forgotten `make graph-update`, so a dirty `graph.json` right after a commit is expected — commit it with the next change, or run `make graph-update` and commit it alone.
- `core.hooksPath` is **local** config that Git does not propagate, so a fresh clone has no hook. Run `make graph-hooks-install` once per clone; re-run it after upgrading graphify, since the hooks embed the parser version that wrote them.
- The hooks are versionned in `.githooks/` (not `.git/hooks/`) so they are reviewed like any other script, and they run detached, logging to `~/.cache/graphify-rebuild.log` rather than blocking or failing a commit. The interpreter path they pin at install time is a guarded preference, not a requirement — another clone falls through to the versionned `graphify-out/.graphify_python`, then to the `graphify` launcher on `PATH`.
- Only three generated files are tracked: `graph.json`, `GRAPH_REPORT.md`, `manifest.json`, plus three machine markers graphify writes beside them (`.graphify_root`, `.graphify_python`, `cost.json`, a few hundred bytes in total). Everything else under `graphify-out/` is ignored — the AST cache (files named by content hash, one per parser revision), the dated pre-update snapshots (2.5 MB of the old state, added by every single update), `graph.html`, the labels and their signature, and `wiki/`. That split took the tracked footprint from 27 MB to 2.8 MB and a single `graphify update` from 38 changed files to 3; the alternative was a graph too expensive to maintain, and therefore abandoned.
