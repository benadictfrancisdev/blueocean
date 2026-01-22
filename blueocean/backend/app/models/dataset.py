from sqlalchemy import Column, Integer, String, DateTime, BigInteger, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    size = Column(BigInteger, nullable=False)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    user_id = Column(String(100), nullable=True, index=True)
    
    # Relationships
    analyses = relationship("DatasetAnalysis", back_populates="dataset", cascade="all, delete-orphan")
    quality_metrics = relationship("DataQuality", back_populates="dataset", cascade="all, delete-orphan")
