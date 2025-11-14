import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import ExerciseCategories from './pages/ExerciseCategories';
import Tags from './pages/Tags';
import Exercises from './pages/Exercises';
import Routines from './pages/Routines';
import Sessions from './pages/Sessions';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/categories" element={<ExerciseCategories />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/sessions" element={<Sessions />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
