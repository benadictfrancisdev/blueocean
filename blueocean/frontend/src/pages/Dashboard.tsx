import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  FileText, 
  Activity, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus
} from 'lucide-react';
import { apiService } from '@/services/api';
import { Dataset, AnalysisStatus } from '@/types';
import { clsx } from 'clsx';

export function Dashboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisStatuses, setAnalysisStatuses] = useState<Record<number, AnalysisStatus>>({});

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDatasets();
      setDatasets(response.datasets);
      
      // Load analysis status for each dataset
      const statuses: Record<number, AnalysisStatus> = {};
      for (const dataset of response.datasets) {
        try {
          const status = await apiService.getAnalysisStatus(dataset.id);
          statuses[dataset.id] = status;
        } catch (error) {
          // Dataset might not have analysis yet
          statuses[dataset.id] = { status: 'pending', progress: 0 };
        }
      }
      setAnalysisStatuses(statuses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load datasets');
    } finally {
      setLoading(false);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: AnalysisStatus) => {
    switch (status.status) {
      case 'completed':
        return 'Analysis Complete';
      case 'processing':
        return `Processing (${status.progress}%)`;
      case 'failed':
        return 'Analysis Failed';
      default:
        return 'Pending Analysis';
    }
  };

  const getStatusColor = (status: AnalysisStatus) => {
    switch (status.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Loading datasets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Datasets</h3>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        <button
          onClick={loadDatasets}
          className="btn-primary px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = {
    total: datasets.length,
    totalRows: datasets.reduce((sum, dataset) => sum + dataset.row_count, 0),
    totalSize: datasets.reduce((sum, dataset) => sum + dataset.size, 0),
    completed: Object.values(analysisStatuses).filter(s => s.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your uploaded datasets and analysis status
          </p>
        </div>
        <Link
          to="/upload"
          className="btn-primary px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Dataset</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Datasets</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <Database className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalRows.toLocaleString()}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Size</p>
              <p className="text-2xl font-bold text-foreground">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Analysis</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.completed}/{stats.total}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Datasets List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Datasets</h2>
          <p className="card-description">
            Your uploaded datasets and their analysis status
          </p>
        </div>
        <div className="card-content">
          {datasets.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No datasets yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first dataset to get started with data analysis
              </p>
              <Link
                to="/upload"
                className="btn-primary px-4 py-2 rounded-md inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Dataset</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {datasets.map((dataset) => {
                const status = analysisStatuses[dataset.id] || { status: 'pending', progress: 0 };
                return (
                  <div
                    key={dataset.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{dataset.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dataset.file_type.toUpperCase()} • {formatFileSize(dataset.size)} • {dataset.row_count.toLocaleString()} rows
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {formatDate(dataset.upload_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={clsx(
                        'px-3 py-1 rounded-full border text-xs font-medium flex items-center space-x-2',
                        getStatusColor(status)
                      )}>
                        {getStatusIcon(status)}
                        <span>{getStatusText(status)}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/datasets/${dataset.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          View
                        </Link>
                        {status.status === 'completed' && (
                          <Link
                            to={`/analysis/${dataset.id}`}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Analysis
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}