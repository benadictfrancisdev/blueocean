import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Dataset, DatasetListResponse } from '@/types';

export function useDatasets(page = 1, perPage = 10) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    pages: 0,
  });

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDatasets(page, perPage);
      setDatasets(response.datasets);
      setPagination({
        page: response.page,
        perPage: response.per_page,
        total: response.total,
        pages: response.pages,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, [page, perPage]);

  return {
    datasets,
    loading,
    error,
    pagination,
    refetch: loadDatasets,
  };
}

export function useDataset(id: string) {
  const [dataset, setDataset] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadDataset = async () => {
      try {
        setLoading(true);
        const [datasetData, columnsData] = await Promise.all([
          apiService.getDataset(parseInt(id)),
          apiService.getDatasetColumns(parseInt(id)),
        ]);
        setDataset(datasetData);
        setColumns(columnsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dataset');
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, [id]);

  return {
    dataset,
    columns,
    loading,
    error,
    refetch: () => {
      if (id) {
        const loadDataset = async () => {
          try {
            const [datasetData, columnsData] = await Promise.all([
              apiService.getDataset(parseInt(id)),
              apiService.getDatasetColumns(parseInt(id)),
            ]);
            setDataset(datasetData);
            setColumns(columnsData);
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dataset');
          }
        };
        loadDataset();
      }
    },
  };
}

export function useAnalysis(datasetId: string) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasetId) return;

    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const [analysisData, statusData] = await Promise.all([
          apiService.getAnalysisResults(parseInt(datasetId)),
          apiService.getAnalysisStatus(parseInt(datasetId)),
        ]);
        setAnalysis(analysisData);
        setStatus(statusData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [datasetId]);

  const startAnalysis = async () => {
    if (!datasetId) return;
    
    try {
      await apiService.startAnalysis(parseInt(datasetId));
      // Start polling for status updates
      const pollStatus = async () => {
        try {
          const statusData = await apiService.getAnalysisStatus(parseInt(datasetId));
          setStatus(statusData);
          
          if (statusData.status === 'completed') {
            const analysisData = await apiService.getAnalysisResults(parseInt(datasetId));
            setAnalysis(analysisData);
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.message || 'Analysis failed');
          } else {
            // Continue polling
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          console.error('Analysis polling error:', err);
        }
      };
      pollStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
    }
  };

  return {
    analysis,
    status,
    loading,
    error,
    startAnalysis,
    refetch: () => {
      if (datasetId) {
        const loadAnalysis = async () => {
          try {
            const [analysisData, statusData] = await Promise.all([
              apiService.getAnalysisResults(parseInt(datasetId)),
              apiService.getAnalysisStatus(parseInt(datasetId)),
            ]);
            setAnalysis(analysisData);
            setStatus(statusData);
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load analysis');
          }
        };
        loadAnalysis();
      }
    },
  };
}