import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';

const Messages: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setCurrentUserId(data.user.id);
        } else {
          // If not authenticated, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [navigate]);

  if (loading || !currentUserId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-4 p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[80vh]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          <div className="md:col-span-1 border-r border-gray-200 h-full overflow-y-auto">
            <ConversationList 
              currentUserId={currentUserId} 
              selectedConversationId={conversationId}
            />
          </div>
          
          <div className="md:col-span-2 flex flex-col h-full">
            {conversationId ? (
              <MessageThread 
                conversationId={conversationId} 
                currentUserId={currentUserId}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="mb-4">Select a conversation or start a new one</p>
                  <button
                    onClick={() => navigate('/messages/new')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
