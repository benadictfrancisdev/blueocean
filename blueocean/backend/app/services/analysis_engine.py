import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from scipy import stats
from sklearn.preprocessing import LabelEncoder
from app.exceptions import AnalysisError
from app.schemas.analysis import (
    StatisticsResult,
    DataQualityMetrics,
    CorrelationResult,
    DistributionInfo,
    FullAnalysisResult
)


class AnalysisEngine:
    """Core data analysis engine with comprehensive statistics and quality metrics"""
    
    def __init__(self):
        pass
    
    def perform_full_analysis(self, df: pd.DataFrame, dataset_id: int) -> FullAnalysisResult:
        """Perform comprehensive analysis on a dataset"""
        try:
            # Basic info
            row_count, column_count = df.shape
            memory_usage = df.memory_usage(deep=True).sum()
            
            # Identify column types
            column_types = self._identify_column_types(df)
            numerical_cols = [col for col, dtype in column_types.items() if dtype == "numerical"]
            categorical_cols = [col for col, dtype in column_types.items() if dtype == "categorical"]
            date_cols = [col for col, dtype in column_types.items() if dtype == "datetime"]
            
            # Statistics
            numerical_stats = self._compute_numerical_statistics(df, numerical_cols)
            categorical_stats = self._compute_categorical_statistics(df, categorical_cols)
            
            # Data quality
            quality_metrics = self._analyze_data_quality(df)
            
            # Correlations
            correlations = None
            if len(numerical_cols) > 1:
                correlations = self._compute_correlations(df, numerical_cols)
            
            # Potential keys
            potential_keys = self._identify_potential_keys(df)
            
            # Distributions
            distributions = self._compute_distributions(df, categorical_cols[:10])
            
            return FullAnalysisResult(
                dataset_id=dataset_id,
                row_count=row_count,
                column_count=column_count,
                memory_usage=memory_usage,
                numerical_stats=numerical_stats,
                categorical_stats=categorical_stats,
                quality_metrics=quality_metrics,
                correlations=correlations,
                column_types=column_types,
                date_columns=date_cols,
                potential_keys=potential_keys,
                distributions=distributions
            )
        except Exception as e:
            raise AnalysisError(f"Analysis failed: {str(e)}")
    
    def _identify_column_types(self, df: pd.DataFrame) -> Dict[str, str]:
        """Identify and categorize column types"""
        column_types = {}
        
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                column_types[col] = "numerical"
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                column_types[col] = "datetime"
            else:
                try:
                    pd.to_datetime(df[col], errors='raise')
                    column_types[col] = "datetime"
                except:
                    column_types[col] = "categorical"
        
        return column_types
    
    def _compute_numerical_statistics(self, df: pd.DataFrame, columns: List[str]) -> List[StatisticsResult]:
        """Compute comprehensive statistics for numerical columns"""
        results = []
        
        for col in columns:
            series = df[col].dropna()
            
            if len(series) == 0:
                continue
            
            try:
                mode_val = series.mode()[0] if len(series.mode()) > 0 else None
            except:
                mode_val = None
            
            stat = StatisticsResult(
                column=col,
                count=len(series),
                mean=float(series.mean()),
                median=float(series.median()),
                mode=float(mode_val) if mode_val is not None else None,
                std=float(series.std()),
                min=float(series.min()),
                max=float(series.max()),
                q25=float(series.quantile(0.25)),
                q50=float(series.quantile(0.50)),
                q75=float(series.quantile(0.75)),
                skewness=float(series.skew()),
                kurtosis=float(series.kurtosis()),
                unique_count=int(series.nunique()),
                null_count=int(df[col].isna().sum()),
                null_percentage=float(df[col].isna().sum() / len(df) * 100)
            )
            results.append(stat)
        
        return results
    
    def _compute_categorical_statistics(self, df: pd.DataFrame, columns: List[str]) -> List[StatisticsResult]:
        """Compute statistics for categorical columns"""
        results = []
        
        for col in columns:
            series = df[col].dropna()
            
            if len(series) == 0:
                continue
            
            try:
                mode_val = series.mode()[0] if len(series.mode()) > 0 else None
            except:
                mode_val = None
            
            stat = StatisticsResult(
                column=col,
                count=len(series),
                mode=str(mode_val) if mode_val is not None else None,
                unique_count=int(series.nunique()),
                null_count=int(df[col].isna().sum()),
                null_percentage=float(df[col].isna().sum() / len(df) * 100)
            )
            results.append(stat)
        
        return results
    
    def _analyze_data_quality(self, df: pd.DataFrame) -> DataQualityMetrics:
        """Analyze data quality metrics"""
        # Missing values
        missing_values = {}
        for col in df.columns:
            null_count = int(df[col].isna().sum())
            null_pct = float(null_count / len(df) * 100)
            missing_values[col] = {
                "count": null_count,
                "percentage": null_pct
            }
        
        # Duplicates
        duplicates = int(df.duplicated().sum())
        duplicate_percentage = float(duplicates / len(df) * 100)
        
        # Outliers (for numerical columns only)
        outliers = {}
        for col in df.select_dtypes(include=[np.number]).columns:
            outlier_indices = self._detect_outliers_iqr(df[col])
            if len(outlier_indices) > 0:
                outliers[col] = df.loc[outlier_indices, col].tolist()[:10]
        
        # Quality score
        completeness = 1 - (df.isna().sum().sum() / (len(df) * len(df.columns)))
        duplicate_impact = 1 - (duplicates / len(df))
        quality_score = float((completeness * 0.7 + duplicate_impact * 0.3) * 100)
        
        return DataQualityMetrics(
            missing_values=missing_values,
            duplicates=duplicates,
            duplicate_percentage=duplicate_percentage,
            outliers=outliers,
            quality_score=quality_score,
            completeness_score=float(completeness * 100)
        )
    
    def _detect_outliers_iqr(self, series: pd.Series) -> List[int]:
        """Detect outliers using IQR method"""
        series_clean = series.dropna()
        if len(series_clean) == 0:
            return []
        
        Q1 = series_clean.quantile(0.25)
        Q3 = series_clean.quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = series[(series < lower_bound) | (series > upper_bound)]
        return outliers.index.tolist()
    
    def _compute_correlations(self, df: pd.DataFrame, columns: List[str]) -> CorrelationResult:
        """Compute correlation matrix for numerical columns"""
        try:
            df_subset = df[columns].dropna()
            
            if len(df_subset) == 0 or len(columns) < 2:
                return None
            
            # Pearson correlation
            corr_matrix = df_subset.corr(method='pearson')
            
            # Convert to dict format
            corr_dict = {}
            for col1 in corr_matrix.columns:
                corr_dict[col1] = {}
                for col2 in corr_matrix.columns:
                    corr_dict[col1][col2] = float(corr_matrix.loc[col1, col2])
            
            # Find significant pairs (|correlation| > 0.5, excluding self-correlation)
            significant_pairs = []
            for i, col1 in enumerate(corr_matrix.columns):
                for col2 in corr_matrix.columns[i+1:]:
                    corr_value = float(corr_matrix.loc[col1, col2])
                    if abs(corr_value) > 0.5:
                        significant_pairs.append({
                            "column1": col1,
                            "column2": col2,
                            "correlation": corr_value,
                            "strength": self._interpret_correlation(abs(corr_value))
                        })
            
            # Sort by absolute correlation
            significant_pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)
            
            return CorrelationResult(
                method="pearson",
                matrix=corr_dict,
                significant_pairs=significant_pairs
            )
        except Exception as e:
            return None
    
    def _interpret_correlation(self, abs_corr: float) -> str:
        """Interpret correlation strength"""
        if abs_corr >= 0.9:
            return "very strong"
        elif abs_corr >= 0.7:
            return "strong"
        elif abs_corr >= 0.5:
            return "moderate"
        else:
            return "weak"
    
    def _identify_potential_keys(self, df: pd.DataFrame) -> List[str]:
        """Identify potential key/primary columns"""
        potential_keys = []
        
        for col in df.columns:
            unique_ratio = df[col].nunique() / len(df)
            null_ratio = df[col].isna().sum() / len(df)
            
            if unique_ratio > 0.95 and null_ratio < 0.01:
                potential_keys.append(col)
        
        return potential_keys
    
    def _compute_distributions(self, df: pd.DataFrame, columns: List[str]) -> List[DistributionInfo]:
        """Compute value distributions for categorical columns"""
        distributions = []
        
        for col in columns:
            value_counts = df[col].value_counts().head(20)
            dist_info = DistributionInfo(
                column=col,
                value_counts={str(k): int(v) for k, v in value_counts.items()}
            )
            distributions.append(dist_info)
        
        return distributions
    
    def compute_column_statistics(self, df: pd.DataFrame, column: str) -> StatisticsResult:
        """Compute statistics for a single column"""
        if column not in df.columns:
            raise AnalysisError(f"Column '{column}' not found in dataset")
        
        column_type = self._identify_column_types(df)[column]
        
        if column_type == "numerical":
            return self._compute_numerical_statistics(df, [column])[0]
        else:
            return self._compute_categorical_statistics(df, [column])[0]
