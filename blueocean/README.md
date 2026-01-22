# DataForge AI - AI-Powered Data Analysis Platform

A comprehensive web and desktop application for AI-powered data analysis, similar to DataForge AI.

## Project Status

**Phase 1: Backend API (Complete)** ✅
- FastAPI backend with comprehensive data analysis capabilities
- PostgreSQL database for data persistence
- Celery + Redis for async task processing
- Support for CSV, Excel, JSON, and Parquet files
- Comprehensive analysis engine with statistics, quality metrics, and correlations

**Phase 2: Frontend (Upcoming)**
- React-based web interface
- Interactive data visualization
- Real-time analysis results

**Phase 3: AI Integration (Upcoming)**
- LLM-powered insights
- Natural language queries
- Automated recommendations

## Quick Start

### Backend Setup

Navigate to the backend directory and follow the setup instructions:

```bash
cd backend
docker-compose up -d
```

Access the API at http://localhost:8000 and documentation at http://localhost:8000/docs

For detailed backend documentation, see [backend/README.md](backend/README.md)

## Architecture

### Phase 1: Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Relational database for storing datasets and analysis results
- **Redis**: In-memory data store for task queuing
- **Celery**: Distributed task queue for async processing
- **Pandas/Polars**: High-performance data processing

### Technology Stack
- Python 3.11+
- FastAPI 0.104.1
- SQLAlchemy 2.0
- Pandas 2.1.3
- Polars 0.19.12
- scikit-learn 1.3.2

## Features

### Data Upload & Management
- Upload CSV, Excel, JSON, and Parquet files
- File validation and size limits
- Automatic metadata extraction
- Dataset preview and exploration

### Comprehensive Analysis
- **Statistics**: Mean, median, mode, standard deviation, quartiles
- **Data Quality**: Missing values, duplicates, outliers, quality scores
- **Correlations**: Pearson correlation with significant pair detection
- **Type Detection**: Automatic column type identification
- **Distributions**: Value frequency analysis

### API Features
- RESTful API design
- Automatic API documentation (Swagger/ReDoc)
- Async processing for large files
- Consistent error handling
- Request tracking and logging

## Project Structure

```
blueocean/
├── backend/               # Phase 1: FastAPI backend
│   ├── app/              # Application code
│   ├── uploads/          # Uploaded files storage
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/             # Phase 2: React frontend (upcoming)
├── desktop/              # Phase 3: Desktop app (upcoming)
└── README.md
```

## Development Roadmap

### Phase 1: Backend API ✅
- [x] FastAPI project setup
- [x] Database models and migrations
- [x] File upload and validation
- [x] Core analysis engine
- [x] RESTful API endpoints
- [x] Async task processing
- [x] Docker containerization
- [x] API documentation

### Phase 2: Frontend (Next)
- [ ] React application setup
- [ ] Data upload interface
- [ ] Interactive visualizations
- [ ] Dashboard for analysis results
- [ ] Real-time updates

### Phase 3: AI Integration
- [ ] LLM integration for insights
- [ ] Natural language query interface
- [ ] Automated recommendations
- [ ] Advanced ML features

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues, questions, or suggestions, please open an issue on the repository.
