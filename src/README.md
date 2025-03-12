# Source Code Documentation

This directory contains the source code for the TechGarden application. The codebase is organized using a feature-based structure to maintain scalability and improve developer experience.

## 📂 Directory Structure

```
src/
├── components/      # Reusable UI components
│   └── messaging/   # Messaging-specific components 
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and type definitions
├── pages/           # Page components (routes)
├── App.tsx          # Main application component and routing
├── index.css        # Global styles
├── main.tsx         # Application entry point
├── supabaseClient.ts # Supabase client configuration
└── vite-env.d.ts    # Vite environment type definitions
```

## 🏗️ Architecture Overview

The TechGarden application follows a component-based architecture with the following key patterns:

### Entry Points

- **main.tsx**: The application entry point that renders the root `App` component inside React's StrictMode and wraps it with necessary providers
- **App.tsx**: Defines the application's routing structure using React Router and applies the layout with navigation

### Component Organization

- **Page Components**: Each route has a corresponding page component in the `pages/` directory
- **Shared UI Components**: Reusable UI elements are stored in the `components/` directory
- **Feature-Specific Components**: Components specific to a feature (like messaging) are grouped in subdirectories

### State Management

We follow a Context-based state management approach for global application state:

- **AuthContext**: Manages user authentication state using Supabase Auth
- **WeatherContext**: Provides weather data to components that need it

### Data Flow

1. Data fetching primarily happens in page components or contexts
2. Data is passed down to child components via props
3. Context is used for cross-cutting concerns (auth, theme, etc.)
4. Custom hooks abstract complex logic and state management

### Styling Approach

- Tailwind CSS utility classes for component styling
- Custom color theme defined in `tailwind.config.js`
- Global styles in `index.css`

## 🔄 Data Fetching Pattern

The application uses a consistent pattern for data fetching:

1. Initialize state variables and loading state
2. Use `useEffect` hook to trigger data fetching on component mount
3. Handle loading and error states in the UI
4. Update state when data is received

Example:
```tsx
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [dependencies]);
```

## 🔐 Authentication Flow

1. `AuthContext` initializes by checking for an existing session
2. Login/Signup pages use Supabase authentication
3. `PrivateRoute` component protects routes that require authentication
4. User session is maintained via Supabase's session management

## 🧩 Component Design Philosophy

- **Single Responsibility**: Each component has a clearly defined purpose
- **Composition Over Inheritance**: Use component composition for code reuse
- **Lifting State Up**: Keep state at the appropriate level in the component tree
- **Error Boundaries**: Capture and handle errors gracefully

## 🔌 External Integrations

- **Supabase**: Backend as a service for authentication, database, and real-time features
- **Weather API**: External weather data integration for the weather widget

## 🚦 Code Quality Practices

- TypeScript for type safety
- ESLint for code quality enforcement
- Consistent naming conventions
- Component documentation
