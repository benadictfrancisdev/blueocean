import os
import uuid
import aiofiles
import pandas as pd
import polars as pl
from pathlib import Path
from typing import Tuple, Dict, Any
from fastapi import UploadFile
from app.config import settings
from app.exceptions import FileUploadError


class FileHandler:
    """Handles file upload and basic processing"""
    
    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    async def save_upload_file(self, file: UploadFile, extension: str) -> Tuple[str, str]:
        """Save uploaded file and return file path and unique filename"""
        try:
            unique_filename = f"{uuid.uuid4()}{extension}"
            file_path = self.upload_dir / unique_filename
            
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            return str(file_path), unique_filename
        except Exception as e:
            raise FileUploadError(f"Failed to save file: {str(e)}")
    
    def get_file_metadata(self, file_path: str, extension: str) -> Dict[str, Any]:
        """Extract metadata from uploaded file"""
        try:
            file_size = os.path.getsize(file_path)
            
            # Get row and column counts based on file type
            if extension == ".csv":
                df = pd.read_csv(file_path, nrows=1)
                total_rows = sum(1 for _ in open(file_path)) - 1
                columns = len(df.columns)
            elif extension in [".xlsx", ".xls"]:
                df = pd.read_excel(file_path, nrows=1)
                total_df = pd.read_excel(file_path)
                total_rows = len(total_df)
                columns = len(df.columns)
            elif extension == ".json":
                df = pd.read_json(file_path, lines=True, nrows=1)
                total_df = pd.read_json(file_path, lines=True)
                total_rows = len(total_df)
                columns = len(df.columns)
            elif extension == ".parquet":
                df = pd.read_parquet(file_path)
                total_rows = len(df)
                columns = len(df.columns)
            else:
                raise FileUploadError(f"Unsupported file type: {extension}")
            
            return {
                "size": file_size,
                "row_count": total_rows,
                "column_count": columns
            }
        except Exception as e:
            raise FileUploadError(f"Failed to extract metadata: {str(e)}")
    
    def load_dataframe(self, file_path: str, extension: str, use_polars: bool = True) -> Any:
        """Load file into a dataframe (Polars or Pandas)"""
        try:
            if use_polars:
                if extension == ".csv":
                    return pl.read_csv(file_path)
                elif extension in [".xlsx", ".xls"]:
                    df_pandas = pd.read_excel(file_path)
                    return pl.from_pandas(df_pandas)
                elif extension == ".json":
                    return pl.read_json(file_path)
                elif extension == ".parquet":
                    return pl.read_parquet(file_path)
            else:
                if extension == ".csv":
                    return pd.read_csv(file_path)
                elif extension in [".xlsx", ".xls"]:
                    return pd.read_excel(file_path)
                elif extension == ".json":
                    return pd.read_json(file_path, lines=True)
                elif extension == ".parquet":
                    return pd.read_parquet(file_path)
            
            raise FileUploadError(f"Unsupported file type: {extension}")
        except Exception as e:
            raise FileUploadError(f"Failed to load dataframe: {str(e)}")
    
    def delete_file(self, file_path: str) -> None:
        """Delete a file from the filesystem"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            raise FileUploadError(f"Failed to delete file: {str(e)}")
