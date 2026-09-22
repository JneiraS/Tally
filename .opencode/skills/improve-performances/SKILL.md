---
name: improve-performances
description: Analyze, diagnose, and optimize FastAPI + PostgreSQL performance. Use when reviewing or fixing slow endpoints, database/ORM queries (SQLAlchemy, Tortoise, SQLModel), N+1 problems, connection pooling, missing indexes, blocking calls in async routes, or when asked to profile/audit API performance, speed, latency, or caching.
---

# Skill: FastAPI & PostgreSQL Performance Optimizer

## Objective
Analyze, diagnose, and optimize the performance of a FastAPI + PostgreSQL application stack across API endpoints, database interactions, async concurrency, and system architecture.

---

## 1. FastAPI & Concurrency Optimization

- **Sync vs. Async Endpoints:**
  - Use `async def` only when invoking asynchronous I/O operations (e.g., `await db.execute(...)`).
  - Use standard `def` for blocking/CPU-bound operations or synchronous libraries to prevent blocking the Event Loop; FastAPI will run them in a thread pool.
- **Payload & Serialization:**
  - Utilize **Pydantic v2** models natively.
  - Exclude unneeded fields in query responses (`response_model_include` / `response_model_exclude`).
  - Use `ORJSONResponse` or `UJSONResponse` for high-volume JSON responses.
- **Middleware & Dependencies:**
  - Minimize heavy logic in global middleware.
  - Prefer cached dependencies (`use_cache=True`) where applicable.

---

## 2. PostgreSQL & ORM Optimization (SQLAlchemy / Tortoise / SQLModel)

- **Query Performance & N+1 Problems:**
  - Identify and fix N+1 query patterns using eager loading (`joinedload`, `selectinload` in SQLAlchemy).
  - Select only required columns using `select(Model.col1, Model.col2)` instead of fetching full entities.
- **Connection Pooling:**
  - Configure `AsyncEngine` with appropriate pool parameters:
    - `pool_size`: Baseline pool size matching available memory and DB worker limits.
    - `max_overflow`: Allowed extra burst connections.
    - `pool_recycle`: Periodically recycle connections to avoid stale socket drops (e.g., 1800s).
    - `pool_pre_ping=True`: Check connection viability before execution.
- **Database Indexing:**
  - Ensure single-column indexes on frequently queried/filtered attributes (foreign keys, status fields).
  - Suggest composite indexes for combined `WHERE` and `ORDER BY` patterns.
  - Suggest `B-Tree`, `GIN` (for JSONB/full-text search), or `BRIN` (for large time-series data) index types as appropriate.

---

## 3. Architecture & Caching Strategy

- **Caching Layer:**
  - Recommend Redis caching for read-heavy, low-churn endpoints or aggregated query results.
- **Background Tasks & Offloading:**
  - Offload long-running computations, email sending, or heavy report generation using Celery, ARQ, or SAQ.

---

## 4. Diagnostic & Audit Checklist

When reviewing code or performance reports, evaluate in order:
1. **Slow Queries:** Analyze execution plans (`EXPLAIN ANALYZE`). Check for missing indexes or sequential scans.
2. **Event Loop Stalls:** Detect blocking synchronous calls inside `async def` routes.
3. **Database Connection Leaks:** Ensure proper usage of async session context managers (`async with get_session() as session:`).
4. **Data Transfers:** Verify payload size and serialization time.