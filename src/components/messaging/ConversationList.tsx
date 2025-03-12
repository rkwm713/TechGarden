import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Conversation, Profile } from '../../lib/types';
import { getConversations } from '../../lib/messaging';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  currentUserId: string;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  currentUserId,
  selectedConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const fetchedConversations = await getConversations();
        setConversations(fetchedConversations);
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Get the other participants in the conversation
  const getOtherParticipants = (conversation: Conversation): Profile[] => {
    return (conversation.participants || []).filter(
      participant => participant.id !== currentUserId
    );
  };

  // Format the participants' names for display
  const formatParticipantNames = (participants: Profile[]): string => {
    if (participants.length === 0) return 'No participants';
    return participants.map(p => p.username).join(', ');
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Loading conversations...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <p className="text-gray-500 mb-4">No conversations yet</p>
        <Link
          to="/messages/new"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Start a Conversation
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      <div className="p-4 flex justify-between items-center bg-gray-50 sticky top-0">
        <h2 className="text-lg font-medium">Conversations</h2>
        <Link
          to="/messages/new"
          className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          New
        </Link>
      </div>
      
      <div className="overflow-y-auto">
        {conversations.map(conversation => {
          const otherParticipants = getOtherParticipants(conversation);
          const isSelected = selectedConversationId === conversation.id;
          const lastMessage = conversation.last_message;
          
          return (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className={`block p-4 hover:bg-gray-50 ${
                isSelected ? 'bg-green-50 border-l-4 border-green-600' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-green-900">
                  {formatParticipantNames(otherParticipants)}
                </h3>
                {lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              {lastMessage ? (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                  {lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-1 italic">No messages yet</p>
              )}
              
              {lastMessage && !lastMessage.read && lastMessage.sender_id !== currentUserId && (
                <div className="mt-2 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                  <span className="text-xs font-medium text-green-600">New message</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
