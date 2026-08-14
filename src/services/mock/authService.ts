import { User, Role } from '../../types';
import { storage, delay } from './storage';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: Role;
  companyName?: string;
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
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: credentials.email.includes('recruiter') ? 'recruiter' : 'candidate',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      storage.setUsers([...users, newUser]);
      storage.setCurrentUserId(newUser.id);
      return newUser;
    }
    storage.setCurrentUserId(user.id);
    return user;
  },

  async register(data: RegisterData): Promise<User> {
    await delay(350);
    const users = storage.getUsers();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      companyName: data.companyName,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
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
