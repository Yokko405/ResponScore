import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { ToastContainer } from './components/Toast';
import { TaskListPage } from './pages/TaskListPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { RankingPage } from './pages/RankingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './App.css';

function App() {
  const [currentUserId, setCurrentUserId] = useState('user1');

  return (
    <Router>
      <MainLayout currentUserId={currentUserId} onUserChange={setCurrentUserId}>
        <Routes>
          <Route path="/" element={<TaskListPage currentUserId={currentUserId} />} />
          <Route path="/task/:id" element={<TaskDetailPage currentUserId={currentUserId} />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </MainLayout>
      <ToastContainer />
    </Router>
  );
}

export default App;
