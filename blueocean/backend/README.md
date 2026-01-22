# DataForge AI Backend

AI-powered data analysis platform backend API built with FastAPI.

## Features

- **File Upload**: Support for CSV, Excel, JSON, and Parquet files
- **Comprehensive Analysis**: Automated data quality, statistics, and correlation analysis
- **Async Processing**: Background job processing with Celery and Redis
- **RESTful API**: Clean, documented API endpoints
- **Database Storage**: PostgreSQL for persistent data storage
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: PostgreSQL 15 with SQLAlchemy ORM
- **Task Queue**: Celery with Redis backend
- **Data Processing**: Pandas, Polars, NumPy, scikit-learn
- **File Support**: CSV, Excel (xlsx/xls), JSON, Parquet

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository and navigate to the backend directory:
```bash
cd blueocean/backend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up -d
```

4. Check the logs:
```bash
docker-compose logs -f backend
```

5. Access the API:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL and Redis:
```bash
# Using Docker for dependencies only
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dataforge postgres:15-alpine
docker run -d -p 6379:6379 redis:7-alpine
```

4. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the application:
```bash
uvicorn app.main:app --reload
```

6. In a separate terminal, start the Celery worker:
```bash
celery -A app.celery_worker worker --loglevel=info
```

## API Endpoints

### Health Check
- `GET /api/v1/health` - Health check endpoint

### Datasets
- `POST /api/v1/datasets/upload` - Upload a new dataset
- `GET /api/v1/datasets` - List all datasets (with pagination)
- `GET /api/v1/datasets/{dataset_id}` - Get dataset details with preview
- `DELETE /api/v1/datasets/{dataset_id}` - Delete a dataset
- `GET /api/v1/datasets/{dataset_id}/columns` - Get column information

### Analysis
- `POST /api/v1/analysis/full-analysis/{dataset_id}` - Trigger full analysis
- `GET /api/v1/analysis/results/{dataset_id}` - Get cached analysis results
- `GET /api/v1/analysis/summary/{dataset_id}` - Get analysis summary
- `GET /api/v1/analysis/statistics/{dataset_id}/{column_name}` - Get column statistics
- `GET /api/v1/analysis/status/{dataset_id}` - Check analysis job status

## Analysis Features

The analysis engine provides:

### Basic Statistics
- Mean, median, mode, standard deviation
- Min, max, quartiles (Q25, Q50, Q75)
- Skewness and kurtosis
- Unique value counts

### Data Quality Metrics
- Missing value analysis (count and percentage per column)
- Duplicate row detection
- Outlier detection (IQR method)
- Overall quality score (0-100)
- Data completeness score

### Correlations & Relationships
- Pearson correlation matrix for numerical columns
- Significant correlation pairs (|r| > 0.5)
- Correlation strength interpretation

### Advanced Insights
- Column type detection (numerical, categorical, datetime)
- Potential key/primary column identification
- Cardinality analysis
- Value distributions

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # Database setup
│   ├── exceptions.py           # Custom exceptions
│   ├── celery_worker.py        # Celery task definitions
│   ├── models/                 # SQLAlchemy models
│   │   ├── dataset.py
│   │   └── analysis.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── common.py
│   │   ├── dataset.py
│   │   └── analysis.py
│   ├── routes/                 # API endpoints
│   │   ├── upload.py
│   │   ├── datasets.py
│   │   └── analysis.py
│   ├── services/               # Business logic
│   │   ├── file_handler.py
│   │   ├── analysis_engine.py
│   │   └── insight_generator.py
│   └── utils/                  # Utilities
│       └── validators.py
├── uploads/                    # Uploaded files storage
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `MAX_UPLOAD_SIZE`: Maximum file upload size in bytes (default: 500MB)
- `ALLOWED_EXTENSIONS`: Supported file types
- `DEBUG`: Enable debug mode

See `.env.example` for all available options.

## Testing

Run tests with pytest:
```bash
pytest
```

## Development

### Adding New Analysis Features

1. Add analysis methods to `app/services/analysis_engine.py`
2. Update schemas in `app/schemas/analysis.py`
3. Create or update endpoints in `app/routes/analysis.py`

### Database Migrations

Using Alembic:
```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

## Production Deployment

1. Set `DEBUG=false` in environment variables
2. Change `SECRET_KEY` to a secure random value
3. Configure proper PostgreSQL and Redis instances
4. Set up reverse proxy (nginx) for HTTPS
5. Use production WSGI server configuration
6. Set up monitoring and logging

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.
