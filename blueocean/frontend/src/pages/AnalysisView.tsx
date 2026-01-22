import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  BarChart3, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PieChart,
  LineChart,
  Activity,
  Database,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '@/services/api';
import { AnalysisResult, Dataset } from '@/types';
import { StatisticsChart } from '@/components/StatisticsChart';
import { CorrelationChart } from '@/components/CorrelationChart';
import { QualityMetrics } from '@/components/QualityMetrics';
import { ColumnInsights } from '@/components/ColumnInsights';
import { DataDistribution } from '@/components/DataDistribution';
import toast from 'react-hot-toast';

export function AnalysisView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'statistics' | 'correlations' | 'quality' | 'insights'>('overview');

  useEffect(() => {
    if (id) {
      loadAnalysis(parseInt(id));
    }
  }, [id]);

  const loadAnalysis = async (datasetId: number) => {
    try {
      setLoading(true);
      const [analysisData, datasetData] = await Promise.all([
        apiService.getAnalysisResults(datasetId),
        apiService.getDataset(datasetId).then(data => data.dataset)
      ]);

      setAnalysis(analysisData);
      setDataset(datasetData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Loading analysis...</span>
      </div>
    );
  }

  if (error || !analysis || !dataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Not Available</h3>
        <p className="text-muted-foreground text-center mb-4">
          {error || 'Analysis results are not available for this dataset.'}
        </p>
        <button
          onClick={() => navigate(`/datasets/${id}`)}
          className="btn-primary px-4 py-2 rounded-md"
        >
          Back to Dataset
        </button>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'statistics', label: 'Statistics', icon: TrendingUp },
    { id: 'correlations', label: 'Correlations', icon: LineChart },
    { id: 'quality', label: 'Data Quality', icon: CheckCircle },
    { id: 'insights', label: 'Insights', icon: Activity }
  ];

  const qualityScore = analysis.quality_metrics.quality_score;
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/datasets/${id}`)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analysis Results</h1>
            <p className="text-muted-foreground mt-1">
              {dataset.name} • {dataset.file_type.toUpperCase()} • {formatFileSize(dataset.size)}
            </p>
          </div>
        </div>

        <div className={clsx(
          'px-4 py-2 rounded-lg border flex items-center space-x-2',
          getQualityColor(qualityScore)
        )}>
          {getQualityIcon(qualityScore)}
          <span className="font-medium">Quality Score: {qualityScore}/100</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={clsx(
                  'py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap',
                  activeSection === section.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dataset Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Dataset Summary</span>
                </h3>
              </div>
              <div className="card-content">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Rows:</dt>
                    <dd className="text-foreground font-medium">{dataset.row_count.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Columns:</dt>
                    <dd className="text-foreground font-medium">{dataset.column_count}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">File Size:</dt>
                    <dd className="text-foreground font-medium">{formatFileSize(dataset.size)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Data Types:</dt>
                    <dd className="text-foreground font-medium">
                      {Object.keys(analysis.column_types).length} different types
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Quality Overview</span>
                </h3>
              </div>
              <div className="card-content">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Quality Score:</dt>
                    <dd className={clsx(
                      'font-medium',
                      qualityScore >= 90 ? 'text-green-600' : 
                      qualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {qualityScore}/100
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Completeness:</dt>
                    <dd className="text-foreground font-medium">
                      {analysis.quality_metrics.completeness_score.toFixed(1)}%
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Duplicate Rows:</dt>
                    <dd className="text-foreground font-medium">
                      {analysis.quality_metrics.duplicates.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Columns with Missing Data:</dt>
                    <dd className="text-foreground font-medium">
                      {Object.keys(analysis.quality_metrics.missing_values).length}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card lg:col-span-2">
              <div className="card-header">
                <h3 className="card-title flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Key Statistics</span>
                </h3>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {analysis.statistics.filter(s => s.mean !== undefined).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Numerical Columns</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis.correlations.filter(c => Math.abs(c.correlation) > 0.5).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Strong Correlations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysis.insights.length}
                    </div>
                    <div className="text-sm text-muted-foreground">AI Insights</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'statistics' && (
          <StatisticsChart statistics={analysis.statistics} />
        )}

        {activeSection === 'correlations' && (
          <CorrelationChart correlations={analysis.correlations} />
        )}

        {activeSection === 'quality' && (
          <QualityMetrics 
            quality={analysis.quality_metrics}
            missingValues={analysis.quality_metrics.missing_values}
          />
        )}

        {activeSection === 'insights' && (
          <ColumnInsights 
            insights={analysis.insights}
            columnTypes={analysis.column_types}
            distributions={analysis.distributions}
          />
        )}
      </div>
    </div>
  );
}

function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}