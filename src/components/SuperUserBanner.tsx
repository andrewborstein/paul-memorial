'use client';

import { useEffect, useState } from 'react';
import { isSuperUser, clearSuperUser } from '@/lib/user';

export default function SuperUserBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(isSuperUser());
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-green-600 text-white text-center py-2 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
        <span className="text-sm font-medium">
          🛡️ Super User Mode Active
        </span>
        <span className="text-xs opacity-90">
          You can edit and delete any memory
        </span>
        <button
          onClick={() => {
            clearSuperUser();
            window.location.reload();
          }}
          className="text-xs bg-green-700 hover:bg-green-800 px-2 py-1 rounded"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
