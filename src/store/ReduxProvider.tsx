"use client";

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeAuth } from './authentication';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize authentication state from localStorage on app start
    store.dispatch(initializeAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
};
