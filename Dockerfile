FROM python:3.11-slim

WORKDIR /app

COPY requirments.txt .
RUN pip install --no-cache-dir -r requirments.txt

COPY . .

EXPOSE 10000

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "10000"]