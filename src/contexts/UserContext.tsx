import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'readonly' | 'hr';
export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  title: string;
}

const USERS: UserAccount[] = [
  { id: 'main', name: 'Main Account', role: 'readonly', title: 'Read Only' },
  { id: 'kraya', name: 'Kraya', role: 'hr', title: 'Lead HR' },
  { id: 'amit', name: 'Amit', role: 'hr', title: 'HR Specialist' },
  { id: 'ryan', name: 'Ryan', role: 'hr', title: 'Recruiter' },
  { id: 'sara', name: 'Sara', role: 'hr', title: 'Recruiter' },
];

interface UserContextType {
  user: UserAccount;
  users: UserAccount[];
  login: (id: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserAccount>(USERS[0]);

  const login = (id: string) => {
    const found = USERS.find(u => u.id === id);
    if (found) setUser(found);
  };
  const logout = () => setUser(USERS[0]);

  return (
    <UserContext.Provider value={{ user, users: USERS, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
