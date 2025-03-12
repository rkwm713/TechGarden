# Utility Libraries

This directory contains utility functions, type definitions, and shared logic used throughout the TechGarden application. These libraries encapsulate functionality that is used across multiple components and features.

## 📚 Library Overview

### types.ts

Contains TypeScript interfaces and type definitions used throughout the application.

**Why We Created This**:
- Centralized type definitions for consistent data structures
- Enhanced type safety across the application
- Self-documenting code through descriptive interfaces
- Reduced duplication of type definitions

**Key Types**:
- Database entity interfaces (User, Plot, Event, etc.)
- Component prop interfaces
- API response types
- Shared enum definitions

**Usage Example**:
```tsx
import type { Event } from '../lib/types';

function EventList({ events }: { events: Event[] }) {
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### weather.ts

Provides utilities for fetching and processing weather data.

**Why We Created This**:
- Abstraction for weather API interactions
- Data transformation and normalization
- Centralized error handling for API requests
- Reusable weather-related utilities

**Key Features**:
- Weather data fetching function
- Type definitions for weather data
- Data transformation utilities
- Caching mechanisms

**Implementation Details**:
- Uses external weather API
- Implements error handling
- Normalizes data for consistent use in the application
- Used by the WeatherContext

**Usage Example**:
```tsx
import { getWeather } from '../lib/weather';

async function fetchWeatherData() {
  try {
    const weatherData = await getWeather();
    console.log('Current temperature:', weatherData.temperature);
    console.log('Conditions:', weatherData.conditions);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
  }
}
```

### errorHandling.ts

Provides utilities for consistent error handling throughout the application.

**Why We Created This**:
- Consistent error handling patterns
- User-friendly error messages
- Error logging and tracking
- Simplified error management

**Key Features**:
- Error formatting functions
- Error categorization
- User-friendly message generation
- Logging utilities

**Implementation Details**:
- Maps technical errors to user-friendly messages
- Categorizes errors by type (validation, network, auth, etc.)
- Integrates with error boundaries for UI error handling
- Includes debugging information when appropriate

**Usage Example**:
```tsx
import { handleApiError, formatErrorMessage } from '../lib/errorHandling';

async function fetchData() {
  try {
    const response = await api.getData();
    return response.data;
  } catch (error) {
    const formattedError = handleApiError(error);
    setErrorMessage(formatErrorMessage(formattedError));
    logError(formattedError);
    return null;
  }
}
```

### messaging.ts

Contains utilities for the messaging system.

**Why We Created This**:
- Encapsulation of messaging-related logic
- Consistent message formatting
- Reusable messaging operations
- Separation of concerns from UI components

**Key Features**:
- Message creation and formatting
- Conversation management
- Real-time message handling
- Message validation

**Implementation Details**:
- Uses Supabase for message storage and real-time updates
- Implements message formatting and validation
- Provides conversation management utilities
- Handles message status updates

**Usage Example**:
```tsx
import { sendMessage, getConversations } from '../lib/messaging';

async function handleSendMessage(conversationId, content) {
  try {
    await sendMessage({
      conversationId,
      content,
      attachments: []
    });
    // Message sent successfully
  } catch (error) {
    // Handle error
  }
}

async function loadUserConversations(userId) {
  const conversations = await getConversations(userId);
  return conversations;
}
```

## 🧩 Library Design Patterns

### Pure Functions

Where possible, utilities are implemented as pure functions:
- Predictable return values based only on inputs
- No side effects
- Easier testing and debugging
- Better performance optimization

### Type Safety

Strong typing is used throughout:
- Explicit interfaces for all data structures
- Function parameter and return type annotations
- Generic types where appropriate
- Union types for handling different cases

### Error Handling Strategy

Consistent error handling approach:
1. Try/catch blocks around external operations
2. Specific error types for different error categories
3. Transformation of technical errors to user-friendly messages
4. Consistent error object structure

### Modularity

Libraries are designed for modularity:
- Single responsibility for each utility
- Clear dependencies
- Minimal coupling between utilities
- Easy to maintain and extend

## 🔌 External Dependencies

The libraries minimize external dependencies:
- Only necessary dependencies are used
- Dependencies are abstracted to allow for future changes
- Consistent patterns for async operations

## 🧪 Testing Strategy

Utilities are designed to be testable:
- Pure functions where possible
- Clear inputs and outputs
- Minimal side effects
- Mockable external dependencies
