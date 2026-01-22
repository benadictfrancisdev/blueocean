# Quick Start Guide - DataForge AI Backend

## Prerequisites
- Docker and Docker Compose installed
- OR Python 3.11+, PostgreSQL, and Redis for local development

## Option 1: Docker (Recommended - 2 minutes)

1. **Navigate to backend directory**:
   ```bash
   cd blueocean/backend
   ```

2. **Start all services**:
   ```bash
   ./start.sh
   ```
   Or manually:
   ```bash
   docker-compose up -d
   ```

3. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

4. **Access the API**:
   - API Base URL: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs
   - Alternative Docs: http://localhost:8000/redoc

5. **Test the health endpoint**:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

## Option 2: Local Development

1. **Set up Python environment**:
   ```bash
   cd blueocean/backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Start PostgreSQL and Redis** (using Docker):
   ```bash
   docker run -d --name dataforge-postgres \
     -e POSTGRES_DB=dataforge \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 postgres:15-alpine

   docker run -d --name dataforge-redis \
     -p 6379:6379 redis:7-alpine
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

4. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

5. **In a separate terminal, start Celery worker**:
   ```bash
   source venv/bin/activate
   celery -A app.celery_worker worker --loglevel=info
   ```

## First API Call - Upload a Dataset

### Using the interactive docs:
1. Open http://localhost:8000/docs
2. Navigate to POST `/api/v1/datasets/upload`
3. Click "Try it out"
4. Upload the `sample_data.csv` file
5. Fill in optional fields (name, description)
6. Click "Execute"

### Using curl:
```bash
curl -X POST "http://localhost:8000/api/v1/datasets/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_data.csv" \
  -F "name=Employee Sample Data" \
  -F "description=Sample employee dataset for testing"
```

### Response:
```json
{
  "status": "success",
  "data": {
    "dataset": {
      "id": 1,
      "name": "Employee Sample Data",
      "file_type": ".csv",
      "row_count": 20,
      "column_count": 8,
      ...
    },
    "task_id": "abc123..."
  },
  "message": "Dataset uploaded successfully. Analysis in progress."
}
```

## Check Analysis Status

```bash
curl "http://localhost:8000/api/v1/analysis/status/1?task_id=abc123..."
```

## Get Analysis Results

```bash
curl "http://localhost:8000/api/v1/analysis/results/1"
```

## Example Workflow

1. **Upload a dataset** → Returns dataset ID and task ID
2. **Check status** → Monitor analysis progress
3. **Get results** → Retrieve comprehensive analysis
4. **Get summary** → Quick overview for visualization
5. **Get column stats** → Detailed statistics for specific columns
6. **List datasets** → View all uploaded datasets
7. **Delete dataset** → Clean up when done

## Stopping Services

### Docker:
```bash
docker-compose down
```

### Local:
- Stop uvicorn: `Ctrl+C` in the terminal
- Stop Celery: `Ctrl+C` in the Celery terminal
- Stop PostgreSQL and Redis containers:
  ```bash
  docker stop dataforge-postgres dataforge-redis
  ```

## Troubleshooting

### Port already in use
- PostgreSQL (5432), Redis (6379), or API (8000) ports are taken
- Change ports in `docker-compose.yml` or stop conflicting services

### Database connection error
- Ensure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL in .env

### Celery worker not processing tasks
- Check if Celery worker is running: `docker-compose logs celery-worker`
- Verify Redis connection: `redis-cli ping`

### File upload fails
- Check file size (max 500MB by default)
- Verify file type is supported: CSV, Excel, JSON, Parquet
- Check uploads/ directory has write permissions

## Next Steps

- Explore the interactive API docs at `/docs`
- Try different file types (Excel, JSON, Parquet)
- Examine the detailed analysis results
- Review the code structure in `app/`
- Run tests: `pytest`
- Create database migrations: `alembic revision --autogenerate -m "message"`

## Support

For issues or questions:
- Check the full README.md
- Review the code documentation
- Open an issue on the repository
