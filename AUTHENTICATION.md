# Authentication System

This project now includes a complete authentication system with localStorage persistence.

## Features

- **User Login**: Users can sign in with email and password
- **Persistent Sessions**: User authentication state is saved to localStorage
- **Protected Routes**: Admin pages require authentication
- **Auto-redirect**: Unauthenticated users are redirected to login page
- **Logout Functionality**: Users can sign out from the user dropdown
- **Keep Me Logged In**: Optional checkbox to maintain session

## How It Works

### 1. Authentication Context (`src/context/AuthContext.tsx`)
- Manages global authentication state
- Provides login/logout functions
- Handles localStorage persistence
- Checks authentication status on app load

### 2. Protected Routes (`src/components/auth/ProtectedRoute.tsx`)
- Wraps admin pages to require authentication
- Redirects unauthenticated users to `/signin`
- Shows loading state while checking auth status

### 3. Sign In Form (`src/components/auth/SignInForm.tsx`)
- Handles user login with email/password
- Shows error messages for failed attempts
- Supports "Keep me logged in" option
- Redirects to dashboard on successful login

### 4. User Dropdown (`src/components/header/UserDropdown.tsx`)
- Displays current user information
- Provides logout functionality
- Shows user name and email from auth context

### 5. Auth Redirect (`src/components/auth/AuthRedirect.tsx`)
- Prevents authenticated users from accessing login page
- Redirects logged-in users to dashboard

## Usage

### For Demo Purposes
- **Any email/password combination will work** for login
- The system accepts any non-empty email and password
- User name is derived from the email prefix

### Login Flow
1. User visits any admin page (`/`)
2. If not authenticated, redirected to `/signin`
3. User enters email and password
4. On successful login, redirected to dashboard
5. User session persists in localStorage

### Logout Flow
1. User clicks on their name in the header
2. Selects "Sign out" from dropdown
3. Session is cleared from localStorage
4. User is redirected to login page

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx          # Authentication state management
├── components/
│   └── auth/
│       ├── SignInForm.tsx       # Login form component
│       ├── ProtectedRoute.tsx   # Route protection wrapper
│       └── AuthRedirect.tsx     # Redirect authenticated users
├── app/
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── (admin)/
│       └── layout.tsx           # Admin layout with ProtectedRoute
└── components/header/
    └── UserDropdown.tsx         # User menu with logout
```

## Integration

The authentication system is fully integrated into the existing project:

- **Root Layout**: AuthProvider wraps the entire app
- **Admin Layout**: ProtectedRoute protects all admin pages
- **Sign In Page**: AuthRedirect prevents double-login
- **User Interface**: UserDropdown shows current user and logout option

## Customization

To integrate with a real backend:

1. Update the `login` function in `AuthContext.tsx` to make API calls
2. Replace the demo authentication logic with real validation
3. Add proper error handling for network requests
4. Implement token refresh if needed

The localStorage structure stores:
- `user`: User object with id, email, and name
- `authToken`: Authentication token
- `keepLoggedIn`: Boolean flag for session persistence
