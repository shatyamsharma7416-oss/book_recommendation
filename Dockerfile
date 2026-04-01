FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Render sets PORT dynamically, default to 8000
ENV PORT=8000

# Run uvicorn binding to 0.0.0.0 so Render can reach it
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT} --log-level warning"]
