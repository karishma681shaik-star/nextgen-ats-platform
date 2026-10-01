import { User, Role } from '../../types';
import { storage, delay } from './storage';

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: Role;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: Role;
  companyName?: string;
  adminRegistrationCode?: string;
}

export const authService = {
  async getCurrentUser(): Promise<User> {
    await delay(100);
    const users = storage.getUsers();
    const currentId = storage.getCurrentUserId();
    const found = users.find((u) => u.id === currentId);
    if (found) return found;
    return users[0];
  },

  async login(credentials: LoginCredentials): Promise<User> {
    await delay(300);
    const users = storage.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());
    if (!user) {
      // If user doesn't exist in mock data, create a temporary one for smooth testing
      const detectedRole: Role = credentials.role || (credentials.email.includes('admin') ? 'admin' : credentials.email.includes('recruiter') ? 'recruiter' : 'candidate');
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: detectedRole,
        avatar: detectedRole === 'admin'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : detectedRole === 'recruiter'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      storage.setUsers([...users, newUser]);
      storage.setCurrentUserId(newUser.id);
      return newUser;
    }

    if (credentials.role && user.role !== credentials.role) {
      throw new Error(`Account role mismatch. This account is registered as ${user.role.toUpperCase()}. Please select the ${user.role} role to sign in.`);
    }

    storage.setCurrentUserId(user.id);
    return user;
  },

  async register(data: RegisterData): Promise<User> {
    await delay(350);
    const users = storage.getUsers();

    if (data.role === 'admin') {
      const code = (data.adminRegistrationCode || '').trim().toLowerCase();
      const validCodes = [
        'change-this-admin-code',
        'admin2026',
        'admin123',
        'admin',
        '123456',
        'superadmin',
        'aiats2026',
        'edutrack'
      ];
      if (code && !validCodes.includes(code)) {
        throw new Error('Invalid Administrator Registration Code. Access Denied.');
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      companyName: data.companyName,
      title: data.role === 'admin' ? 'System Administrator' : undefined,
      avatar: data.role === 'admin'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : data.role === 'recruiter'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    storage.setUsers([...users, newUser]);
    storage.setCurrentUserId(newUser.id);
    return newUser;
  },

  async logout(): Promise<void> {
    await delay(150);
    // In mock mode, switch to default candidate
  },

  async switchRole(targetRole: Role): Promise<User> {
    await delay(100);
    const users = storage.getUsers();
    const userForRole = users.find((u) => u.role === targetRole) || users[0];
    storage.setCurrentUserId(userForRole.id);
    return userForRole;
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    await delay(300);
    return {
      success: true,
      message: `Password reset link has been dispatched to ${email}.`
    };
  }
};
