import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  APIResponse,
  Dataset,
  DatasetListResponse,
  DatasetPreview,
  AnalysisResult,
  AnalysisStatus,
  FullAnalysisResult,
  ColumnInfo,
  StatisticsResult
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api/v1',
      timeout: 30000, // 30 seconds for large file analysis
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  private handleResponse<T>(response: AxiosResponse<APIResponse<T>>): T {
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'An error occurred');
    }
    return response.data.data as T;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Dataset operations
  async getDatasets(page = 1, perPage = 10): Promise<DatasetListResponse> {
    const response = await this.api.get<APIResponse<DatasetListResponse>>('/datasets', {
      params: { page, per_page: perPage }
    });
    return this.handleResponse(response);
  }

  async getDataset(id: number): Promise<DatasetPreview> {
    const response = await this.api.get<APIResponse<DatasetPreview>>(`/datasets/${id}`);
    return this.handleResponse(response);
  }

  async getDatasetColumns(id: number): Promise<ColumnInfo[]> {
    const response = await this.api.get<APIResponse<ColumnInfo[]>>(`/datasets/${id}/columns`);
    return this.handleResponse(response);
  }

  async deleteDataset(id: number): Promise<void> {
    const response = await this.api.delete<APIResponse<void>>(`/datasets/${id}`);
    this.handleResponse(response);
  }

  async uploadDataset(
    file: File,
    name?: string,
    description?: string,
    onProgress?: (progress: number) => void
  ): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);

    const response = await this.api.post<APIResponse<Dataset>>(
      '/datasets/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      }
    );
    return this.handleResponse(response);
  }

  // Analysis operations
  async startAnalysis(datasetId: number): Promise<{ task_id: string }> {
    const response = await this.api.post<APIResponse<{ task_id: string }>>(
      `/analysis/full-analysis/${datasetId}`
    );
    return this.handleResponse(response);
  }

  async getAnalysisStatus(datasetId: number): Promise<AnalysisStatus> {
    const response = await this.api.get<APIResponse<AnalysisStatus>>(
      `/analysis/status/${datasetId}`
    );
    return this.handleResponse(response);
  }

  async getAnalysisResults(datasetId: number): Promise<AnalysisResult> {
    const response = await this.api.get<APIResponse<AnalysisResult>>(
      `/analysis/results/${datasetId}`
    );
    return this.handleResponse(response);
  }

  async getAnalysisSummary(datasetId: number): Promise<any> {
    const response = await this.api.get<APIResponse<any>>(`/analysis/summary/${datasetId}`);
    return this.handleResponse(response);
  }

  async getColumnStatistics(datasetId: number, columnName: string): Promise<StatisticsResult> {
    const response = await this.api.get<APIResponse<StatisticsResult>>(
      `/analysis/statistics/${datasetId}/${columnName}`
    );
    return this.handleResponse(response);
  }

  // Utility method to poll analysis status
  async pollAnalysisStatus(
    datasetId: number,
    onUpdate?: (status: AnalysisStatus) => void,
    interval = 2000,
    maxAttempts = 150 // 5 minutes max
  ): Promise<AnalysisResult> {
    let attempts = 0;

    const poll = async (): Promise<AnalysisResult> => {
      attempts++;
      
      try {
        const status = await this.getAnalysisStatus(datasetId);
        
        if (onUpdate) {
          onUpdate(status);
        }

        if (status.status === 'completed') {
          return await this.getAnalysisResults(datasetId);
        } else if (status.status === 'failed') {
          throw new Error(status.message || 'Analysis failed');
        } else if (attempts >= maxAttempts) {
          throw new Error('Analysis timed out');
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      } catch (error) {
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      }
    };

    return poll();
  }
}

export const apiService = new ApiService();
export default apiService;