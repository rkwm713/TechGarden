# Custom React Hooks

This directory contains custom React hooks that encapsulate reusable logic in the TechGarden application. These hooks follow React's composition pattern and allow for better separation of concerns.

## 🪝 What are Custom Hooks?

Custom hooks are JavaScript functions that:
- Start with the word "use" (e.g., `useFormValidation`)
- Can call other hooks
- Extract and reuse stateful logic between components
- Cannot be called conditionally (must follow React's Rules of Hooks)

## 📋 Hooks Overview

### useFormValidation.tsx

A custom hook that provides form validation logic for the application's forms.

**Why We Created This Hook**:
- Consistent validation across multiple forms
- Reduced duplication of validation logic
- Centralized error handling for form inputs
- Improved maintainability

**Key Features**:
- Field validation with customizable rules
- Error message management
- Form submission state tracking
- Touched fields tracking

**Implementation Details**:
- Uses React's useState for managing validation state
- Implements common validation patterns (required, email, length, etc.)
- Supports custom validation functions
- Optimized to minimize re-renders

**Usage Example**:
```tsx
import { useFormValidation } from '../hooks/useFormValidation';

function SignupForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useFormValidation({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      return errors;
    },
    onSubmit: async (values) => {
      // Submit logic
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.email && errors.email && <div className="error">{errors.email}</div>}
      
      <input
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.password && errors.password && <div className="error">{errors.password}</div>}
      
      <button type="submit" disabled={isSubmitting}>
        Sign Up
      </button>
    </form>
  );
}
```

## 🧩 Hook Design Patterns

### State Encapsulation Pattern

Hooks encapsulate and manage their own state, exposing only what components need:

```tsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}
```

### Side Effect Management

Hooks use `useEffect` to manage side effects:

```tsx
function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
```

### Composition Pattern

Hooks can compose other hooks for more complex behavior:

```tsx
function useEnhancedState(initialValue) {
  const [state, setState] = useState(initialValue);
  const previousState = usePrevious(state);
  
  return { state, setState, previousState };
}
```

## 🔍 Error Handling in Hooks

Our hooks implement consistent error handling:
- Clear error messages
- Graceful fallbacks
- Debug information when appropriate
- Consistent error structures

## 📊 Performance Considerations

To optimize hook performance:
- Memoize expensive calculations with `useMemo`
- Memoize callback functions with `useCallback`
- Use dependency arrays effectively
- Avoid unnecessary state updates

## 🧪 Testing Hooks

Hooks are designed to be testable:
- Pure functions where possible
- Minimal side effects
- Predictable behavior
- Clear dependencies

## 🚀 Creating New Hooks

When creating new hooks:
1. Start the function name with "use"
2. Focus on a single responsibility
3. Document the hook's purpose and usage
4. Consider composability with other hooks
5. Follow React's Rules of Hooks
6. Add appropriate TypeScript typing
