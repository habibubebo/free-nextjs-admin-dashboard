import { InstructorSession } from "@/app/actions/authActions";

export type UserRole = 'superadmin' | 'instructor';

/**
 * Check if user has superadmin role
 */
export function isSuperAdmin(session: InstructorSession | null): boolean {
  return session?.role === 'superadmin';
}

/**
 * Check if user is instructor
 */
export function isInstructor(session: InstructorSession | null): boolean {
  return session?.role === 'instructor';
}

/**
 * Check if user has required role
 */
export function hasRole(session: InstructorSession | null, requiredRole: UserRole): boolean {
  if (!session) return false;
  
  // Superadmin has access to everything
  if (session.role === 'superadmin') return true;
  
  // Check if user has the required role
  return session.role === requiredRole;
}

/**
 * Get accessible pages based on role
 */
export function getAccessiblePages(role: UserRole): string[] {
  const commonPages = [
    '/instructor-dashboard',
  ];

  if (role === 'superadmin') {
    // Superadmin can access everything
    return [
      ...commonPages,
      '/', // Dashboard
      '/calendar',
      '/profile',
      '/institution-profile',
      '/instructors',
      '/students',
      '/attendance',
      '/attendance-report',
      '/classes',
      '/course-units',
      '/graduates',
      '/rombel',
      '/sapras',
      '/unit-kompetensi',
      '/alerts',
      '/avatars',
      '/badge',
      '/buttons',
      '/images',
      '/videos',
      '/line-chart',
      '/bar-chart',
      '/form-elements',
      '/basic-tables',
      '/modals',
      '/blank',
      '/error-404',
      '/register',
    ];
  }

  if (role === 'instructor') {
    return [
      ...commonPages,
      '/', // Dashboard
      '/attendance', // Only attendance
    ];
  }

  return commonPages;
}

/**
 * Check if page is accessible for role
 */
export function isPageAccessible(role: UserRole, page: string): boolean {
  const accessiblePages = getAccessiblePages(role);
  return accessiblePages.some(p => page.startsWith(p));
}
