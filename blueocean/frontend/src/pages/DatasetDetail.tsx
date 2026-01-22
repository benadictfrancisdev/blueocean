import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  FileText, 
  Download, 
  Trash2,
  Play,
  BarChart3,
  Table,
  Info,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiService } from '@/services/api';
import { DatasetPreview, ColumnInfo, AnalysisStatus } from '@/types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<DatasetPreview | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'columns' | 'info'>('preview');

  useEffect(() => {
    if (id) {
      loadDatasetDetail(parseInt(id));
    }
  }, [id]);

  const loadDatasetDetail = async (datasetId: number) => {
    try {
      setLoading(true);
      const [datasetData, columnsData, statusData] = await Promise.all([
        apiService.getDataset(datasetId),
        apiService.getDatasetColumns(datasetId),
        apiService.getAnalysisStatus(datasetId).catch(() => null) // Analysis might not exist yet
      ]);

      setDataset(datasetData);
      setColumns(columnsData);
      setAnalysisStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dataset');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!id) return;
    
    try {
      await apiService.startAnalysis(parseInt(id));
      toast.success('Analysis started successfully');
      
      // Start polling for status updates
      pollAnalysisStatus(parseInt(id));
    } catch (err) {
      toast.error('Failed to start analysis');
    }
  };

  const pollAnalysisStatus = async (datasetId: number) => {
    try {
      const status = await apiService.pollAnalysisStatus(
        datasetId,
        (newStatus) => {
          setAnalysisStatus(newStatus);
          if (newStatus.status === 'completed') {
            toast.success('Analysis completed!');
          } else if (newStatus.status === 'failed') {
            toast.error('Analysis failed');
          }
        }
      );
      
      // Analysis completed, navigate to analysis view
      if (analysisStatus?.status === 'completed') {
        navigate(`/analysis/${datasetId}`);
      }
    } catch (err) {
      console.error('Analysis polling error:', err);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this dataset?')) return;
    
    try {
      await apiService.deleteDataset(parseInt(id));
      toast.success('Dataset deleted successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete dataset');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Loading dataset...</span>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Dataset Not Found</h3>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'preview', label: 'Data Preview', icon: Table },
    { id: 'columns', label: 'Columns', icon: FileText },
    { id: 'info', label: 'Info', icon: Info }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{dataset.dataset.name}</h1>
            <p className="text-muted-foreground mt-1">
              {dataset.dataset.file_type.toUpperCase()} • {formatFileSize(dataset.dataset.size)} • {dataset.dataset.row_count.toLocaleString()} rows
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!analysisStatus || analysisStatus.status === 'pending' ? (
            <button
              onClick={handleStartAnalysis}
              className="btn-primary px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Analysis</span>
            </button>
          ) : analysisStatus.status === 'completed' ? (
            <button
              onClick={() => navigate(`/analysis/${id}`)}
              className="btn-primary px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Analysis</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analysis in progress...</span>
            </div>
          )}

          <button
            onClick={handleDelete}
            className="btn-destructive px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card">
        <div className="card-content">
          {activeTab === 'preview' && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      {dataset.columns.map((column, index) => (
                        <th key={index} className="table-head">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.preview.map((row, rowIndex) => (
                      <tr key={rowIndex} className="table-row">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="table-cell">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Showing first 100 rows of {dataset.dataset.row_count.toLocaleString()} total rows
              </p>
            </div>
          )}

          {activeTab === 'columns' && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Column Information</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-head">Column Name</th>
                      <th className="table-head">Data Type</th>
                      <th className="table-head">Non-null Count</th>
                      <th className="table-head">Null Count</th>
                      <th className="table-head">Unique Count</th>
                      <th className="table-head">Sample Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((column, index) => (
                      <tr key={index} className="table-row">
                        <td className="table-cell font-medium">{column.name}</td>
                        <td className="table-cell">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                            {column.data_type}
                          </span>
                        </td>
                        <td className="table-cell">{column.non_null_count.toLocaleString()}</td>
                        <td className="table-cell">{column.null_count.toLocaleString()}</td>
                        <td className="table-cell">{column.unique_count.toLocaleString()}</td>
                        <td className="table-cell">
                          <div className="flex flex-wrap gap-1">
                            {column.sample_values.slice(0, 3).map((value, i) => (
                              <span key={i} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                                {String(value)}
                              </span>
                            ))}
                            {column.sample_values.length > 3 && (
                              <span className="text-muted-foreground text-xs">+{column.sample_values.length - 3} more</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Dataset Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-3">File Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">File Name:</dt>
                      <dd className="text-foreground">{dataset.dataset.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">File Type:</dt>
                      <dd className="text-foreground">{dataset.dataset.file_type.toUpperCase()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">File Size:</dt>
                      <dd className="text-foreground">{formatFileSize(dataset.dataset.size)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Upload Date:</dt>
                      <dd className="text-foreground">{formatDate(dataset.dataset.upload_date)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3">Data Statistics</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Rows:</dt>
                      <dd className="text-foreground">{dataset.dataset.row_count.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Columns:</dt>
                      <dd className="text-foreground">{dataset.dataset.column_count}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Preview Rows:</dt>
                      <dd className="text-foreground">{dataset.preview.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Analysis Status:</dt>
                      <dd className="text-foreground">
                        {analysisStatus ? analysisStatus.status : 'Not started'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {dataset.dataset.description && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Description</h4>
                  <p className="text-muted-foreground">{dataset.dataset.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}