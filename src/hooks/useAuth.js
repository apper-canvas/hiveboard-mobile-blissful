import { useContext } from 'react';
import { AuthContext } from '@/layouts/Root';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within the authentication context');
  }
  return context;
}