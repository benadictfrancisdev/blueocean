import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'csv':
      return '📊';
    case 'xlsx':
    case 'xls':
      return '📈';
    case 'json':
      return '🔧';
    case 'parquet':
      return '⚡';
    default:
      return '📄';
  }
}

export function getCorrelationColor(correlation: number): string {
  const abs = Math.abs(correlation);
  if (abs >= 0.8) return correlation > 0 ? '#10B981' : '#EF4444';
  if (abs >= 0.6) return correlation > 0 ? '#3B82F6' : '#F59E0B';
  return '#6B7280';
}

export function getQualityScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function getInsightCategory(insight: string): string {
  if (insight.toLowerCase().includes('correlation')) return 'correlation';
  if (insight.toLowerCase().includes('missing') || insight.toLowerCase().includes('null')) return 'missing';
  if (insight.toLowerCase().includes('duplicate')) return 'duplicate';
  if (insight.toLowerCase().includes('outlier')) return 'outlier';
  return 'general';
}