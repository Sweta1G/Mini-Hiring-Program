
import React from 'react';
import { Search } from 'lucide-react';
import NotificationButton from './NotificationButton';
import { useNotification } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';

const Header: React.FC = () => {
  const { notifications, markAllRead, removeNotification, clearNotifications } = useNotification();
  const { user } = useUser();
  const isMain = user.id === 'main';
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name, email, jobs..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <NotificationButton
            notifications={notifications}
            onMarkAllRead={markAllRead}
            onRemove={removeNotification}
            onClearAll={clearNotifications}
          />
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{isMain ? 'A' : user.name[0]}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{isMain ? 'Admin' : user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{isMain ? 'Admin' : user.title}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;