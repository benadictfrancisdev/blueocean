import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DataDistributionProps {
  distributions: Record<string, any>;
}

export function DataDistribution({ distributions }: DataDistributionProps) {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  // Convert distribution data to chart format
  const getChartData = (column: string, distributionData: any) => {
    if (!distributionData || !Array.isArray(distributionData)) {
      return [];
    }

    // For categorical data
    if (typeof distributionData[0] === 'string' || distributionData[0]?.value) {
      return distributionData.map((item: any, index: number) => ({
        name: typeof item === 'string' ? item : item.value || `Value ${index}`,
        count: typeof item === 'string' ? 1 : item.count || 1
      }));
    }

    // For numerical data - create bins
    const numericalData = distributionData.filter((val: any) => typeof val === 'number');
    if (numericalData.length > 0) {
      const min = Math.min(...numericalData);
      const max = Math.max(...numericalData);
      const binCount = Math.min(10, Math.ceil(Math.sqrt(numericalData.length)));
      const binWidth = (max - min) / binCount;
      
      const bins = Array.from({ length: binCount }, (_, i) => ({
        name: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
        count: 0
      }));

      numericalData.forEach((value: number) => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
        bins[binIndex].count++;
      });

      return bins;
    }

    return [];
  };

  const columns = Object.keys(distributions);
  const availableColumns = columns.filter(col => distributions[col] && distributions[col].length > 0);

  if (availableColumns.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Data Distribution</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No distribution data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Column Selector */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Select Column for Distribution Analysis</h3>
          <p className="card-description">
            Choose a column to view its data distribution
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableColumns.map((column) => (
              <button
                key={column}
                onClick={() => setSelectedColumn(column)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedColumn === column
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="font-medium text-sm">{column}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {distributions[column]?.length || 0} values
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      {selectedColumn && distributions[selectedColumn] && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribution: {selectedColumn}</h3>
            <p className="card-description">
              Data distribution for the selected column
            </p>
          </div>
          <div className="card-content">
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={getChartData(selectedColumn, distributions[selectedColumn])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, 'Count']}
                    labelFormatter={(label) => `Value: ${label}`}
                  />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Statistics */}
      {selectedColumn && distributions[selectedColumn] && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribution Statistics</h3>
            <p className="card-description">
              Summary statistics for {selectedColumn}
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Basic Stats</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total Values:</dt>
                    <dd className="text-foreground font-medium">
                      {distributions[selectedColumn]?.length || 0}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Unique Values:</dt>
                    <dd className="text-foreground font-medium">
                      {new Set(distributions[selectedColumn]?.map((v: any) => 
                        typeof v === 'string' ? v : v.value || v
                      )).size}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Most Common:</dt>
                    <dd className="text-foreground font-medium">
                      {(() => {
                        const data = distributions[selectedColumn];
                        if (!data || data.length === 0) return 'N/A';
                        
                        const counts = data.reduce((acc: Record<string, number>, val: any) => {
                          const key = typeof val === 'string' ? val : val.value || val;
                          acc[key] = (acc[key] || 0) + 1;
                          return acc;
                        }, {});
                        
                        const mostCommon = Object.entries(counts).reduce((a, b) => 
                          counts[a[0]] > counts[b[0]] ? a : b
                        );
                        
                        return `${mostCommon[0]} (${mostCommon[1]} times)`;
                      })()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Data Type</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd className="text-foreground font-medium">
                      {(() => {
                        const data = distributions[selectedColumn];
                        if (!data || data.length === 0) return 'Unknown';
                        
                        const sample = data[0];
                        if (typeof sample === 'number') return 'Numerical';
                        if (typeof sample === 'string') return 'Categorical';
                        if (sample && typeof sample === 'object' && sample.value !== undefined) {
                          return typeof sample.value === 'number' ? 'Numerical' : 'Categorical';
                        }
                        return 'Mixed';
                      })()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Format:</dt>
                    <dd className="text-foreground font-medium">
                      {(() => {
                        const data = distributions[selectedColumn];
                        if (!data || data.length === 0) return 'Unknown';
                        
                        const sample = data[0];
                        if (typeof sample === 'number') return 'Continuous';
                        if (typeof sample === 'string') return 'Discrete';
                        if (sample && typeof sample === 'object') {
                          return sample.value !== undefined ? 'Categorical' : 'Object';
                        }
                        return 'Unknown';
                      })()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">Quality Indicators</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Completeness:</dt>
                    <dd className="text-foreground font-medium">
                      {(() => {
                        const data = distributions[selectedColumn];
                        if (!data) return '0%';
                        const nonNull = data.filter((val: any) => 
                          val !== null && val !== undefined && val !== ''
                        ).length;
                        return `${((nonNull / data.length) * 100).toFixed(1)}%`;
                      })()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cardinality:</dt>
                    <dd className="text-foreground font-medium">
                      {(() => {
                        const data = distributions[selectedColumn];
                        if (!data) return 'Low';
                        const unique = new Set(data.map((v: any) => 
                          typeof v === 'string' ? v : v.value || v
                        )).size;
                        if (unique / data.length < 0.1) return 'Low';
                        if (unique / data.length < 0.5) return 'Medium';
                        return 'High';
                      })()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Data Preview */}
      {selectedColumn && distributions[selectedColumn] && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sample Data Preview</h3>
            <p className="card-description">
              First 10 values from {selectedColumn}
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {distributions[selectedColumn]?.slice(0, 10).map((value: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg text-center">
                  <div className="text-sm font-medium text-foreground">
                    {typeof value === 'string' ? value : value.value || value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Index: {index + 1}
                  </div>
                </div>
              ))}
            </div>
            {distributions[selectedColumn]?.length > 10 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                ... and {distributions[selectedColumn].length - 10} more values
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}