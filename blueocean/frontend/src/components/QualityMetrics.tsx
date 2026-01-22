import { DataQualityMetrics } from '@/types';
import { CheckCircle, AlertTriangle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface QualityMetricsProps {
  quality: DataQualityMetrics;
  missingValues: Record<string, number>;
}

export function QualityMetrics({ quality, missingValues }: QualityMetricsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const getMissingPercentage = (column: string) => {
    const missing = missingValues[column] || 0;
    const total = quality.completeness_score; // This should be calculated based on actual row count
    return total > 0 ? (missing / total) * 100 : 0;
  };

  const sortedMissingValues = Object.entries(missingValues)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10 columns with most missing values

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center space-x-2">
            {getScoreIcon(quality.quality_score)}
            <span>Overall Quality Score</span>
          </h3>
          <p className="card-description">
            Composite score based on completeness, duplicates, and outliers
          </p>
        </div>
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(quality.quality_score)}`}>
                {quality.quality_score}/100
              </div>
              <div className="text-sm text-muted-foreground">{getScoreDescription(quality.quality_score)}</div>
            </div>
            <div className="flex-1 ml-8">
              <div className="bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    quality.quality_score >= 90 ? 'bg-green-500' :
                    quality.quality_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${quality.quality_score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Completeness</span>
            </h4>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {quality.completeness_score.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">
              Percentage of non-null values across all columns
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${quality.completeness_score}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Duplicates</span>
            </h4>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {quality.duplicates.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Number of duplicate rows found in the dataset
            </p>
            {quality.duplicates === 0 ? (
              <div className="mt-3 flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                No duplicates found
              </div>
            ) : (
              <div className="mt-3 text-sm text-yellow-600">
                Consider removing duplicates
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Outliers</span>
            </h4>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Object.values(quality.outliers).reduce((sum, outliers) => sum + outliers.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Total outliers detected across all numerical columns
            </p>
            <div className="mt-3 text-sm text-blue-600">
              Using IQR method (1.5 × IQR)
            </div>
          </div>
        </div>
      </div>

      {/* Missing Values Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Missing Values Analysis</h3>
          <p className="card-description">
            Columns with missing values ranked by severity
          </p>
        </div>
        <div className="card-content">
          {sortedMissingValues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-foreground mb-2">No Missing Values</h4>
              <p className="text-muted-foreground">
                This dataset has no missing values across all columns
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMissingValues.map(([column, count], index) => {
                const percentage = getMissingPercentage(column);
                const severity = percentage > 20 ? 'high' : percentage > 5 ? 'medium' : 'low';
                
                return (
                  <div key={column} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-foreground">{column}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          severity === 'high' ? 'bg-red-100 text-red-800' :
                          severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {severity} severity
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground">{count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          severity === 'high' ? 'bg-red-500' :
                          severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Outliers Analysis */}
      {Object.keys(quality.outliers).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Outliers Detection</h3>
            <p className="card-description">
              Statistical outliers detected using the IQR method
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {Object.entries(quality.outliers).map(([column, outliers]) => (
                <div key={column} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{column}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {outliers.length} outliers
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Outlier values: {outliers.slice(0, 5).map(v => v.toFixed(2)).join(', ')}
                    {outliers.length > 5 && ` and ${outliers.length - 5} more...`}
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quality Recommendations</h3>
          <p className="card-description">
            Suggestions to improve data quality
          </p>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            {quality.quality_score < 70 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Overall Quality Score</h4>
                  <p className="text-sm text-yellow-700">
                    The quality score is below 70. Consider addressing missing values and duplicates.
                  </p>
                </div>
              </div>
            )}
            
            {sortedMissingValues.length > 0 && sortedMissingValues[0][1] > 100 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Missing Data</h4>
                  <p className="text-sm text-red-700">
                    High amount of missing data detected. Consider imputation strategies or data collection improvements.
                  </p>
                </div>
              </div>
            )}
            
            {quality.duplicates > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Duplicate Records</h4>
                  <p className="text-sm text-blue-700">
                    Duplicate rows found. Consider removing duplicates to improve analysis accuracy.
                  </p>
                </div>
              </div>
            )}
            
            {Object.values(quality.outliers).some(outliers => outliers.length > 0) && (
              <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800">Outliers Detected</h4>
                  <p className="text-sm text-purple-700">
                    Statistical outliers found. Review these values for data entry errors or legitimate extreme values.
                  </p>
                </div>
              </div>
            )}

            {quality.quality_score >= 90 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Excellent Quality</h4>
                  <p className="text-sm text-green-700">
                    Your dataset has excellent quality metrics. It's ready for advanced analysis and modeling.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}