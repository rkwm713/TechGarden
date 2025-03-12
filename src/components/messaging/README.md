# Messaging System Components

This directory contains components for the TechGarden's real-time messaging system. These components work together to provide a comprehensive messaging experience for garden members.

## 📬 Messaging Architecture

The messaging system is built on Supabase's real-time capabilities and follows a conversation-based model:

1. **Database Structure**:
   - `conversations` table: Stores metadata about conversations
   - `messages` table: Stores individual messages
   - `conversation_participants` table: Maps users to conversations they're part of

2. **Real-time Updates**:
   - Supabase real-time subscriptions for immediate message delivery
   - Optimistic UI updates for better UX

3. **Components Hierarchy**:
   ```
   Pages/Messages
   ├── ConversationList
   │   └── (conversation items)
   └── MessageThread
       ├── MessageItem(s)
       └── NewMessageForm
   ```

## 🧩 Component Overview

### ConversationList.tsx

A component that displays a list of the user's conversations.

**Key Features**:
- Fetches and displays all conversations the current user participates in
- Shows conversation metadata (participants, last message, timestamp)
- Handles active conversation selection
- Updates in real-time when new messages arrive

**Implementation Details**:
- Uses Supabase subscriptions for real-time updates
- Optimizes rendering with React.memo and proper key usage
- Implements unread message indicators

### MessageThread.tsx

Displays the messages in a selected conversation.

**Key Features**:
- Shows chronological message history for a conversation
- Auto-scrolls to most recent messages
- Groups messages by sender and time for better readability
- Shows typing indicators

**Implementation Details**:
- Uses a virtualized list for performance with many messages
- Handles loading states and pagination
- Updates in real-time as new messages arrive

### MessageItem.tsx

Renders an individual message in the thread.

**Key Features**:
- Displays message content, sender info, and timestamp
- Handles different message types (text, attachments)
- Shows delivery/read status

**Implementation Details**:
- Optimized rendering with React.memo
- Responsive design for different screen sizes
- Accessibility considerations for screen readers

### NewMessageForm.tsx

Form component for composing and sending new messages.

**Key Features**:
- Text input with auto-resize
- Message sending functionality
- Typing indicator implementation
- Input validation

**Implementation Details**:
- Debounced typing notifications
- Form validation using useFormValidation hook
- Optimistic UI updates for sent messages

## 🔄 Data Flow

1. **Fetching Messages**:
   ```
   User selects conversation → MessageThread fetches messages → Messages rendered in UI
   ```

2. **Sending Messages**:
   ```
   User types message → NewMessageForm validates → Send to Supabase → Optimistic UI update → Real-time update to all participants
   ```

3. **Real-time Updates**:
   ```
   New message arrives → Supabase real-time event → Update UI with new message → Update conversation list with latest message
   ```

## 🧪 Error Handling

- Form validation for empty messages
- Error states for failed message sends
- Retry mechanisms for failed operations
- Graceful degradation when real-time is unavailable

## 📊 Performance Considerations

- Pagination for message history
- Virtualized list for efficient rendering of large message threads
- Memoization to prevent unnecessary re-renders
- Optimistic UI updates for better perceived performance

## 🔒 Security Implementation

- Row Level Security (RLS) policies ensure users can only access conversations they're part of
- Input sanitization to prevent XSS attacks
- Rate limiting for message sending

## 🚀 Future Enhancements

- File attachments
- Message reactions
- Group conversations with admin controls
- Message search functionality
- Message deletion and editing
