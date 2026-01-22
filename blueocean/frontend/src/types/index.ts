// API Response types matching the FastAPI backend
export interface APIResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  message: string;
  errors: string[];
}

export interface Dataset {
  id: number;
  name: string;
  description?: string;
  file_path: string;
  file_type: string;
  upload_date: string;
  size: number;
  row_count: number;
  column_count: number;
  user_id?: number;
}

export interface DatasetListResponse {
  datasets: Dataset[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  non_null_count: number;
  null_count: number;
  unique_count: number;
  sample_values: any[];
}

export interface DatasetPreview {
  dataset: Dataset;
  preview: any[][];
  columns: string[];
}

export interface DataQualityMetrics {
  missing_values: Record<string, number>;
  duplicates: number;
  outliers: Record<string, number[]>;
  quality_score: number;
  completeness_score: number;
}

export interface StatisticsResult {
  column: string;
  data_type: string;
  count: number;
  mean?: number;
  median?: number;
  mode?: any;
  std?: number;
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  unique_count?: number;
  skewness?: number;
  kurtosis?: number;
}

export interface CorrelationResult {
  column1: string;
  column2: string;
  correlation: number;
  strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  significance: 'not_significant' | 'significant';
}

export interface AnalysisResult {
  statistics: StatisticsResult[];
  correlations: CorrelationResult[];
  quality_metrics: DataQualityMetrics;
  insights: string[];
  column_types: Record<string, string>;
  distributions: Record<string, any>;
}

export interface AnalysisStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  started_at?: string;
  completed_at?: string;
}

export interface FullAnalysisResult {
  dataset_id: number;
  analysis_type: string;
  results: AnalysisResult;
  created_date: string;
}

// Frontend specific types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}