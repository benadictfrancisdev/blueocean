import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  Upload as UploadIcon, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import { apiService } from '@/services/api';
import { Dataset } from '@/types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface UploadFile extends File {
  id: string;
}

export function Upload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedDatasets, setUploadedDatasets] = useState<Dataset[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setErrors({});
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'application/parquet': ['.parquet']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return '📊';
      case 'xlsx':
      case 'xls':
        return '📈';
      case 'json':
        return '🔧';
      case 'parquet':
        return '⚡';
      default:
        return '📄';
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setErrors({});

    try {
      for (const file of files) {
        try {
          const dataset = await apiService.uploadDataset(
            file,
            file.name.replace(/\.[^/.]+$/, ''), // Remove extension for name
            undefined,
            (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                [file.id]: progress
              }));
            }
          );

          setUploadedDatasets(prev => [...prev, dataset]);
          toast.success(`Successfully uploaded ${file.name}`);
          
          // Remove file from list after successful upload
          setTimeout(() => {
            removeFile(file.id);
          }, 2000);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          setErrors(prev => ({
            ...prev,
            [file.id]: errorMessage
          }));
          toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleViewDataset = (dataset: Dataset) => {
    navigate(`/datasets/${dataset.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Dataset</h1>
        <p className="text-muted-foreground mt-1">
          Upload CSV, Excel, JSON, or Parquet files for analysis
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Select Files</h2>
          <p className="card-description">
            Drag and drop files here, or click to browse. Maximum file size: 500MB
          </p>
        </div>
        <div className="card-content">
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <input {...getInputProps()} />
            <UploadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Drop files here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, Excel (.xlsx, .xls), JSON, and Parquet files
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-foreground mb-4">Selected Files</h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(file.name)}</span>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {errors[file.id] && (
                        <div className="flex items-center space-x-1 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs">{errors[file.id]}</span>
                        </div>
                      )}
                      
                      {uploadProgress[file.id] !== undefined && (
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(uploadProgress[file.id])}%
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setFiles([])}
                  className="btn-secondary px-4 py-2 rounded-md"
                  disabled={uploading}
                >
                  Clear All
                </button>
                <button
                  onClick={handleUpload}
                  className="btn-primary px-6 py-2 rounded-md flex items-center space-x-2"
                  disabled={uploading || files.length === 0}
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadIcon className="w-4 h-4" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Datasets */}
      {uploadedDatasets.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recently Uploaded</h2>
            <p className="card-description">
              Your successfully uploaded datasets
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {uploadedDatasets.map((dataset) => (
                <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">{dataset.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dataset.file_type.toUpperCase()} • {formatFileSize(dataset.size)} • {dataset.row_count.toLocaleString()} rows
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewDataset(dataset)}
                    className="btn-primary px-4 py-2 rounded-md text-sm"
                  >
                    View Dataset
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Supported File Formats</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-foreground">CSV</h3>
              <p className="text-sm text-muted-foreground">Comma-separated values</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold text-foreground">Excel</h3>
              <p className="text-sm text-muted-foreground">.xlsx and .xls formats</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="font-semibold text-foreground">JSON</h3>
              <p className="text-sm text-muted-foreground">JavaScript object notation</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-foreground">Parquet</h3>
              <p className="text-sm text-muted-foreground">Columnar storage format</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}