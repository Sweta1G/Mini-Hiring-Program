import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
      },
      ...prev,
    ]);
  };


  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllRead, removeNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
