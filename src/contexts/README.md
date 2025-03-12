# Context API Providers

This directory contains React Context providers that manage global state in the TechGarden application. Context API was chosen over other state management solutions for its simplicity, tight integration with React, and suitability for this application's needs.

## 🌐 Context Overview

### AuthContext.tsx

Manages user authentication state and provides auth-related functionality.

**Why Context for Auth?**
- Authentication state needs to be accessed by many components
- Auth state changes affect routing and permissions
- Centralizes authentication logic and session management

**Key Features**:
- User authentication state
- Login/logout functionality
- Protected route implementation
- Session persistence
- Loading states for auth operations

**Implementation Details**:
- Uses Supabase Auth for authentication
- Subscribes to auth state changes
- Provides a protected route component
- Handles redirects for unauthenticated users

**Usage Example**:
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### WeatherContext.tsx

Provides real-time weather data to components throughout the application.

**Why Context for Weather?**
- Weather data is used across multiple components
- Centralized fetching avoids redundant API calls
- Shared loading and error states

**Key Features**:
- Current weather conditions
- Loading and error states
- Refresh mechanism
- Automatic periodic updates

**Implementation Details**:
- Fetches weather data from external API via lib/weather.ts
- Implements auto-refresh every 30 minutes
- Provides a manual refresh function
- Handles loading and error states

**Usage Example**:
```tsx
import { useWeather } from '../contexts/WeatherContext';

function MyComponent() {
  const { weather, loading, error, refreshWeather } = useWeather();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div>
      <p>Temperature: {weather?.temperature}°C</p>
      <p>Conditions: {weather?.conditions}</p>
      <button onClick={refreshWeather}>Refresh</button>
    </div>
  );
}
```

## 🏗️ Context Design Patterns

### Provider Pattern

All contexts follow the Provider pattern:
1. Create a context with default values
2. Create a provider component that manages state
3. Use the provider to wrap parts of the component tree
4. Create a custom hook for consuming the context

### Context Composition

The application uses context composition in main.tsx:

```tsx
// Context nesting pattern
<AuthProvider>
  <WeatherProvider>
    <App />
  </WeatherProvider>
</AuthProvider>
```

This allows:
- Clear hierarchy of dependencies
- Logical organization of global state
- Contexts that depend on other contexts

## 🔄 State Updates

Contexts utilize different patterns for state updates:

1. **Direct State Updates**: Using React's `useState` setter
2. **Reducer Pattern**: For more complex state logic (potential future enhancement)
3. **Event-Based Updates**: Subscribing to external events (Supabase auth changes)

## 🔍 Error Handling

Error handling strategies implemented in contexts:
- Error state management
- Graceful degradation
- Retry mechanisms where appropriate
- User feedback for critical errors

## 🚦 Context Performance

To optimize context performance:
- Minimize context value changes
- Memoize context values with `useMemo`
- Split contexts by domain to avoid unnecessary renders
- Avoid deeply nested providers when possible

## 🧩 Extending the Context System

When adding new contexts:
1. Create a new context file following the established pattern
2. Define a clear interface for the context value
3. Implement the provider component
4. Create a custom hook for consuming the context
5. Add the provider to the appropriate level in the component tree
