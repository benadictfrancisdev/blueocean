import { CorrelationResult } from '@/types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CorrelationChartProps {
  correlations: CorrelationResult[];
}

export function CorrelationChart({ correlations }: CorrelationChartProps) {
  // Filter significant correlations
  const significantCorrelations = correlations.filter(c => c.significance === 'significant');
  const strongCorrelations = significantCorrelations.filter(c => Math.abs(c.correlation) > 0.7);
  const moderateCorrelations = significantCorrelations.filter(c => Math.abs(c.correlation) > 0.5 && Math.abs(c.correlation) <= 0.7);

  // Prepare data for scatter plot
  const scatterData = correlations.map(corr => ({
    x: corr.column1.length,
    y: corr.column2.length,
    correlation: corr.correlation,
    column1: corr.column1,
    column2: corr.column2,
    strength: corr.strength,
    significance: corr.significance
  }));

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return correlation > 0 ? '#10B981' : '#EF4444'; // Strong positive/negative
    if (abs >= 0.6) return correlation > 0 ? '#3B82F6' : '#F59E0B'; // Moderate positive/negative
    return '#6B7280'; // Weak
  };

  const getCorrelationDescription = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return correlation > 0 ? 'Very Strong Positive' : 'Very Strong Negative';
    if (abs >= 0.6) return correlation > 0 ? 'Strong Positive' : 'Strong Negative';
    if (abs >= 0.4) return correlation > 0 ? 'Moderate Positive' : 'Moderate Negative';
    if (abs >= 0.2) return correlation > 0 ? 'Weak Positive' : 'Weak Negative';
    return 'Very Weak/No Correlation';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Correlation Summary</h3>
          <p className="card-description">
            Overview of correlations between numerical columns
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {strongCorrelations.length}
              </div>
              <div className="text-sm text-muted-foreground">Strong Correlations</div>
              <div className="text-xs text-muted-foreground mt-1">|r| > 0.7</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {moderateCorrelations.length}
              </div>
              <div className="text-sm text-muted-foreground">Moderate Correlations</div>
              <div className="text-xs text-muted-foreground mt-1">0.5 < |r| ≤ 0.7</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {significantCorrelations.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Significant</div>
              <div className="text-xs text-muted-foreground mt-1">p < 0.05</div>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix Visualization */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Correlation Scatter Plot</h3>
          <p className="card-description">
            Visualization of correlation patterns (point size represents correlation strength)
          </p>
        </div>
        <div className="card-content">
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Column 1 Length"
                  label={{ value: 'Column 1 Name Length', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Column 2 Length"
                  label={{ value: 'Column 2 Name Length', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [
                    props.payload.correlation.toFixed(3),
                    'Correlation'
                  ]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.column1} vs ${data.column2}`;
                    }
                    return label;
                  }}
                />
                <Scatter dataKey="correlation" fill="#8884d8">
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCorrelationColor(entry.correlation)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Strong Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Moderate Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Weak</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Moderate Negative</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Strong Negative</span>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detailed Correlations</h3>
          <p className="card-description">
            All correlation pairs with their significance and strength
          </p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Column 1</th>
                  <th className="table-head">Column 2</th>
                  <th className="table-head">Correlation</th>
                  <th className="table-head">Strength</th>
                  <th className="table-head">Description</th>
                  <th className="table-head">Significance</th>
                </tr>
              </thead>
              <tbody>
                {correlations.map((corr, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-cell font-medium">{corr.column1}</td>
                    <td className="table-cell font-medium">{corr.column2}</td>
                    <td className="table-cell">
                      <span className="font-mono">
                        {corr.correlation.toFixed(3)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        Math.abs(corr.correlation) >= 0.7 ? 'bg-green-100 text-green-800' :
                        Math.abs(corr.correlation) >= 0.5 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {corr.strength.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      {getCorrelationDescription(corr.correlation)}
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        corr.significance === 'significant' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {corr.significance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {strongCorrelations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Key Correlation Insights</h3>
            <p className="card-description">
              Strong correlations that may indicate important relationships
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {strongCorrelations.slice(0, 5).map((corr, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium text-foreground">
                      {corr.column1} ↔ {corr.column2}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {getCorrelationDescription(corr.correlation)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      corr.correlation > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(3)}
                    </div>
                    <div className="text-xs text-muted-foreground">correlation</div>
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