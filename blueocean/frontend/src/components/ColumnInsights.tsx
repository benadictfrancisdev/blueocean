import { Activity, Database, TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface ColumnInsightsProps {
  insights: string[];
  columnTypes: Record<string, string>;
  distributions: Record<string, any>;
}

export function ColumnInsights({ insights, columnTypes, distributions }: ColumnInsightsProps) {
  // Prepare data for visualizations
  const typeDistribution = Object.entries(columnTypes).reduce((acc, [column, type]) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type,
    value: count
  }));

  // Sample distribution data (this would come from the actual distributions)
  const distributionData = Object.entries(distributions).slice(0, 5).map(([column, data]) => ({
    name: column,
    values: data?.slice(0, 10) || []
  }));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  const getInsightIcon = (insight: string) => {
    if (insight.toLowerCase().includes('correlation')) return <TrendingUp className="w-5 h-5 text-blue-500" />;
    if (insight.toLowerCase().includes('missing') || insight.toLowerCase().includes('null')) return <TrendingDown className="w-5 h-5 text-red-500" />;
    if (insight.toLowerCase().includes('duplicate')) return <Database className="w-5 h-5 text-yellow-500" />;
    if (insight.toLowerCase().includes('outlier')) return <Activity className="w-5 h-5 text-purple-500" />;
    return <BarChart3 className="w-5 h-5 text-green-500" />;
  };

  const getInsightCategory = (insight: string) => {
    if (insight.toLowerCase().includes('correlation')) return 'correlation';
    if (insight.toLowerCase().includes('missing') || insight.toLowerCase().includes('null')) return 'missing';
    if (insight.toLowerCase().includes('duplicate')) return 'duplicate';
    if (insight.toLowerCase().includes('outlier')) return 'outlier';
    return 'general';
  };

  const categorizedInsights = insights.reduce((acc, insight) => {
    const category = getInsightCategory(insight);
    if (!acc[category]) acc[category] = [];
    acc[category].push(insight);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>AI-Generated Insights</span>
          </h3>
          <p className="card-description">
            Intelligent analysis findings and recommendations
          </p>
        </div>
        <div className="card-content">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-foreground mb-2">No Insights Available</h4>
              <p className="text-muted-foreground">
                Insights will appear here after analysis is complete
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getInsightIcon(insight)}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{insight}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getInsightCategory(insight) === 'correlation' ? 'bg-blue-100 text-blue-800' :
                        getInsightCategory(insight) === 'missing' ? 'bg-red-100 text-red-800' :
                        getInsightCategory(insight) === 'duplicate' ? 'bg-yellow-100 text-yellow-800' :
                        getInsightCategory(insight) === 'outlier' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {getInsightCategory(insight)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column Type Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Column Type Analysis</span>
          </h3>
          <p className="card-description">
            Distribution of data types across all columns
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type Distribution Chart */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Type Distribution</h4>
              {typeData.length > 0 && (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <RechartsPieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Type Statistics */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Type Statistics</h4>
              <div className="space-y-3">
                {Object.entries(typeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colors[Object.keys(typeDistribution).indexOf(type) % colors.length] }}
                      />
                      <span className="font-medium text-foreground">{type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">
                        {((count / Object.values(columnTypes).length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Findings by Category */}
      {Object.keys(categorizedInsights).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Insights by Category</span>
            </h3>
            <p className="card-description">
              Grouped insights for better understanding
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categorizedInsights).map(([category, categoryInsights]) => (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    {category === 'correlation' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                    {category === 'missing' && <TrendingDown className="w-5 h-5 text-red-500" />}
                    {category === 'duplicate' && <Database className="w-5 h-5 text-yellow-500" />}
                    {category === 'outlier' && <Activity className="w-5 h-5 text-purple-500" />}
                    {category === 'general' && <BarChart3 className="w-5 h-5 text-green-500" />}
                    <h4 className="font-semibold text-foreground capitalize">{category}</h4>
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                      {categoryInsights.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {categoryInsights.slice(0, 3).map((insight, index) => (
                      <p key={index} className="text-sm text-muted-foreground line-clamp-2">
                        {insight}
                      </p>
                    ))}
                    {categoryInsights.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{categoryInsights.length - 3} more insights
                      </p>
                    )}
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
          <h3 className="card-title flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Actionable Recommendations</span>
          </h3>
          <p className="card-description">
            Next steps to improve your data analysis
          </p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {categorizedInsights.correlation && categorizedInsights.correlation.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Explore Relationships</h4>
                <p className="text-sm text-blue-700">
                  Strong correlations detected. Consider investigating these relationships further through regression analysis or causation studies.
                </p>
              </div>
            )}

            {categorizedInsights.missing && categorizedInsights.missing.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Address Missing Data</h4>
                <p className="text-sm text-red-700">
                  Missing values found. Consider imputation techniques, data collection improvements, or exclusion strategies based on analysis goals.
                </p>
              </div>
            )}

            {categorizedInsights.duplicate && categorizedInsights.duplicate.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Clean Duplicates</h4>
                <p className="text-sm text-yellow-700">
                  Duplicate records detected. Remove duplicates to prevent skewed analysis results and ensure data integrity.
                </p>
              </div>
            )}

            {categorizedInsights.outlier && categorizedInsights.outlier.length > 0 && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Review Outliers</h4>
                <p className="text-sm text-purple-700">
                  Statistical outliers identified. Investigate whether these represent data errors, rare events, or important edge cases.
                </p>
              </div>
            )}

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Proceed with Analysis</h4>
              <p className="text-sm text-green-700">
                Based on the insights, your dataset is ready for advanced analytics, machine learning, or statistical modeling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}