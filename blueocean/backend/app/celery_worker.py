from celery import Celery
from app.config import settings
from app.database import SessionLocal
from app.models.dataset import Dataset
from app.models.analysis import DatasetAnalysis, DataQuality
from app.services.file_handler import FileHandler
from app.services.analysis_engine import AnalysisEngine
import pandas as pd
import json

celery_app = Celery(
    "dataforge",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend
)

celery_app.conf.task_routes = {
    "app.celery_worker.analyze_dataset": "main-queue",
}

celery_app.conf.update(task_track_started=True)


@celery_app.task(bind=True, name="app.celery_worker.analyze_dataset")
def analyze_dataset(self, dataset_id: int):
    """Async task to analyze a dataset"""
    db = SessionLocal()
    
    try:
        # Update task state
        self.update_state(state='PROGRESS', meta={'progress': 0, 'status': 'Starting analysis...'})
        
        # Get dataset
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise Exception(f"Dataset {dataset_id} not found")
        
        # Load data
        self.update_state(state='PROGRESS', meta={'progress': 20, 'status': 'Loading data...'})
        file_handler = FileHandler()
        df = file_handler.load_dataframe(dataset.file_path, dataset.file_type, use_polars=False)
        
        # Perform analysis
        self.update_state(state='PROGRESS', meta={'progress': 40, 'status': 'Analyzing data...'})
        analysis_engine = AnalysisEngine()
        results = analysis_engine.perform_full_analysis(df, dataset_id)
        
        # Save analysis results
        self.update_state(state='PROGRESS', meta={'progress': 70, 'status': 'Saving results...'})
        
        # Save full analysis
        analysis = DatasetAnalysis(
            dataset_id=dataset_id,
            analysis_type="full_analysis",
            results_json=json.loads(results.model_dump_json())
        )
        db.add(analysis)
        
        # Save quality metrics
        quality = DataQuality(
            dataset_id=dataset_id,
            missing_values=results.quality_metrics.missing_values,
            duplicates=results.quality_metrics.duplicates,
            outliers=results.quality_metrics.outliers,
            quality_score=results.quality_metrics.quality_score
        )
        db.add(quality)
        
        db.commit()
        
        self.update_state(state='PROGRESS', meta={'progress': 100, 'status': 'Analysis complete'})
        
        return {
            'status': 'completed',
            'dataset_id': dataset_id,
            'analysis_id': analysis.id
        }
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
