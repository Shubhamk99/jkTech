// Common constants for the application
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

export const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
