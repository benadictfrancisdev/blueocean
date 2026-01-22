import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DatasetDetail } from './pages/DatasetDetail';
import { Upload } from './pages/Upload';
import { AnalysisView } from './pages/AnalysisView';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/datasets/:id" element={<DatasetDetail />} />
        <Route path="/analysis/:id" element={<AnalysisView />} />
      </Routes>
    </Layout>
  );
}

export default App;