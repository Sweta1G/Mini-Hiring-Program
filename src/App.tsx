
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider, useUser } from './contexts/UserContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import JobsList from './components/Jobs/JobsList';
import CandidatesList from './components/Candidates/CandidatesList';
import KanbanBoard from './components/Candidates/KanbanBoard';
import CandidateProfile from './components/Candidates/CandidateProfile';
import AssessmentBuilder from './components/Assessments/AssessmentBuilder';
import AssessmentsList from './components/Assessments/AssessmentsList';

// --- SettingsPage component for login controls ---
const SettingsPage: React.FC = () => {
  const { user, users, login, logout } = useUser();
  const [form, setForm] = React.useState<{ [id: string]: string }>({});
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = (id: string) => {
    if (id === 'main') {
      login('main');
      setError(null);
      return;
    }
    if (form[id] === 'password') {
      login(id);
      setError(null);
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="py-12 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Settings</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accounts</h3>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map(u => (
            <li key={u.id} className="py-4 flex items-center space-x-4">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{u.name}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{u.title} ({u.role === 'readonly' ? 'Read Only' : 'HR'})</div>
              </div>
              {user.id === u.id ? (
                <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-semibold">Logged In</span>
              ) : u.id === 'main' ? (
                <button
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
                  onClick={() => login('main')}
                >
                  Switch to Main
                </button>
              ) : (
                <form
                  className="flex items-center gap-2"
                  onSubmit={e => { e.preventDefault(); handleLogin(u.id); }}
                >
                  <input
                    type="password"
                    placeholder="Password"
                    className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm"
                    value={form[u.id] || ''}
                    onChange={e => setForm(f => ({ ...f, [u.id]: e.target.value }))}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Login
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {user.id !== 'main' && (
          <button
            className="mt-6 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium"
            onClick={logout}
          >
            Logout
          </button>
        )}
        {error && <div className="mt-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      </div>
    </div>
  );
};




const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                  <Routes>
                    <Route path="/" element={<Navigate to="/jobs" replace />} />
                    <Route path="/jobs" element={<JobsList />} />
                    <Route path="/candidates" element={<CandidatesList />} />
                    <Route path="/candidates/kanban" element={<KanbanBoard />} />
                    <Route path="/candidates/:id" element={<CandidateProfile />} />
                    <Route path="/assessments" element={<AssessmentsList />} />
                    <Route path="/assessments/:id" element={<AssessmentBuilder />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
