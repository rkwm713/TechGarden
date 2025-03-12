import React, { useState, useEffect } from 'react';
import { User, Search, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Profile } from '../lib/types';

interface UserSelectProps {
  onSelect: (user: Profile) => void;
  onRemove?: (userId: string) => void;
  selectedUsers?: Profile[];
  placeholder?: string;
  className?: string;
}

export default function UserSelect({
  onSelect,
  onRemove,
  selectedUsers = [],
  placeholder = 'Search users...',
  className = ''
}: UserSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${searchTerm}%`)
          .limit(5);

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleSelect = (user: Profile) => {
    onSelect(user);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white">
        {selectedUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center bg-techserv-sky text-techserv-blue px-2 py-1 rounded"
          >
            <User className="h-4 w-4 mr-1" />
            <span>{user.username}</span>
            {onRemove && (
              <button
                onClick={() => onRemove(user.id)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <div className="flex-1 relative">
          <div className="flex items-center">
            <Search className="h-4 w-4 text-gray-400 absolute left-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={placeholder}
              className="pl-8 pr-4 py-1 w-full focus:outline-none"
            />
          </div>
        </div>
      </div>

      {showDropdown && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {loading ? (
            <div className="p-2 text-center text-gray-500">Searching...</div>
          ) : users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    onClick={() => handleSelect(user)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{user.username}</span>
                    <span className="ml-2 text-sm text-gray-500">({user.email})</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
