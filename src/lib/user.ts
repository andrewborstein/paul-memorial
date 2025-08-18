// Simple hash function for email
function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
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
export function setSuperUser(password: string): boolean {
  if (typeof window === 'undefined') return false;
  
  // Simple password check - you can make this more secure
  const validPasswords = process.env.NEXT_PUBLIC_SUPER_USER_PASSWORDS?.split(',') || [];
  
  if (validPasswords.includes(password)) {
    localStorage.setItem(SUPER_USER_KEY, password);
    return true;
  }
  
  return false;
}

export function isSuperUser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedPassword = localStorage.getItem(SUPER_USER_KEY);
  if (!storedPassword) return false;
  
  const validPasswords = process.env.NEXT_PUBLIC_SUPER_USER_PASSWORDS?.split(',') || [];
  return validPasswords.includes(storedPassword);
}

export function clearSuperUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPER_USER_KEY);
  }
}

// Check if user can edit a memory
export function canEditMemory(memoryEmail: string): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  return isSuperUser() || currentUser.email === memoryEmail;
}
