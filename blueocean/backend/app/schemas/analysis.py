from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime


class DataQualityMetrics(BaseModel):
    missing_values: Dict[str, Dict[str, Any]]
    duplicates: int
    duplicate_percentage: float
    outliers: Dict[str, List[Any]]
    quality_score: float
    completeness_score: float


class StatisticsResult(BaseModel):
    column: str
    count: int
    mean: Optional[float] = None
    median: Optional[float] = None
    mode: Optional[Any] = None
    std: Optional[float] = None
    min: Optional[Any] = None
    max: Optional[Any] = None
    q25: Optional[float] = None
    q50: Optional[float] = None
    q75: Optional[float] = None
    skewness: Optional[float] = None
    kurtosis: Optional[float] = None
    unique_count: int
    null_count: int
    null_percentage: float


class CorrelationResult(BaseModel):
    method: str
    matrix: Dict[str, Dict[str, float]]
    significant_pairs: List[Dict[str, Any]]


class DistributionInfo(BaseModel):
    column: str
    value_counts: Dict[str, int]
    histogram: Optional[Dict[str, Any]] = None


class FullAnalysisResult(BaseModel):
    dataset_id: int
    analysis_id: Optional[int] = None
    created_date: Optional[datetime] = None
    
    # Basic info
    row_count: int
    column_count: int
    memory_usage: int
    
    # Statistics
    numerical_stats: List[StatisticsResult]
    categorical_stats: List[StatisticsResult]
    
    # Data quality
    quality_metrics: DataQualityMetrics
    
    # Correlations
    correlations: Optional[CorrelationResult] = None
    
    # Column information
    column_types: Dict[str, str]
    date_columns: List[str]
    potential_keys: List[str]
    
    # Distributions
    distributions: List[DistributionInfo]


class AnalysisResult(BaseModel):
    analysis_type: str
    results: Dict[str, Any]
    created_date: datetime
    
    class Config:
        from_attributes = True


class AnalysisStatus(BaseModel):
    dataset_id: int
    status: str
    progress: Optional[float] = None
    message: Optional[str] = None
    result: Optional[FullAnalysisResult] = None
