FROM ghcr.io/astral-sh/uv:python3.13-trixie-slim
WORKDIR /app

# Install locked dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

# Copy application code, alembic configuration, and migrations
COPY app ./app
COPY alembic.ini ./
COPY alembic/ ./alembic/

# Make the container's virtual environment available
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Apply migrations, then start the server.
# Render sets $PORT; locally it falls back to 8000.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
