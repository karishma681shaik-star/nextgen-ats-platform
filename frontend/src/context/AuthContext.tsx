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

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => Promise<User>;
  refreshUser: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
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
   * UPDATE AVATAR
   * ---------------------------------------------------------
   */
  const updateAvatar = async (avatarUrl: string): Promise<void> => {
    try {
      const updated = await authService.updateAvatar(avatarUrl);
      if (updated) {
        setUser(updated);
        return;
      }
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
        register,
        logout,
        switchRole,
        refreshUser,
        updateAvatar,
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
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};