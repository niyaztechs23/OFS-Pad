import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';

export function RequireRole({ role, children }: { role: 'student' | 'teacher'; children: ReactNode }) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper dark:bg-ink-900">
        <p className="text-sm text-ink-300 dark:text-ink-200">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Profile may still be loading right after signup; only enforce role when we know it
  if (profile && profile.role !== role) {
    return <Navigate to={profile.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return <>{children}</>;
}
