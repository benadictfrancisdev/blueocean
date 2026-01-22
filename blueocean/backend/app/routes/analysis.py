from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.models.analysis import DatasetAnalysis
from app.schemas.analysis import FullAnalysisResult, AnalysisStatus, StatisticsResult
from app.schemas.common import APIResponse
from app.services.file_handler import FileHandler
from app.services.analysis_engine import AnalysisEngine
from app.celery_worker import analyze_dataset, celery_app
from app.exceptions import DatasetNotFoundError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/full-analysis/{dataset_id}", response_model=APIResponse)
def trigger_full_analysis(dataset_id: int, db: Session = Depends(get_db)):
    """Trigger complete analysis for a dataset"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Trigger async analysis
        task = analyze_dataset.delay(dataset_id)
        
        return APIResponse(
            status="success",
            data={"task_id": task.id, "dataset_id": dataset_id},
            message="Analysis triggered successfully"
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to trigger analysis for dataset {dataset_id}: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to trigger analysis",
            errors=[str(e)]
        )


@router.get("/results/{dataset_id}", response_model=APIResponse)
def get_analysis_results(dataset_id: int, db: Session = Depends(get_db)):
    """Get cached analysis results for a dataset"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Get latest full analysis
        analysis = db.query(DatasetAnalysis).filter(
            DatasetAnalysis.dataset_id == dataset_id,
            DatasetAnalysis.analysis_type == "full_analysis"
        ).order_by(DatasetAnalysis.created_date.desc()).first()
        
        if not analysis:
            return APIResponse(
                status="error",
                message="No analysis results found. Please trigger analysis first.",
                errors=["Analysis not found"]
            )
        
        # Convert results to FullAnalysisResult
        results = FullAnalysisResult(**analysis.results_json)
        results.analysis_id = analysis.id
        results.created_date = analysis.created_date
        
        return APIResponse(
            status="success",
            data=results.model_dump()
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get analysis results for dataset {dataset_id}: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to retrieve analysis results",
            errors=[str(e)]
        )


@router.get("/summary/{dataset_id}", response_model=APIResponse)
def get_analysis_summary(dataset_id: int, db: Session = Depends(get_db)):
    """Get quick summary for visualization"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Get latest analysis
        analysis = db.query(DatasetAnalysis).filter(
            DatasetAnalysis.dataset_id == dataset_id,
            DatasetAnalysis.analysis_type == "full_analysis"
        ).order_by(DatasetAnalysis.created_date.desc()).first()
        
        if not analysis:
            return APIResponse(
                status="error",
                message="No analysis results found",
                errors=["Analysis not found"]
            )
        
        results = analysis.results_json
        
        # Create summary
        summary = {
            "dataset_id": dataset_id,
            "row_count": results["row_count"],
            "column_count": results["column_count"],
            "quality_score": results["quality_metrics"]["quality_score"],
            "missing_percentage": sum(
                v["percentage"] for v in results["quality_metrics"]["missing_values"].values()
            ) / len(results["quality_metrics"]["missing_values"]) if results["quality_metrics"]["missing_values"] else 0,
            "duplicate_count": results["quality_metrics"]["duplicates"],
            "numerical_columns": len(results["numerical_stats"]),
            "categorical_columns": len(results["categorical_stats"])
        }
        
        return APIResponse(
            status="success",
            data=summary
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get summary for dataset {dataset_id}: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to retrieve summary",
            errors=[str(e)]
        )


@router.get("/statistics/{dataset_id}/{column_name}", response_model=APIResponse)
def get_column_statistics(dataset_id: int, column_name: str, db: Session = Depends(get_db)):
    """Get statistics for a single column"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Load data
        file_handler = FileHandler()
        df = file_handler.load_dataframe(dataset.file_path, dataset.file_type, use_polars=False)
        
        # Compute statistics
        analysis_engine = AnalysisEngine()
        stats = analysis_engine.compute_column_statistics(df, column_name)
        
        return APIResponse(
            status="success",
            data=stats.model_dump()
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get statistics for column {column_name}: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to retrieve column statistics",
            errors=[str(e)]
        )


@router.get("/status/{dataset_id}", response_model=APIResponse)
def get_analysis_status(dataset_id: int, task_id: str = None, db: Session = Depends(get_db)):
    """Check analysis job status"""
    try:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        
        if not dataset:
            raise DatasetNotFoundError(dataset_id)
        
        # Check if analysis exists in database
        analysis = db.query(DatasetAnalysis).filter(
            DatasetAnalysis.dataset_id == dataset_id,
            DatasetAnalysis.analysis_type == "full_analysis"
        ).order_by(DatasetAnalysis.created_date.desc()).first()
        
        if analysis:
            # Analysis completed
            results = FullAnalysisResult(**analysis.results_json)
            status = AnalysisStatus(
                dataset_id=dataset_id,
                status="completed",
                progress=100.0,
                message="Analysis completed",
                result=results
            )
        else:
            # Check task status if task_id provided
            if task_id:
                task = celery_app.AsyncResult(task_id)
                if task.state == 'PENDING':
                    status = AnalysisStatus(
                        dataset_id=dataset_id,
                        status="pending",
                        progress=0.0,
                        message="Analysis pending"
                    )
                elif task.state == 'PROGRESS':
                    meta = task.info
                    status = AnalysisStatus(
                        dataset_id=dataset_id,
                        status="in_progress",
                        progress=float(meta.get('progress', 0)),
                        message=meta.get('status', 'Processing...')
                    )
                elif task.state == 'SUCCESS':
                    status = AnalysisStatus(
                        dataset_id=dataset_id,
                        status="completed",
                        progress=100.0,
                        message="Analysis completed"
                    )
                else:
                    status = AnalysisStatus(
                        dataset_id=dataset_id,
                        status="failed",
                        message=f"Analysis failed: {task.info}"
                    )
            else:
                status = AnalysisStatus(
                    dataset_id=dataset_id,
                    status="not_started",
                    message="No analysis found"
                )
        
        return APIResponse(
            status="success",
            data=status.model_dump()
        )
        
    except DatasetNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get status for dataset {dataset_id}: {str(e)}")
        return APIResponse(
            status="error",
            message="Failed to retrieve status",
            errors=[str(e)]
        )
