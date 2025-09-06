"use client";

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState } from '@/store/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
  selectUser,
  selectIsAuthenticated,
  selectAccessToken,
  selectRefreshToken,
  selectIsLoading,
  selectAuthError,
  selectIsTokenExpired,
  type User,
} from '@/store/authentication';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/store/apiSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const isTokenExpired = useSelector(selectIsTokenExpired);

  // RTK Query mutations and queries
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [updateProfileMutation] = useUpdateProfileMutation();
  
  // Get profile query (only runs when authenticated)
  const { data: profileData, refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Login function
  const login = useCallback(async (
    email: string, 
    password: string, 
    keepLoggedIn: boolean = false
  ): Promise<boolean> => {
    try {
      dispatch(loginStart());
      
      // For demo purposes, simulate API call
      // In real app, use: const result = await loginMutation({ email, password }).unwrap();
      
      // Simulate successful login
      const userData: User = {
        id: "1",
        email: email,
        name: email.split("@")[0],
        role: "user",
      };

      const mockResponse = {
        user: userData,
        accessToken: `demo-access-token-${Date.now()}`,
        refreshToken: `demo-refresh-token-${Date.now()}`,
        expiresIn: 3600, // 1 hour
      };

      dispatch(loginSuccess(mockResponse));
      return true;
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Login failed'));
      return false;
    }
  }, [dispatch]);

  // Register function
  const register = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<boolean> => {
    try {
      dispatch(loginStart());
      
      // For demo purposes, simulate API call
      // In real app, use: const result = await registerMutation({ email, password, name }).unwrap();
      
      const userData: User = {
        id: "1",
        email: email,
        name: name,
        role: "user",
      };

      const mockResponse = {
        user: userData,
        accessToken: `demo-access-token-${Date.now()}`,
        refreshToken: `demo-refresh-token-${Date.now()}`,
        expiresIn: 3600,
      };

      dispatch(loginSuccess(mockResponse));
      return true;
    } catch (error: any) {
      dispatch(loginFailure(error.message || 'Registration failed'));
      return false;
    }
  }, [dispatch]);

  // Logout function
  const handleLogout = useCallback(async () => {
    try {
      // Call logout API if authenticated
      if (isAuthenticated) {
        await logoutMutation().unwrap();
      }
    } catch (error) {
      // Even if API call fails, still logout locally
      console.error('Logout API call failed:', error);
    } finally {
      dispatch(logout());
    }
  }, [dispatch, logoutMutation, isAuthenticated]);

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<User>): Promise<boolean> => {
    try {
      if (!isAuthenticated) return false;
      
      // Update via API
      await updateProfileMutation(profileData).unwrap();
      
      // Update local state
      dispatch(updateUser(profileData));
      
      return true;
    } catch (error: any) {
      console.error('Profile update failed:', error);
      return false;
    }
  }, [dispatch, updateProfileMutation, isAuthenticated]);

  // Clear error
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check authentication status
  const checkAuth = useCallback(() => {
    // This is handled automatically by the Redux store initialization
    // The initializeAuth action is dispatched in ReduxProvider
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    accessToken,
    refreshToken,
    isLoading: isLoading || isLoginLoading || isRegisterLoading,
    error,
    isTokenExpired,
    
    // Actions
    login,
    register,
    logout: handleLogout,
    updateProfile,
    clearError: clearAuthError,
    checkAuth,
    refetchProfile,
    
    // Additional data
    profileData,
  };
};
