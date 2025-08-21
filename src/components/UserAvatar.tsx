'use client';

import { useState, useRef, useEffect } from 'react';
import { getCurrentUser, clearCurrentUser, type UserInfo } from '@/lib/user';
import Link from 'next/link';

export default function UserAvatar() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoaded(true);

    const handleUserUpdate = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render anything until client-side check is complete
  if (!isLoaded) {
    return null;
  }

  if (!currentUser) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    clearCurrentUser();
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-8 h-8 rounded-full border border-blue-400 text-blue-600 text-sm font-medium flex items-center justify-center hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title={`${currentUser.name} (${currentUser.email})`}
      >
        {getInitials(currentUser.name)}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </div>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            Profile Settings
          </Link>

          <Link
            href="/memories?filter=my"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            My Memories
          </Link>

          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
