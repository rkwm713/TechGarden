# Page Components

This directory contains page-level components that correspond to routes in the TechGarden application. Each page component represents a distinct view or screen that users can navigate to.

## 🌐 Routing Architecture

The application uses React Router for client-side routing:
- Routes are defined in `App.tsx`
- Most routes require authentication through the `PrivateRoute` component
- Public routes include login and signup pages
- URL parameters are used for dynamic routes (e.g., profile/:username)

## 📋 Page Overview

### Home.tsx

The landing page and dashboard for logged-in users.

**Key Features**:
- Community statistics display
- Upcoming events preview
- Weather widget integration
- Hero section with garden imagery

**Implementation Details**:
- Fetches community statistics from Supabase
- Displays upcoming events with pagination
- Integrates the WeatherWidget component
- Responsive design for different devices

### GardenPlots.tsx

Page for viewing and managing garden plots.

**Key Features**:
- Plot browsing and filtering
- Plot application
- Plot management for administrators
- Plot status visualization

**Implementation Details**:
- Interactive plot visualization
- Real-time plot status updates
- Plot assignment workflow
- Filtering and sorting functionality

### Events.tsx

Page for viewing and managing community events.

**Key Features**:
- Event calendar view
- Event details
- Event registration
- Event creation for administrators

**Implementation Details**:
- Date-based filtering
- Attendance tracking
- Category-based organization
- Event reminders

### Resources.tsx

Page for accessing garden resources and educational materials.

**Key Features**:
- Resource categories
- Downloadable materials
- External links
- Seasonal gardening tips

**Implementation Details**:
- Resource filtering by category
- Search functionality
- Responsive grid layout
- Content management for administrators

### Rules.tsx

Page displaying community garden rules and guidelines.

**Key Features**:
- Rule categories
- Policy information
- Guidelines visualization
- Printable version

**Implementation Details**:
- Organized sections with expandable details
- Search functionality
- Last updated indicators
- Admin editing capabilities

### Login.tsx & SignUp.tsx

Authentication pages for user login and registration.

**Key Features**:
- User authentication forms
- Form validation
- Error messaging
- Social authentication options

**Implementation Details**:
- Uses useFormValidation hook
- Integrates with Supabase Auth
- Implements password recovery
- Redirects authenticated users

### Profile.tsx & PublicProfile.tsx

Pages for viewing and editing user profiles.

**Key Features**:
- Profile information display
- Profile editing
- Garden plot information
- Activity history

**Implementation Details**:
- Profile photo management
- Form validation for profile updates
- Different views for own profile vs. others' profiles
- Privacy controls

### Tasks.tsx

Page for managing garden tasks and volunteering.

**Key Features**:
- Task listing and filtering
- Task assignment
- Task completion tracking
- Task creation for administrators

**Implementation Details**:
- Drag and drop interface with @dnd-kit
- Calendar integration
- Priority visualization
- Task categories and filtering

### Messages.tsx & NewMessage.tsx

Pages for the messaging system.

**Key Features**:
- Conversation list
- Message thread display
- New message composition
- Real-time updates

**Implementation Details**:
- Real-time message updates with Supabase
- Conversation management
- Unread message indicators
- User selection for new messages

## 🔄 Data Flow Patterns

Pages follow consistent data flow patterns:

1. **Data Fetching**:
   ```
   Component mounts → useEffect hook → Loading state → Fetch data → Update state → Render data
   ```

2. **Form Handling**:
   ```
   Form input → Validation → Submit → Loading state → API call → Success/Error handling → UI update
   ```

3. **Real-time Updates**:
   ```
   Component mounts → Subscribe to Supabase channel → Listen for changes → Update UI on events
   ```

## 🧩 Page Component Design

Pages are structured consistently:

```tsx
// Page component structure
function PageName() {
  // 1. State declarations
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Hooks and context usage
  const { user } = useAuth();
  
  // 3. Side effects (data fetching, subscriptions)
  useEffect(() => {
    fetchData();
  }, [dependencies]);
  
  // 4. Event handlers and helper functions
  const handleAction = () => {
    // Implementation
  };
  
  // 5. Loading state rendering
  if (loading) return <LoadingComponent />;
  
  // 6. Main render
  return (
    <div className="page-container">
      <h1>Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

## 🔍 Error Handling

Pages implement consistent error handling:
- Graceful handling of API errors
- User-friendly error messages
- Loading states during data fetching
- Fallback UI for missing data

## 📱 Responsive Design

All pages are designed to be responsive:
- Mobile-first approach
- Tailwind breakpoints for different screen sizes
- Adaptive layouts and components
- Touch-friendly interactions for mobile users

## 🔐 Authentication and Authorization

Pages respect authentication and authorization:
- Protected routes require authentication
- UI elements adapt based on user permissions
- Admin-only features are properly gated
- Secure data access patterns
