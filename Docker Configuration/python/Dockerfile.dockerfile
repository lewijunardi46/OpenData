FROM python:3.12-slim

# Install dependencies OS yang dibutuhkan (contoh untuk pyodbc)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements.txt lalu install library Python
COPY requirements.txt .

RUN python -m pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy seluruh kode ke folder /app
COPY . .

CMD ["python", "app.py"]
