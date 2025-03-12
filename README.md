# TechGarden - Community Garden Management Platform

TechGarden is a comprehensive web application for managing community garden operations, including plot assignments, events, tasks, messaging, and weather information.

![TechGarden Platform](https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80)

## 🌱 Project Overview

This application serves as a central platform for community garden members to:
- Browse and apply for garden plots
- View and register for community events
- Track and manage garden tasks
- Communicate with other gardeners
- Access real-time weather information
- Review garden rules and resources
- Manage personal profiles

## 🚀 Technology Stack & Decisions

### Frontend
- **React 18**: For building a component-based UI with efficient rendering
- **TypeScript**: Provides static typing to reduce runtime errors and improve developer experience
- **Vite**: Fast development server and optimized production builds vs. Create React App
- **React Router Dom**: Client-side routing with protected route implementation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development with custom theming
- **Lucide React**: Lightweight, customizable SVG icon library

### Backend (Serverless)
- **Supabase**: Provides PostgreSQL database, authentication, storage, and real-time capabilities
  - Chosen for its open-source nature and Firebase-like developer experience
  - Row Level Security (RLS) policies for data protection
  - Real-time subscriptions for messaging features

### State Management
- **React Context API**: For global state management (auth, weather)
  - Chosen over Redux for simplicity and reduced boilerplate in this application scope

### UI Component Organization
- **Feature-based folder structure**: Components, contexts, and hooks organized by feature
- **Consistent component patterns**: Shared UI elements and reusable patterns

## 🔧 Installation & Setup

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with the following variables:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start the development server
npm run dev

# Build for production
npm run build
```

## 📦 Project Structure

```
community-garden-website/
├── public/              # Static files
├── src/                 # Source files
│   ├── components/      # Reusable UI components
│   │   └── messaging/   # Messaging system components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and types
│   ├── pages/           # Page components (routes)
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── supabase/            # Supabase configuration and migrations
└── ...configuration files
```

## 🔄 Development Workflow

- **Development**: `npm run dev` - Starts the Vite development server
- **Build**: `npm run build` - Creates production build
- **Preview**: `npm run preview` - Preview the production build locally
- **Linting**: `npm run lint` - Run ESLint to check code quality

## 🌐 Deployment

This application is configured for deployment on Netlify with:
- Automatic builds from the main branch
- Client-side routing support via _redirects
- Environment variable configuration

## 🧩 Architecture Decisions

### Why Serverless with Supabase?
- Reduced operational overhead compared to self-hosted solutions
- Built-in authentication and permissions system
- Real-time capabilities for the messaging system
- PostgreSQL database with familiar SQL syntax and powerful features

### Component-based Architecture
- Reusable components for consistent UI/UX
- Context-based state management for auth and shared data
- Custom hooks for logic reuse across components

### Type Safety with TypeScript
- Improved developer experience with autocompletion
- Reduced runtime errors through static type checking
- Better documentation of component props and data structures

## 🔜 Future Enhancements

- Mobile application with React Native
- Plot map visualization with interactive elements
- Seed/plant exchange feature
- Integration with weather APIs for garden-specific forecasts
- Expanded analytics for garden administrators

## 📝 License

MIT
