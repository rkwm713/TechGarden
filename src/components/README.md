# UI Components

This directory contains reusable UI components used throughout the TechGarden application. These components are designed to be modular, reusable, and follow consistent design patterns.

## 🧩 Component Architecture

Our component architecture follows these principles:

1. **Reusability**: Components are designed to be reused across different parts of the application
2. **Single Responsibility**: Each component has a clearly defined purpose
3. **Composability**: Smaller components can be combined to create more complex UIs
4. **Prop Typing**: All components use TypeScript interfaces to define their props
5. **Consistent Styling**: Tailwind CSS for styling with consistent design tokens

## 📋 Component Overview

### Core UI Components

- **Navbar.tsx**: Main navigation component displayed across protected routes
- **ErrorBoundary.tsx**: React error boundary for graceful error handling
- **TaskCard.tsx**: Reusable card component for displaying task information
- **UserSelect.tsx**: Component for selecting users from a dropdown
- **WeatherWidget.tsx**: Real-time weather information display

### Component Patterns

#### Controlled vs. Uncontrolled Components

We use a mix of controlled and uncontrolled components depending on the use case:
- **Controlled Components**: Form inputs where React controls the state
- **Uncontrolled Components**: When DOM elements manage their own state (with refs)

#### Component Composition Example

```tsx
// Parent component composition example
<Card>
  <Card.Header>
    <Card.Title>Task Name</Card.Title>
  </Card.Header>
  <Card.Body>
    <TaskDetails task={task} />
  </Card.Body>
  <Card.Footer>
    <Button onClick={handleAction}>Complete</Button>
  </Card.Footer>
</Card>
```

#### State Management Patterns

- **Local State**: For component-specific state using `useState`
- **Lifted State**: When state needs to be shared with sibling components
- **Context**: For state that needs to be accessed by many components

## 🎨 Styling Approach

1. **Tailwind Utility Classes**: Primary styling method
   ```tsx
   <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
   ```

2. **Custom Class Extensions**: Extended Tailwind classes for specific design elements
   ```css
   /* In index.css */
   .btn-primary {
     @apply px-4 py-2 bg-techserv-blue text-white rounded-md;
   }
   ```

3. **Component-Specific Custom Styles**: When needed for complex styling

## 🔍 Error Handling

The `ErrorBoundary` component captures errors in the component tree to prevent the entire application from crashing:

```tsx
<ErrorBoundary fallback={<ErrorComponent />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

## 🧪 Component Testing Strategy

Components are designed to be testable with:
- Clear props interfaces
- Separation of concerns
- Minimal side effects
- Predictable rendering

## 📊 Performance Considerations

- Use `React.memo()` for expensive components
- Optimize re-renders by keeping component state minimal
- Lazy-load components when applicable
- Use key props correctly in lists

## 🔌 Third-Party Component Integration

When integrating third-party components:
1. Create wrapper components to maintain consistent API
2. Handle loading and error states consistently
3. Apply consistent styling to match the application theme

## 📑 Component Documentation

Each component should include a comment header with:
- Brief description of the component
- Props interface
- Example usage
- Any important notes or caveats
