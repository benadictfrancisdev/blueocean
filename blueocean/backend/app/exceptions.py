class DataForgeException(Exception):
    """Base exception for DataForge application"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class FileUploadError(DataForgeException):
    """Exception raised for file upload errors"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class AnalysisError(DataForgeException):
    """Exception raised for analysis errors"""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)


class ValidationError(DataForgeException):
    """Exception raised for validation errors"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class DatasetNotFoundError(DataForgeException):
    """Exception raised when dataset is not found"""
    def __init__(self, dataset_id: int):
        super().__init__(f"Dataset with id {dataset_id} not found", status_code=404)
