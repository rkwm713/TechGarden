import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../lib/types';
import { createConversation, getUsers } from '../lib/messaging';

const NewMessage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      setCreating(true);
      const conversation = await createConversation(selectedUsers);
      
      if (conversation) {
        navigate(`/messages/${conversation.id}`);
      } else {
        setError('Failed to create conversation. Please try again.');
        setCreating(false);
      }
    } catch (err) {
      setError('Failed to create conversation');
      console.error(err);
      setCreating(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-4 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-medium mb-4">New Conversation</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select recipients:
          </label>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No users found</div>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto mb-4 border border-gray-200 rounded-md divide-y">
            {filteredUsers.map(user => (
              <div 
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 flex items-center ${
                  selectedUsers.includes(user.id) ? 'bg-green-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => {}}
                  className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-500">
                    Role: {user.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/messages')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateConversation}
            disabled={selectedUsers.length === 0 || creating}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300"
          >
            {creating ? 'Creating...' : 'Start Conversation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMessage;
