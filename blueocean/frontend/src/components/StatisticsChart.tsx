import { StatisticsResult } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatisticsChartProps {
  statistics: StatisticsResult[];
}

export function StatisticsChart({ statistics }: StatisticsChartProps) {
  // Filter numerical statistics
  const numericalStats = statistics.filter(s => s.mean !== undefined);
  const categoricalStats = statistics.filter(s => s.mean === undefined && s.unique_count !== undefined);

  // Prepare data for charts
  const meanData = numericalStats.map(stat => ({
    name: stat.column,
    mean: stat.mean || 0,
    median: stat.median || 0,
    std: stat.std || 0
  }));

  const typeDistribution = statistics.reduce((acc, stat) => {
    const type = stat.data_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Statistics Summary</h3>
          <p className="card-description">
            Overview of statistical measures for all columns
          </p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Column</th>
                  <th className="table-head">Type</th>
                  <th className="table-head">Count</th>
                  <th className="table-head">Mean</th>
                  <th className="table-head">Median</th>
                  <th className="table-head">Std Dev</th>
                  <th className="table-head">Min</th>
                  <th className="table-head">Max</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-cell font-medium">{stat.column}</td>
                    <td className="table-cell">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {stat.data_type}
                      </span>
                    </td>
                    <td className="table-cell">{stat.count.toLocaleString()}</td>
                    <td className="table-cell">
                      {stat.mean !== undefined ? stat.mean.toFixed(2) : '-'}
                    </td>
                    <td className="table-cell">
                      {stat.median !== undefined ? stat.median.toFixed(2) : '-'}
                    </td>
                    <td className="table-cell">
                      {stat.std !== undefined ? stat.std.toFixed(2) : '-'}
                    </td>
                    <td className="table-cell">
                      {stat.min !== undefined ? stat.min.toFixed(2) : '-'}
                    </td>
                    <td className="table-cell">
                      {stat.max !== undefined ? stat.max.toFixed(2) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mean Values Chart */}
      {meanData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Mean Values by Column</h3>
            <p className="card-description">
              Comparison of mean values across numerical columns
            </p>
          </div>
          <div className="card-content">
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={meanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="mean" fill="#3B82F6" name="Mean" />
                  <Bar dataKey="median" fill="#10B981" name="Median" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Data Type Distribution */}
      {typeData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Data Type Distribution</h3>
            <p className="card-description">
              Distribution of different data types in the dataset
            </p>
          </div>
          <div className="card-content">
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Categorical Statistics */}
      {categoricalStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Categorical Statistics</h3>
            <p className="card-description">
              Analysis of categorical columns
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {categoricalStats.map((stat, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">{stat.column}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Unique Values:</span>
                      <div className="font-medium">{stat.unique_count?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Most Common:</span>
                      <div className="font-medium">{stat.mode !== undefined ? String(stat.mode) : 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Type:</span>
                      <div className="font-medium">{stat.data_type}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Count:</span>
                      <div className="font-medium">{stat.count.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}