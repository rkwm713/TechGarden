import React, { useEffect, useRef, useState } from 'react';
import { Message as MessageType } from '../../lib/types';
import MessageItem from './MessageItem';
import NewMessageForm from './NewMessageForm';
import { getMessages, sendMessage, subscribeToMessages, markMessagesAsRead } from '../../lib/messaging';

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({ conversationId, currentUserId }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await getMessages(conversationId);
        setMessages(fetchedMessages);
        
        // Mark unread messages as read
        const unreadMessageIds = fetchedMessages
          .filter(msg => !msg.read && msg.sender_id !== currentUserId)
          .map(msg => msg.id);
          
        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead(unreadMessageIds);
        }
      } catch (err) {
        setError('Failed to load messages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [conversationId, currentUserId]);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Mark message as read if it's not from current user
      if (newMessage.sender_id !== currentUserId) {
        markMessagesAsRead([newMessage.id]).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    try {
      setSending(true);
      await sendMessage(conversationId, content);
      // The new message will be added via the subscription
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <NewMessageForm onSend={handleSendMessage} disabled={sending} />
    </div>
  );
};

export default MessageThread;
