import { UserProfile } from '../types';

const AUTH_STORAGE_KEYS = {
  USER_PROFILE: 'gpt_user_profile_v1',
  GOOGLE_CLIENT_ID: 'gpt_google_client_id_v1',
};

// Safe Base64URL decoder for JWT payloads
export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google JWT token', err);
    return null;
  }
}

// Convert Google Decoded JWT Payload to UserProfile
export function createProfileFromGoogleJwt(jwtPayload: Record<string, unknown>): UserProfile {
  return {
    id: (jwtPayload.sub as string) || `google-${Date.now()}`,
    name: (jwtPayload.name as string) || 'Google User',
    email: (jwtPayload.email as string) || '',
    picture: (jwtPayload.picture as string) || undefined,
    givenName: (jwtPayload.given_name as string) || undefined,
    familyName: (jwtPayload.family_name as string) || undefined,
    provider: 'google',
    signedInAt: new Date().toISOString(),
  };
}

// Load signed-in user profile from localStorage
export function loadUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEYS.USER_PROFILE);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Save user profile to localStorage
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile', err);
  }
}

// Clear signed-in user profile (Sign out)
export function clearUserProfile(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER_PROFILE);
  } catch (err) {
    console.error('Failed to clear user profile', err);
  }
}

// Load Google Client ID from environment or user-configured localStorage
export function getGoogleClientId(): string {
  try {
    // 1. Check user-configured override in localStorage
    const savedId = localStorage.getItem(AUTH_STORAGE_KEYS.GOOGLE_CLIENT_ID);
    if (savedId && savedId.trim()) {
      return savedId.trim();
    }
    // 2. Check Vite environment variable
    const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envId && typeof envId === 'string' && envId.trim()) {
      return envId.trim();
    }
    return '';
  } catch {
    return '';
  }
}

// Save Google Client ID override to localStorage
export function saveGoogleClientId(clientId: string): void {
  try {
    if (clientId.trim()) {
      localStorage.setItem(AUTH_STORAGE_KEYS.GOOGLE_CLIENT_ID, clientId.trim());
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.GOOGLE_CLIENT_ID);
    }
  } catch (err) {
    console.error('Failed to save Google Client ID', err);
  }
}

// Create a quick mock/demo Google profile for testing without cloud credentials
export function createDemoUserProfile(email = 'shaiyamjain7987@gmail.com', name = 'Shaiyam Jain'): UserProfile {
  return {
    id: `demo-${Date.now()}`,
    name,
    email,
    picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    givenName: name.split(' ')[0] || 'User',
    familyName: name.split(' ').slice(1).join(' ') || '',
    provider: 'demo',
    signedInAt: new Date().toISOString(),
  };
}
