from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = None
    user_id: Optional[str] = None


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DatasetRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    file_path: str
    file_type: str
    upload_date: datetime
    size: int
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    user_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class DatasetListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    datasets: List[DatasetRead]


class ColumnInfo(BaseModel):
    name: str
    data_type: str
    null_count: int
    null_percentage: float
    unique_count: int
    cardinality: float
    sample_values: List[Any] = []


class DatasetPreview(BaseModel):
    dataset: DatasetRead
    columns: List[ColumnInfo]
    preview_data: List[Dict[str, Any]]
    total_rows: int
