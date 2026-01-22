from app.routes.upload import router as upload_router
from app.routes.datasets import router as datasets_router
from app.routes.analysis import router as analysis_router

__all__ = ["upload_router", "datasets_router", "analysis_router"]
