/**
 * Token Management Utilities
 * Handles secure storage and retrieval of authentication tokens
 */

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
}

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  userData: any;
}

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRY: 'tokenExpiry',
  USER_DATA: 'userData',
  TOKEN_TYPE: 'tokenType',
} as const;

// Token expiration buffer (5 minutes before actual expiry)
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if we're running in a browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Save tokens to localStorage
 */
export const saveTokens = (tokenData: TokenData, userData: any): void => {
  if (!isBrowser()) return;

  try {
    const tokenExpiry = Date.now() + (tokenData.expiresIn * 1000);
    
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokenData.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokenData.refreshToken);
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, tokenExpiry.toString());
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    
    if (tokenData.tokenType) {
      localStorage.setItem(TOKEN_KEYS.TOKEN_TYPE, tokenData.tokenType);
    }
  } catch (error) {
    console.error('Failed to save tokens to localStorage:', error);
  }
};

/**
 * Load tokens from localStorage
 */
export const loadTokens = (): StoredTokens | null => {
  if (!isBrowser()) return null;

  try {
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    const tokenExpiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);

    if (!accessToken || !refreshToken || !tokenExpiry || !userData) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      tokenExpiry: parseInt(tokenExpiry),
      userData: JSON.parse(userData),
    };
  } catch (error) {
    console.error('Failed to load tokens from localStorage:', error);
    return null;
  }
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_TYPE);
  } catch (error) {
    console.error('Failed to clear tokens from localStorage:', error);
  }
};

/**
 * Check if access token is expired or will expire soon
 */
export const isTokenExpired = (expiry: number): boolean => {
  return Date.now() >= (expiry - TOKEN_EXPIRY_BUFFER);
};

/**
 * Check if access token needs refresh (expires within buffer time)
 */
export const needsRefresh = (expiry: number): boolean => {
  return Date.now() >= (expiry - TOKEN_EXPIRY_BUFFER);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
};

/**
 * Get token expiry from localStorage
 */
export const getTokenExpiry = (): number | null => {
  if (!isBrowser()) return null;
  const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
  return expiry ? parseInt(expiry) : null;
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): any | null => {
  if (!isBrowser()) return null;
  
  try {
    const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data from localStorage:', error);
    return null;
  }
};

/**
 * Update access token (for token refresh)
 */
export const updateAccessToken = (accessToken: string, expiresIn: number): void => {
  if (!isBrowser()) return;

  try {
    const tokenExpiry = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, tokenExpiry.toString());
  } catch (error) {
    console.error('Failed to update access token:', error);
  }
};

/**
 * Update user data
 */
export const updateUserData = (userData: any): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to update user data:', error);
  }
};

/**
 * Check if user is authenticated (has valid tokens)
 */
export const isAuthenticated = (): boolean => {
  const tokens = loadTokens();
  if (!tokens) return false;
  
  return !isTokenExpired(tokens.tokenExpiry);
};

/**
 * Get authorization header value
 */
export const getAuthHeader = (): string | null => {
  const accessToken = getAccessToken();
  const tokenType = isBrowser() ? localStorage.getItem(TOKEN_KEYS.TOKEN_TYPE) || 'Bearer' : 'Bearer';
  
  return accessToken ? `${tokenType} ${accessToken}` : null;
};

/**
 * Token refresh utility
 */
export const refreshAccessToken = async (refreshToken: string): Promise<TokenData | null> => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || refreshToken,
      expiresIn: data.expiresIn,
      tokenType: data.tokenType || 'Bearer',
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Automatic token refresh interceptor
 */
export const createTokenRefreshInterceptor = () => {
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    failedQueue = [];
  };

  return {
    isRefreshing: () => isRefreshing,
    addToQueue: (resolve: (value: any) => void, reject: (error: any) => void) => {
      failedQueue.push({ resolve, reject });
    },
    processQueue,
    setRefreshing: (refreshing: boolean) => {
      isRefreshing = refreshing;
    },
  };
};
