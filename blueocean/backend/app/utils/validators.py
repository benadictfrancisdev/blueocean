import os
from fastapi import HTTPException, UploadFile
from app.config import settings


def validate_file_extension(filename: str) -> str:
    """Validate file extension and return the extension"""
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=415,
            detail=f"File type {ext} not supported. Allowed types: {', '.join(settings.allowed_extensions)}"
        )
    
    return ext


def validate_file_size(file_size: int) -> None:
    """Validate file size"""
    if file_size > settings.max_upload_size:
        max_size_mb = settings.max_upload_size / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum allowed size of {max_size_mb:.0f}MB"
        )


async def validate_upload_file(file: UploadFile) -> tuple:
    """Validate uploaded file and return extension and content"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    ext = validate_file_extension(file.filename)
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    validate_file_size(file_size)
    
    # Reset file pointer
    await file.seek(0)
    
    return ext, content, file_size
