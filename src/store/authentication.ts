import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Token management utilities
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRY: 'tokenExpiry',
  USER_DATA: 'userData',
} as const;

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
  permissions?: string[];
  userType?: string;
}

// Authentication state interface
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  userType: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  userType: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Token management functions
const saveTokensToStorage = (accessToken: string, refreshToken: string, expiry: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiry.toString());
  }
};

const saveUserToStorage = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
  }
};

const clearTokensFromStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  }
};

const loadTokensFromStorage = () => {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  const tokenExpiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);

  if (accessToken && refreshToken && tokenExpiry && userData) {
    return {
      accessToken,
      refreshToken,
      tokenExpiry: parseInt(tokenExpiry),
      user: JSON.parse(userData),
    };
  }
  return null;
};

// Check if token is expired
const isTokenExpired = (expiry: number): boolean => {
  return Date.now() >= expiry;
};

// Authentication slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login action
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
        loginSuccess: (state, action: PayloadAction<{
      user: User;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      userType: string;
    }>) => {
      const { user, accessToken, refreshToken, expiresIn, userType } = action.payload;
      const tokenExpiry = Date.now() + (expiresIn * 1000);
      
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.tokenExpiry = tokenExpiry;
      state.userType = userType;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      
      // Save to localStorage
      saveTokensToStorage(accessToken, refreshToken, tokenExpiry);
      saveUserToStorage(user);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
    },

    // Logout action
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      state.userType = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Clear localStorage
      clearTokensFromStorage();
    },

    // Token refresh actions
    refreshTokenStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    refreshTokenSuccess: (state, action: PayloadAction<{
      accessToken: string;
      expiresIn: number;
    }>) => {
      const { accessToken, expiresIn } = action.payload;
      const tokenExpiry = Date.now() + (expiresIn * 1000);
      
      state.accessToken = accessToken;
      state.tokenExpiry = tokenExpiry;
      state.isLoading = false;
      state.error = null;

      // Update localStorage
      if (state.refreshToken) {
        saveTokensToStorage(accessToken, state.refreshToken, tokenExpiry);
      }
    },
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      // If refresh fails, logout user
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      state.isAuthenticated = false;
      clearTokensFromStorage();
    },

    // Initialize auth from storage
    initializeAuth: (state) => {
      const storedData = loadTokensFromStorage();
      if (storedData) {
        const { accessToken, refreshToken, tokenExpiry, user } = storedData;
        
        // Check if token is still valid
        if (!isTokenExpired(tokenExpiry)) {
          state.user = user;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.tokenExpiry = tokenExpiry;
          state.isAuthenticated = true;
        } else {
          // Token expired, clear storage
          clearTokensFromStorage();
        }
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update user data
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveUserToStorage(state.user);
      }
    },
  },
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  initializeAuth,
  clearError,
  updateUser,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) => state.auth.refreshToken;
export const selectUserType = (state: { auth: AuthState }) => state.auth.userType;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectIsTokenExpired = (state: { auth: AuthState }) => {
  const { tokenExpiry } = state.auth;
  return tokenExpiry ? isTokenExpired(tokenExpiry) : true;
};

// Export reducer
export default authSlice.reducer;
