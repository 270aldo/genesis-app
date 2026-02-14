# GENESIS BFF — FastAPI Backend for Frontend
# Production-ready Dockerfile for Cloud Run deployment
FROM python:3.12-slim

# Labels for Cloud Run metadata
LABEL org.opencontainers.image.title="GENESIS BFF"
LABEL org.opencontainers.image.description="FastAPI Backend for Frontend with ADK multi-agent system"
LABEL org.opencontainers.image.version="1.0"

# Set Python to run unbuffered for proper logging
ENV PYTHONUNBUFFERED=1

# Create non-root user for security
RUN useradd -m -u 1000 genesis && \
    mkdir -p /app && \
    chown -R genesis:genesis /app

WORKDIR /app

# Copy requirements and install dependencies
COPY --chown=genesis:genesis requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (exclude tests, scripts, knowledge — see .dockerignore)
COPY --chown=genesis:genesis main.py .
COPY --chown=genesis:genesis agents/ agents/
COPY --chown=genesis:genesis routers/ routers/
COPY --chown=genesis:genesis services/ services/
COPY --chown=genesis:genesis data/ data/

# Switch to non-root user
USER genesis

# Cloud Run sets PORT env var; default to 8000 if not set
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
