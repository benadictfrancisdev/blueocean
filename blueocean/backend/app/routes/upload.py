from fastapi import APIRouter, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetRead
from app.schemas.common import APIResponse
from app.services.file_handler import FileHandler
from app.utils.validators import validate_upload_file
from app.celery_worker import analyze_dataset
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/datasets", tags=["upload"])


@router.post("/upload", response_model=APIResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a new dataset file (CSV, Excel, JSON, Parquet)
    Triggers async analysis job upon successful upload
    """
    try:
        # Validate file
        ext, content, file_size = await validate_upload_file(file)
        
        # Save file
        file_handler = FileHandler()
        file_path, unique_filename = await file_handler.save_upload_file(file, ext)
        
        # Get metadata
        metadata = file_handler.get_file_metadata(file_path, ext)
        
        # Create dataset record
        dataset_name = name or file.filename
        dataset = Dataset(
            name=dataset_name,
            description=description,
            file_path=file_path,
            file_type=ext,
            size=metadata["size"],
            row_count=metadata["row_count"],
            column_count=metadata["column_count"],
            user_id=user_id
        )
        
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        # Trigger async analysis
        task = analyze_dataset.delay(dataset.id)
        
        logger.info(f"Dataset {dataset.id} uploaded successfully. Analysis task: {task.id}")
        
        return APIResponse(
            status="success",
            data={
                "dataset": DatasetRead.model_validate(dataset),
                "task_id": task.id
            },
            message="Dataset uploaded successfully. Analysis in progress."
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        return APIResponse(
            status="error",
            message="Upload failed",
            errors=[str(e)]
        )
