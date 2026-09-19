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
  - `InMemoryScopeMonitoringRepository` — **défaut**, utilisé quand `DATABASE_URL` est absent (tests, démo).
  - `PostgresScopeMonitoringRepository` — sélectionné quand `DATABASE_URL` est défini ;
    `psycopg` (sync) + `psycopg_pool`. Le schéma est créé **idempotemment au démarrage**
    (`CREATE TABLE IF NOT EXISTS`, pas d'outil de migration). Chaque `save()` remplace l'agrégat
    dans une transaction ; les contraintes DB (nom unique, unique `(scope_id, day)`) sont traduites
    en exceptions de domaine par l'adapter.
- Le core (domaine + application) ne doit **jamais** importer `psycopg`/`psycopg_pool` ni référencer
  les tables SQL : ils ne vivent que sous `adapters/outbound/persistence/`.

## 28.2 Configuration

- Chargée via `load_dotenv()` (`src/protab/adapters/inbound/api/config.py`) + `os.getenv`.
- Variables : `PROTAB_HOST`, `PROTAB_PORT`, `DATABASE_URL` (DSN PostgreSQL), `PROTAB_TEST_DATABASE_URL` (tests).
- Seuls des défauts/conteneurs de dev sont commités (cf. `.env.example`) ; aucun secret réel.

## 28.3 Tests d'intégration PostgreSQL

- `tests/integration/adapters/postgres_scope_monitoring_repository_test.py` est ignoré (`skip`) tant que
  `PROTAB_TEST_DATABASE_URL` n'est pas défini. Le lancer via `make test-db` (base `protab_test` créée si absente).

## 28.4 Conteneurisation & commandes utiles

- `docker-compose.yml` : `db` (postgres:17-alpine, volume `pgdata`, healthcheck), `api` (Dockerfile backend
  multi-stage uv), `frontend` (Dockerfile node → nginx, proxy `/scope-monitorings` → `api`, même origine).
- Cibles Makefile : `db-up`, `db-down`, `db-shell`, `docker-up`, `docker-down`, `test-db`.
- Dépendances runtime ajoutées pour la persistance : `psycopg[binary]`, `psycopg-pool`.
