# ---------- Stage build : dépendances + package sous uv ----------
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS build

WORKDIR /app

# Cache Docker : ne réinstalle les deps qu'en cas de changement
# README.md requis par le backend uv_build (métadonnées du package)
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-dev --no-install-project

# Package applicatif
COPY src ./src
RUN uv sync --frozen --no-dev

# ---------- Stage runtime ----------
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    PROTAB_HOST=0.0.0.0 \
    PROTAB_PORT=8000

WORKDIR /app

COPY --from=build /app /app

EXPOSE 8000

CMD ["protab"]