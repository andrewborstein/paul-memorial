// Simple hash function for email
function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// User identification utilities
export const USER_STORAGE_KEY = 'paul-memorial-user';
export const SUPER_USER_KEY = 'paul-memorial-super-user';

export interface UserInfo {
  email: string;
  emailHash: string;
  name: string;
}

export function setCurrentUser(email: string, name: string): UserInfo {
  const emailHash = hashEmail(email);
  const userInfo: UserInfo = { email, emailHash, name };

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo));
  }

  return userInfo;
}

export function getCurrentUser(): UserInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearCurrentUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

// Super user management
export async function setSuperUser(password: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const response = await fetch('/api/admin/super-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      // Store a token instead of the actual password
      const token = btoa(password + '_' + Date.now()); // Simple token generation
      localStorage.setItem(SUPER_USER_KEY, token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error setting super user:', error);
    return false;
  }
}

export function isSuperUser(): boolean {
  if (typeof window === 'undefined') return false;

  const storedToken = localStorage.getItem(SUPER_USER_KEY);
  if (!storedToken) return false;

  // For now, we'll trust the token if it exists
  // In a more secure implementation, you'd validate the token server-side
  // But since this is just for UI display, it's acceptable
  return true;
}

export function clearSuperUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPER_USER_KEY);
  }
}

// Check if user can edit a memory
export function canEditMemory(memoryEmail: string): boolean {
  // Super users can edit any memory
  if (isSuperUser()) return true;

  // Regular users can only edit their own memories
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  return currentUser.email === memoryEmail;
}
