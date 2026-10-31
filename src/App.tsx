import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { RequireRole } from '@/components/auth/RequireRole';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentNotebooks from '@/pages/student/StudentNotebooks';
import NotebookEditor from '@/pages/student/NotebookEditor';
import StudentAssignments from '@/pages/student/StudentAssignments';
import StudentDoubts from '@/pages/student/StudentDoubts';
import StudentAnnouncements from '@/pages/student/StudentAnnouncements';
import StudentPlanner from '@/pages/student/StudentPlanner';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import TeacherClasses from '@/pages/teacher/TeacherClasses';
import TeacherAssignments from '@/pages/teacher/TeacherAssignments';
import TeacherExams from '@/pages/teacher/TeacherExams';
import TeacherDoubts from '@/pages/teacher/TeacherDoubts';
import TeacherAnnouncements from '@/pages/teacher/TeacherAnnouncements';

function HomeOrDashboard() {
  const { session, profile, loading } = useAuth();
  if (loading) return <LandingPage />;
  if (!session) return <LandingPage />;
  if (!profile) return <Navigate to="/auth" replace />;
  return <Navigate to={profile.role === 'teacher' ? '/teacher' : '/student'} replace />;
}

function AuthOrRedirect() {
  const { session, profile, loading } = useAuth();
  if (loading) return <AuthPage />;
  if (!session) return <AuthPage />;
  if (!profile) return <AuthPage />;
  return <Navigate to={profile.role === 'teacher' ? '/teacher' : '/student'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeOrDashboard />} />
            <Route path="/auth" element={<AuthOrRedirect />} />
            <Route path="/student" element={<RequireRole role="student"><StudentDashboard /></RequireRole>} />
            <Route path="/student/notebooks" element={<RequireRole role="student"><StudentNotebooks /></RequireRole>} />
            <Route path="/student/notebooks/:id" element={<RequireRole role="student"><NotebookEditor /></RequireRole>} />
            <Route path="/student/assignments" element={<RequireRole role="student"><StudentAssignments /></RequireRole>} />
            <Route path="/student/doubts" element={<RequireRole role="student"><StudentDoubts /></RequireRole>} />
            <Route path="/student/announcements" element={<RequireRole role="student"><StudentAnnouncements /></RequireRole>} />
            <Route path="/student/planner" element={<RequireRole role="student"><StudentPlanner /></RequireRole>} />
            <Route path="/teacher" element={<RequireRole role="teacher"><TeacherDashboard /></RequireRole>} />
            <Route path="/teacher/classes" element={<RequireRole role="teacher"><TeacherClasses /></RequireRole>} />
            <Route path="/teacher/assignments" element={<RequireRole role="teacher"><TeacherAssignments /></RequireRole>} />
            <Route path="/teacher/exams" element={<RequireRole role="teacher"><TeacherExams /></RequireRole>} />
            <Route path="/teacher/doubts" element={<RequireRole role="teacher"><TeacherDoubts /></RequireRole>} />
            <Route path="/teacher/announcements" element={<RequireRole role="teacher"><TeacherAnnouncements /></RequireRole>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
