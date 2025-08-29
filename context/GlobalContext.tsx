'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
  username: string;
  setUsername: (name: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isRefreshMenu: boolean;
  setIsRefreshMenu: (value: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isRefreshMenu, setIsRefreshMenu] = useState(false);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <GlobalContext.Provider value={{ username, setUsername, theme, toggleTheme, isRefreshMenu, setIsRefreshMenu }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook để dùng context dễ hơn
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
export default GlobalProvider;