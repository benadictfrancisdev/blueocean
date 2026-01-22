from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetRead, DatasetUpdate, DatasetListResponse, ColumnInfo, DatasetPreview
from app.schemas.common import APIResponse
from app.services.file_handler import FileHandler
from app.exceptions import DatasetNotFoundError
import pandas as pd
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("", response_model=APIResponse)
def list_datasets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List all uploaded datasets with pagination"""
    try:
        total = db.query(Dataset).count()
        offset = (page - 1) * page_size
        
        datasets = db.query(Dataset).order_by(Dataset.upload_date.desc()).offset(offset).limit(page_size).all()
        
        dataset_list = DatasetListResponse(
            total=total,
            page=page,
            page_size=page_size,
            datasets=[DatasetRead.model_validate(d) for d in datasets]
        )
        
        return APIResponse(
            status="success",
            data=dataset_list.model_dump()
        )
    except Exception as e:
        logger.error(f"Failed to list datasets: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to retrieve datasets",
            errors=[str(e)]
        )


@router.get("/{dataset_id}", response_model=APIResponse)
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Get dataset metadata and preview (first 100 rows)"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Load preview data
        file_handler = FileHandler()
        df = file_handler.load_dataframe(dataset.file_path, dataset.file_type, use_polars=False)
        
        # Get column information
        columns = []
        for col in df.columns:
            null_count = int(df[col].isna().sum())
            unique_count = int(df[col].nunique())
            
            col_info = ColumnInfo(
                name=col,
                data_type=str(df[col].dtype),
                null_count=null_count,
                null_percentage=float(null_count / len(df) * 100),
                unique_count=unique_count,
                cardinality=float(unique_count / len(df)),
                sample_values=df[col].dropna().head(5).tolist()
            )
            columns.append(col_info)
        
        # Get preview data
        preview_df = df.head(100)
        preview_data = preview_df.to_dict(orient='records')
        
        preview = DatasetPreview(
            dataset=DatasetRead.model_validate(dataset),
            columns=columns,
            preview_data=preview_data,
            total_rows=len(df)
        )
        
        return APIResponse(
            status="success",
            data=preview.model_dump()
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get dataset {dataset_id}: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to retrieve dataset",
            errors=[str(e)]
        )


@router.delete("/{dataset_id}", response_model=APIResponse)
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Delete dataset and associated files"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Delete file from filesystem
        file_handler = FileHandler()
        file_handler.delete_file(dataset.file_path)
        
        # Delete from database
        db.delete(dataset)
        db.commit()
        
        return APIResponse(
            status="success",
            message=f"Dataset {dataset_id} deleted successfully"
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to delete dataset {dataset_id}: {str(e)}")
        db.rollback()
        return APIResponse(
            status="error",
            message="Failed to delete dataset",
            errors=[str(e)]
        )


@router.get("/{dataset_id}/columns", response_model=APIResponse)
def get_dataset_columns(dataset_id: int, db: Session = Depends(get_db)):
    """Get column information with data types"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Load data
        file_handler = FileHandler()
        df = file_handler.load_dataframe(dataset.file_path, dataset.file_type, use_polars=False)
        
        # Get column information
        columns = []
        for col in df.columns:
            null_count = int(df[col].isna().sum())
            unique_count = int(df[col].nunique())
            
            col_info = ColumnInfo(
                name=col,
                data_type=str(df[col].dtype),
                null_count=null_count,
                null_percentage=float(null_count / len(df) * 100),
                unique_count=unique_count,
                cardinality=float(unique_count / len(df)),
                sample_values=df[col].dropna().head(5).tolist()
            )
            columns.append(col_info)
        
        return APIResponse(
            status="success",
            data={"columns": [c.model_dump() for c in columns]}
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get columns for dataset {dataset_id}: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to retrieve columns",
            errors=[str(e)]
        )
