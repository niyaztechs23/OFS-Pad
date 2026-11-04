import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { type Role } from '@/lib/supabase';

function homeForRole(role: Role) {
  return role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/student';
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
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

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  if (profile.role !== role) {
    return <Navigate to={homeForRole(profile.role)} replace />;
  }

  return <>{children}</>;
}
