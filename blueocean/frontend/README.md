# DataForge AI - BlueOcean Frontend

Modern React-based frontend for the DataForge AI data analysis platform.

## Features

- **Interactive Dashboard**: Overview of datasets and analysis status
- **File Upload**: Drag-and-drop interface for CSV, Excel, JSON, and Parquet files
- **Data Visualization**: Interactive charts and graphs using Chart.js and Recharts
- **Real-time Analysis**: Live status updates during data processing
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Chart.js & Recharts** for data visualization
- **React Dropzone** for file uploads
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── StatisticsChart.tsx
│   │   ├── CorrelationChart.tsx
│   │   ├── QualityMetrics.tsx
│   │   ├── ColumnInsights.tsx
│   │   └── DataDistribution.tsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── Upload.tsx      # File upload page
│   │   ├── DatasetDetail.tsx
│   │   └── AnalysisView.tsx
│   ├── services/          # API services
│   │   └── api.ts         # API client
│   ├── types/             # TypeScript types
│   │   └── index.ts       # Type definitions
│   ├── hooks/             # Custom React hooks
│   │   └── useApi.ts      # API hooks
│   ├── utils/             # Utility functions
│   │   └── index.ts       # Helper functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS config
└── tsconfig.json        # TypeScript config
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on localhost:8000

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and will proxy API requests to `http://localhost:8000`.

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## API Integration

The frontend communicates with the FastAPI backend through the `/api/v1` endpoints:

- **GET /api/v1/health** - Health check
- **GET /api/v1/datasets** - List datasets
- **POST /api/v1/datasets/upload** - Upload files
- **GET /api/v1/datasets/{id}** - Get dataset details
- **POST /api/v1/analysis/full-analysis/{id}** - Start analysis
- **GET /api/v1/analysis/results/{id}** - Get analysis results
- **GET /api/v1/analysis/status/{id}** - Check analysis status

## Features Overview

### Dashboard
- Overview of all uploaded datasets
- Analysis status indicators
- Quick statistics and metrics
- Navigation to detailed views

### File Upload
- Drag-and-drop interface
- Support for multiple file formats
- Upload progress tracking
- Real-time validation

### Dataset Detail
- Data preview (first 100 rows)
- Column information and metadata
- File statistics and info
- Start analysis functionality

### Analysis View
- Comprehensive analysis results
- Interactive charts and visualizations
- Quality metrics and insights
- Statistical summaries

## Design System

The frontend uses a consistent design system with:
- **Colors**: Primary blue theme with semantic colors
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI components
- **Icons**: Lucide React icon library

## State Management

The application uses React hooks for state management:
- `useState` for local component state
- `useEffect` for side effects
- Custom hooks for API interactions
- Context for global state (if needed)

## Error Handling

- API errors are caught and displayed as toast notifications
- Loading states for all async operations
- Retry mechanisms for failed requests
- User-friendly error messages

## Performance

- Code splitting with React.lazy()
- Image optimization
- Efficient re-rendering with React keys
- Debounced API calls for search functionality
- Lazy loading of chart components

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Include responsive design
5. Update documentation as needed