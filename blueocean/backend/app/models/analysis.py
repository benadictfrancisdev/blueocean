from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class DatasetAnalysis(Base):
    __tablename__ = "dataset_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_type = Column(String(100), nullable=False)
    results_json = Column(JSON, nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    dataset = relationship("Dataset", back_populates="analyses")


class DataQuality(Base):
    __tablename__ = "data_quality"
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    missing_values = Column(JSON, nullable=True)
    duplicates = Column(Integer, default=0)
    outliers = Column(JSON, nullable=True)
    quality_score = Column(Float, nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    dataset = relationship("Dataset", back_populates="quality_metrics")
