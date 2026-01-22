# API Examples

Complete examples for all DataForge AI Backend endpoints.

Base URL: `http://localhost:8000`

## Health Check

### Request
```bash
curl http://localhost:8000/api/v1/health
```

### Response
```json
{
  "status": "success",
  "data": {
    "app_name": "DataForge AI Backend",
    "version": "1.0.0",
    "status": "healthy"
  },
  "message": "Service is running"
}
```

---

## Upload Dataset

### Request
```bash
curl -X POST "http://localhost:8000/api/v1/datasets/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_data.csv" \
  -F "name=Employee Data" \
  -F "description=Employee performance metrics" \
  -F "user_id=user123"
```

### Response
```json
{
  "status": "success",
  "data": {
    "dataset": {
      "id": 1,
      "name": "Employee Data",
      "description": "Employee performance metrics",
      "file_path": "/app/uploads/abc-123-def.csv",
      "file_type": ".csv",
      "upload_date": "2024-01-22T18:00:00",
      "size": 1024,
      "row_count": 20,
      "column_count": 8,
      "user_id": "user123"
    },
    "task_id": "task-uuid-here"
  },
  "message": "Dataset uploaded successfully. Analysis in progress."
}
```

---

## List Datasets

### Request
```bash
curl "http://localhost:8000/api/v1/datasets?page=1&page_size=10"
```

### Response
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 10,
    "datasets": [
      {
        "id": 1,
        "name": "Employee Data",
        "description": "Employee performance metrics",
        "file_type": ".csv",
        "upload_date": "2024-01-22T18:00:00",
        "size": 1024,
        "row_count": 20,
        "column_count": 8
      }
    ]
  }
}
```

---

## Get Dataset Details with Preview

### Request
```bash
curl http://localhost:8000/api/v1/datasets/1
```

### Response
```json
{
  "status": "success",
  "data": {
    "dataset": {
      "id": 1,
      "name": "Employee Data",
      "file_type": ".csv",
      "row_count": 20,
      "column_count": 8
    },
    "columns": [
      {
        "name": "id",
        "data_type": "int64",
        "null_count": 0,
        "null_percentage": 0.0,
        "unique_count": 20,
        "cardinality": 1.0,
        "sample_values": [1, 2, 3, 4, 5]
      },
      {
        "name": "name",
        "data_type": "object",
        "null_count": 0,
        "null_percentage": 0.0,
        "unique_count": 20,
        "cardinality": 1.0,
        "sample_values": ["John Smith", "Jane Doe"]
      }
    ],
    "preview_data": [
      {
        "id": 1,
        "name": "John Smith",
        "age": 35,
        "department": "Engineering",
        "salary": 95000
      }
    ],
    "total_rows": 20
  }
}
```

---

## Get Column Information

### Request
```bash
curl http://localhost:8000/api/v1/datasets/1/columns
```

### Response
```json
{
  "status": "success",
  "data": {
    "columns": [
      {
        "name": "salary",
        "data_type": "int64",
        "null_count": 0,
        "null_percentage": 0.0,
        "unique_count": 18,
        "cardinality": 0.9,
        "sample_values": [95000, 72000, 110000, 68000, 88000]
      }
    ]
  }
}
```

---

## Trigger Full Analysis

### Request
```bash
curl -X POST http://localhost:8000/api/v1/analysis/full-analysis/1
```

### Response
```json
{
  "status": "success",
  "data": {
    "task_id": "task-uuid-here",
    "dataset_id": 1
  },
  "message": "Analysis triggered successfully"
}
```

---

## Check Analysis Status

### Request
```bash
curl "http://localhost:8000/api/v1/analysis/status/1?task_id=task-uuid-here"
```

### Response (In Progress)
```json
{
  "status": "success",
  "data": {
    "dataset_id": 1,
    "status": "in_progress",
    "progress": 45.0,
    "message": "Analyzing data..."
  }
}
```

### Response (Completed)
```json
{
  "status": "success",
  "data": {
    "dataset_id": 1,
    "status": "completed",
    "progress": 100.0,
    "message": "Analysis completed"
  }
}
```

---

## Get Analysis Results

### Request
```bash
curl http://localhost:8000/api/v1/analysis/results/1
```

### Response
```json
{
  "status": "success",
  "data": {
    "dataset_id": 1,
    "analysis_id": 1,
    "created_date": "2024-01-22T18:05:00",
    "row_count": 20,
    "column_count": 8,
    "memory_usage": 2048,
    "numerical_stats": [
      {
        "column": "age",
        "count": 20,
        "mean": 33.5,
        "median": 32.5,
        "mode": 29.0,
        "std": 5.8,
        "min": 25.0,
        "max": 45.0,
        "q25": 29.0,
        "q50": 32.5,
        "q75": 37.0,
        "skewness": 0.15,
        "kurtosis": -0.8,
        "unique_count": 15,
        "null_count": 0,
        "null_percentage": 0.0
      }
    ],
    "categorical_stats": [
      {
        "column": "department",
        "count": 20,
        "mode": "Engineering",
        "unique_count": 4,
        "null_count": 0,
        "null_percentage": 0.0
      }
    ],
    "quality_metrics": {
      "missing_values": {
        "age": {"count": 0, "percentage": 0.0},
        "name": {"count": 0, "percentage": 0.0}
      },
      "duplicates": 0,
      "duplicate_percentage": 0.0,
      "outliers": {},
      "quality_score": 100.0,
      "completeness_score": 100.0
    },
    "correlations": {
      "method": "pearson",
      "matrix": {
        "age": {"age": 1.0, "salary": 0.85},
        "salary": {"age": 0.85, "salary": 1.0}
      },
      "significant_pairs": [
        {
          "column1": "age",
          "column2": "salary",
          "correlation": 0.85,
          "strength": "strong"
        }
      ]
    },
    "column_types": {
      "id": "numerical",
      "name": "categorical",
      "age": "numerical",
      "department": "categorical",
      "salary": "numerical"
    },
    "date_columns": [],
    "potential_keys": ["id"],
    "distributions": [
      {
        "column": "department",
        "value_counts": {
          "Engineering": 8,
          "Marketing": 5,
          "Sales": 5,
          "Management": 2
        }
      }
    ]
  }
}
```

---

## Get Analysis Summary

### Request
```bash
curl http://localhost:8000/api/v1/analysis/summary/1
```

### Response
```json
{
  "status": "success",
  "data": {
    "dataset_id": 1,
    "row_count": 20,
    "column_count": 8,
    "quality_score": 100.0,
    "missing_percentage": 0.0,
    "duplicate_count": 0,
    "numerical_columns": 5,
    "categorical_columns": 3
  }
}
```

---

## Get Column Statistics

### Request
```bash
curl http://localhost:8000/api/v1/analysis/statistics/1/salary
```

### Response
```json
{
  "status": "success",
  "data": {
    "column": "salary",
    "count": 20,
    "mean": 90500.0,
    "median": 88500.0,
    "mode": 95000.0,
    "std": 22000.5,
    "min": 65000.0,
    "max": 135000.0,
    "q25": 72000.0,
    "q50": 88500.0,
    "q75": 110000.0,
    "skewness": 0.3,
    "kurtosis": -0.5,
    "unique_count": 18,
    "null_count": 0,
    "null_percentage": 0.0
  }
}
```

---

## Delete Dataset

### Request
```bash
curl -X DELETE http://localhost:8000/api/v1/datasets/1
```

### Response
```json
{
  "status": "success",
  "message": "Dataset 1 deleted successfully"
}
```

---

## Error Response Examples

### File too large (413)
```json
{
  "status": "error",
  "message": "File size exceeds maximum allowed size of 500MB",
  "errors": ["File size exceeds maximum allowed size of 500MB"]
}
```

### Unsupported file type (415)
```json
{
  "status": "error",
  "message": "File type .pdf not supported",
  "errors": ["File type .pdf not supported. Allowed types: .csv, .xlsx, .xls, .json, .parquet"]
}
```

### Dataset not found (404)
```json
{
  "status": "error",
  "message": "Dataset with id 999 not found",
  "errors": ["Dataset with id 999 not found"]
}
```

### Validation error (422)
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": ["file: field required"]
}
```

---

## Using Python Requests

```python
import requests

# Upload a file
with open('sample_data.csv', 'rb') as f:
    files = {'file': f}
    data = {
        'name': 'Employee Data',
        'description': 'Sample dataset'
    }
    response = requests.post(
        'http://localhost:8000/api/v1/datasets/upload',
        files=files,
        data=data
    )
    result = response.json()
    dataset_id = result['data']['dataset']['id']

# Get analysis results
response = requests.get(f'http://localhost:8000/api/v1/analysis/results/{dataset_id}')
analysis = response.json()
print(f"Quality Score: {analysis['data']['quality_metrics']['quality_score']}")
```

---

## Using JavaScript/Fetch

```javascript
// Upload a file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'Employee Data');
formData.append('description', 'Sample dataset');

const response = await fetch('http://localhost:8000/api/v1/datasets/upload', {
  method: 'POST',
  body: formData
});
const result = await response.json();
const datasetId = result.data.dataset.id;

// Get analysis results
const analysisResponse = await fetch(
  `http://localhost:8000/api/v1/analysis/results/${datasetId}`
);
const analysis = await analysisResponse.json();
console.log('Quality Score:', analysis.data.quality_metrics.quality_score);
```
