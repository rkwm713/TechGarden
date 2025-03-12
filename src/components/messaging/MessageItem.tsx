import React from 'react';
import { Message } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser }) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  return (
    <div 
      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-green-600 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && message.sender && (
          <div className="font-semibold text-xs text-green-800 mb-1">
            {message.sender.username}
          </div>
        )}
        <div className="break-words">
          {message.content}
        </div>
        <div 
          className={`text-xs mt-1 text-right ${
            isCurrentUser ? 'text-green-200' : 'text-gray-500'
          }`}
        >
          {timeAgo}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
