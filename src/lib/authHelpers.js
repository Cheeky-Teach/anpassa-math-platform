// src/lib/authHelpers.js
/**
 * Verifies if the profile or user object represents an authorized teacher/admin.
 */
export function isTeacherUser(profile, user = null) {
    if (!profile && !user) return false;

    // 1. Check profile record (custom app profiles table)
    const role = profile?.role || profile?.user_role || user?.user_metadata?.role;
    
    // Explicit positive check for teacher/admin roles
    if (['teacher', 'super_admin'].includes(String(role).toLowerCase())) {
        return true;
    }

    // 2. If you distinguish students by an explicit flag:
    if (profile?.is_student === true || user?.user_metadata?.is_student === true) {
        return false;
    }

    // 3. Fallback: anonymous users or profiles without teacher metadata cannot host
    return false;
}