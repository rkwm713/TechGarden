import React, { useState } from 'react';

interface NewMessageFormProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const NewMessageForm: React.FC<NewMessageFormProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    onSend(trimmedMessage);
    setMessage('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center border-t border-gray-200 p-3 bg-white"
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="ml-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300"
      >
        Send
      </button>
    </form>
  );
};

export default NewMessageForm;
