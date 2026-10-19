import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { User, Role } from '../types';
import {
  authService,
  RegisterData,
  LoginCredentials,
} from '../services';
import { voiceAssistantService } from '../services/audio/voiceAssistantService';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginCredentials) => Promise<User>;
  adminLogin: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateProfile: (profileData: { name?: string; avatar?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /*
   * ---------------------------------------------------------
   * Load currently authenticated user
   * ---------------------------------------------------------
   *
   * We first check whether a JWT actually exists.
   *
   * Your apiClient stores the JWT using:
   *
   *     ai_ats_auth_token
   *
   * Therefore we should NOT call /api/auth/me when there
   * is no token.
   */
  const loadCurrentUser = useCallback(async () => {

    const token = localStorage.getItem('ai_ats_auth_token');

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {

      setIsLoading(true);

      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        localStorage.removeItem('ai_ats_auth_token');
      }

    } catch (error) {

      console.error(
        'Failed to restore authenticated session:',
        error
      );

      // Invalid/expired JWT
      setUser(null);
      localStorage.removeItem('ai_ats_auth_token');

    } finally {

      setIsLoading(false);

    }

  }, []);

  /*
   * ---------------------------------------------------------
   * Restore session when application starts
   * ---------------------------------------------------------
   */
  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */
  const login = async (
    credentials: LoginCredentials
  ): Promise<User> => {

    setIsLoading(true);

    try {

      /*
       * authService.login() must:
       *
       * 1. Call POST /api/auth/login
       * 2. Receive JWT
       * 3. Store JWT as ai_ats_auth_token
       * 4. Return the authenticated user
       */
      const loggedUser = await authService.login(credentials);

      if (!loggedUser) {
        throw new Error(
          'Login failed: user information was not returned by the server.'
        );
      }

      setUser(loggedUser);

      return loggedUser;

    } catch (error) {

      /*
       * Do not leave an old user/session active after
       * an unsuccessful login.
       */
      setUser(null);

      console.error('Login failed:', error);

      throw error;

    } finally {

      setIsLoading(false);

    }
  };

  /*
   * ---------------------------------------------------------
   * ADMIN LOGIN
   * ---------------------------------------------------------
   */
  const adminLogin = async (
    credentials: LoginCredentials
  ): Promise<User> => {

    setIsLoading(true);

    try {
      const loggedUser = await authService.adminLogin(credentials);

      if (!loggedUser) {
        throw new Error(
          'Admin login failed: user information was not returned by the server.'
        );
      }

      setUser(loggedUser);

      return loggedUser;

    } catch (error) {

      setUser(null);

      console.error('Admin login failed:', error);

      throw error;

    } finally {

      setIsLoading(false);

    }
  };

  /*
   * ---------------------------------------------------------
   * REGISTER
   * ---------------------------------------------------------
   */
  const register = async (
    data: RegisterData
  ): Promise<User> => {

    setIsLoading(true);

    try {

      /*
       * authService.register() should:
       *
       * 1. Call POST /api/auth/register
       * 2. Receive JWT
       * 3. Store JWT
       * 4. Return newly created user
       */
      const newUser = await authService.register(data);

      if (!newUser) {
        throw new Error(
          'Registration failed: user information was not returned by the server.'
        );
      }

      setUser(newUser);

      return newUser;

    } catch (error) {

      setUser(null);

      console.error('Registration failed:', error);

      throw error;

    } finally {

      setIsLoading(false);

    }
  };

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */
  const logout = async (): Promise<void> => {

    setIsLoading(true);

    try {
      voiceAssistantService.stop();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ai_ats_pending_voice_welcome');
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('ai_ats_voice_welcome_done_')) {
            sessionStorage.removeItem(key);
          }
        });
      }

      await authService.logout();

    } catch (error) {

      console.error('Logout request failed:', error);

    } finally {

      /*
       * Always clear local authentication state.
       */
      setUser(null);

      localStorage.removeItem('ai_ats_auth_token');

      setIsLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * SWITCH ROLE
   * ---------------------------------------------------------
   */
  const switchRole = async (
    targetRole: Role
  ): Promise<User> => {

    setIsLoading(true);

    try {

      const newUser =
        await authService.switchRole(targetRole);

      if (!newUser) {
        throw new Error(
          'Role switch failed: user information was not returned.'
        );
      }

      setUser(newUser);

      return newUser;

    } catch (error) {

      console.error('Role switch failed:', error);

      throw error;

    } finally {

      setIsLoading(false);

    }
  };

  /*
   * ---------------------------------------------------------
   * REFRESH USER
   * ---------------------------------------------------------
   */
  const refreshUser = async (): Promise<void> => {
    await loadCurrentUser();
  };

  /*
   * ---------------------------------------------------------
   * UPDATE PROFILE (NAME AND/OR AVATAR)
   * ---------------------------------------------------------
   */
  const updateProfile = async (profileData: { name?: string; avatar?: string }): Promise<User> => {
    const updated = await authService.updateProfile(profileData);
    if (updated) {
      setUser(updated);
      return updated;
    }
    throw new Error('Failed to update profile: empty response received from server.');
  };

  /*
   * ---------------------------------------------------------
   * UPDATE AVATAR
   * ---------------------------------------------------------
   */
  const updateAvatar = async (avatarUrl: string): Promise<void> => {
    try {
      const updated = await updateProfile({ avatar: avatarUrl });
      if (updated) return;
    } catch (error) {
      console.warn('Backend updateAvatar failed, updating local state:', error);
    }
    setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
  };

  /*
   * ---------------------------------------------------------
   * PROVIDER
   * ---------------------------------------------------------
   */
  return (
    <AuthContext.Provider
      value={{
        user,

        /*
         * If no user is logged in, candidate is only a
         * fallback value for UI state.
         */
        role: user?.role || 'candidate',

        isAuthenticated: !!user,

        isLoading,

        login,
        adminLogin,
        register,
        logout,
        switchRole,
        refreshUser,
        updateAvatar,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/*
 * ---------------------------------------------------------
 * useAuth Hook
 * ---------------------------------------------------------
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      user: null,
      role: 'candidate' as Role,
      isAuthenticated: false,
      isLoading: false,
      login: async () => { throw new Error('AuthProvider not mounted'); },
      adminLogin: async () => { throw new Error('AuthProvider not mounted'); },
      register: async () => { throw new Error('AuthProvider not mounted'); },
      logout: async () => {},
      switchRole: async () => { throw new Error('AuthProvider not mounted'); },
      refreshUser: async () => {},
      updateAvatar: async () => {},
      updateProfile: async () => { throw new Error('AuthProvider not mounted'); },
    };
  }

  return context;
};