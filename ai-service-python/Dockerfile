FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY ai-service-python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared folder to /app/shared
COPY shared ./shared

# Copy app code to /app/ai-service-python
COPY ai-service-python ./ai-service-python

# Copy .env to root of project (container view)
COPY .env* .

# Set WORKDIR to the service directory so main.py runs correctly
WORKDIR /app/ai-service-python

# We need to set PYTHONPATH so it can find 'shared' which is in /app
ENV PYTHONPATH="${PYTHONPATH}:/app"

CMD ["python", "main.py"]
