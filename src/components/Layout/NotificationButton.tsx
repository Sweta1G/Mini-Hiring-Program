import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationButtonProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ notifications, onMarkAllRead, onRemove, onClearAll }) => {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
  <div className="relative" ref={panelRef}>
      <button
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        onClick={() => setOpen(o => !o)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-900 dark:text-white">Notifications</span>
            <div className="flex gap-2">
              <button
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={onMarkAllRead}
              >
                Mark all as read
              </button>
              <button
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
                onClick={onClearAll}
              >
                Clear all
              </button>
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <li className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</li>
            ) : (
              notifications.map(n => (
                <li key={n.id} className={`group px-4 py-3 flex items-center justify-between gap-2 ${n.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                  <div>
                    <span className="text-sm text-gray-900 dark:text-white">{n.message}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{n.time}</span>
                  </div>
                  <button
                    className="opacity-60 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition ml-2"
                    title="Clear notification"
                    onClick={() => onRemove(n.id)}
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
