# Redux Authentication System Guide

This guide explains how to use the comprehensive Redux-based authentication system implemented in this Next.js admin dashboard.

## Overview

The authentication system includes:
- **Redux Store**: Centralized state management for authentication
- **Token Management**: Secure handling of access and refresh tokens
- **RTK Query**: API integration with automatic token refresh
- **Persistent Storage**: Automatic token persistence in localStorage
- **Type Safety**: Full TypeScript support

## Architecture

```
src/
├── store/
│   ├── store.ts              # Redux store configuration
│   ├── authentication.ts     # Auth slice with actions/reducers
│   ├── apiSlice.ts          # RTK Query API endpoints
│   └── ReduxProvider.tsx    # Redux provider wrapper
├── hooks/
│   └── useAuth.ts           # Custom hook for auth operations
├── utils/
│   └── tokenManager.ts      # Token management utilities
└── components/auth/
    └── AuthExample.tsx      # Example usage component
```

## Key Features

### 1. Token Management
- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for refreshing access tokens
- **Automatic Refresh**: Tokens are automatically refreshed when expired
- **Secure Storage**: Tokens stored in localStorage with expiry tracking

### 2. Redux State
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### 3. API Integration
- **RTK Query**: Automatic caching and synchronization
- **Token Interceptors**: Automatic token attachment to requests
- **Error Handling**: Automatic logout on token refresh failure

## Usage

### 1. Basic Authentication Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateProfile,
  } = useAuth();

  // Your component logic
}
```

### 2. Login

```typescript
const handleLogin = async () => {
  const success = await login('user@example.com', 'password');
  if (success) {
    // User is now logged in
    console.log('Login successful');
  }
};
```

### 3. Register

```typescript
const handleRegister = async () => {
  const success = await register('user@example.com', 'password', 'John Doe');
  if (success) {
    // User is now registered and logged in
    console.log('Registration successful');
  }
};
```

### 4. Logout

```typescript
const handleLogout = async () => {
  await logout();
  // User is now logged out, tokens cleared
};
```

### 5. Update Profile

```typescript
const handleUpdateProfile = async () => {
  const success = await updateProfile({
    name: 'New Name',
    avatar: 'new-avatar-url',
  });
  if (success) {
    console.log('Profile updated');
  }
};
```

### 6. Direct Redux Usage

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, logout } from '@/store/authentication';

function MyComponent() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
  };
}
```

## API Endpoints

The system expects these API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Profile
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Password Recovery
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

## Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Token Storage

Tokens are automatically stored in localStorage with these keys:
- `accessToken` - Access token
- `refreshToken` - Refresh token
- `tokenExpiry` - Token expiry timestamp
- `userData` - User information

## Security Features

1. **Automatic Token Refresh**: Tokens are refreshed 5 minutes before expiry
2. **Secure Storage**: Tokens stored in localStorage with proper error handling
3. **Request Interceptors**: Automatic token attachment to API requests
4. **Error Handling**: Automatic logout on authentication failures
5. **Type Safety**: Full TypeScript support for all operations

## Error Handling

The system provides comprehensive error handling:

```typescript
const { error, clearError } = useAuth();

// Display error
if (error) {
  return <div className="error">{error}</div>;
}

// Clear error
const handleClearError = () => {
  clearError();
};
```

## Loading States

```typescript
const { isLoading } = useAuth();

if (isLoading) {
  return <div>Loading...</div>;
}
```

## Example Component

See `src/components/auth/AuthExample.tsx` for a complete example of how to use the authentication system in a React component.

## Integration with Existing Context

The system is designed to work alongside the existing `AuthContext` while providing Redux-based state management. The `useAuth` hook provides a unified interface that combines both systems.

## Best Practices

1. **Always use the `useAuth` hook** instead of directly accessing Redux state
2. **Handle loading states** appropriately in your UI
3. **Clear errors** when starting new authentication operations
4. **Use the provided selectors** for accessing specific pieces of state
5. **Implement proper error boundaries** for authentication failures

## Troubleshooting

### Common Issues

1. **Tokens not persisting**: Check if localStorage is available in your environment
2. **API calls failing**: Verify your API endpoints and environment variables
3. **Type errors**: Ensure all TypeScript types are properly imported
4. **Infinite refresh loops**: Check your token refresh logic and API responses

### Debug Mode

Enable Redux DevTools in development to inspect the authentication state:

```typescript
// In store.ts
devTools: process.env.NODE_ENV !== 'production',
```

This comprehensive authentication system provides a robust foundation for managing user authentication in your Next.js application with full Redux integration and token management.
