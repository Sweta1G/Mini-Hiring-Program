import React from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, Users, FileText, Settings, Moon, Sun, Kanban } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: '/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/candidates', icon: Users, label: 'Candidates' },
    { to: '/candidates/kanban', icon: Kanban, label: 'Pipeline' },
    { to: '/assessments', icon: FileText, label: 'Assessments' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TalentFlow
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hiring Platform</p>
        <div className="mt-4">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5 mr-3" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-5 h-5 mr-3" />
                Light Mode
              </>
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Theme toggle moved to top */}
    </aside>
  );
};

export default Sidebar;