import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { logout, refreshTokenSuccess, refreshTokenFailure } from './authentication';
import { BASE_URL } from '@/constants';

// Define the base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Add authentication token if available
    const token = (getState() as RootState).auth?.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth?.refreshToken;
    
    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new token
        const { accessToken, expiresIn } = refreshResult.data as any;
        api.dispatch(refreshTokenSuccess({ accessToken, expiresIn }));
        
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch(refreshTokenFailure('Token refresh failed'));
        api.dispatch(logout());
      }
    } else {
      // No refresh token, logout user
      api.dispatch(logout());
    }
  }

  return result;
};

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'Profile'],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation<
      {
        message: string;
        user: any;
        userType: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<
      {
        user: any;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      },
      { email: string; password: string; name: string }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    refreshToken: builder.mutation<
      { accessToken: string; expiresIn: number },
      { refreshToken: string }
    >({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    // User profile endpoints
    getProfile: builder.query<any, void>({
      query: () => '/auth/profile',
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<any, Partial<any>>({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    // Password change
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Forgot password
    forgotPassword: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = apiSlice;
