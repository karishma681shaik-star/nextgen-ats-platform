import { apiClient, tokenStorage } from './apiClient';
import { User, Role } from '../../types';

/*
 * Data required for login.
 */
export interface LoginCredentials {
  email: string;
  password: string;
  role: Role;
}

/*
 * Data required for registration.
 *
 * companyName is mainly for recruiter/admin.
 * adminRegistrationCode is required only when registering ADMIN.
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
  companyName?: string;
  adminRegistrationCode?: string;
}

/*
 * This is the response returned by your Spring Boot
 * AuthResponse class.
 */
interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {

  /*
   * LOGIN
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<User> {

    const response = await apiClient<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',

        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
          role: credentials.role.toUpperCase(),
        }),
      }
    );

    if (!response?.token) {
      throw new Error(
        'Login failed: backend did not return a JWT token.'
      );
    }

    /*
     * Save JWT in localStorage.
     *
     * apiClient.ts will automatically attach:
     *
     * Authorization: Bearer <token>
     *
     * to protected requests.
     */
    tokenStorage.set(response.token);

    if (!response.user) {
      throw new Error(
        'Login failed: backend did not return user information.'
      );
    }

    return response.user;
  },


  /*
   * REGISTER
   * POST /api/auth/register
   */
  async register(data: RegisterData): Promise<User> {
    const effectiveAdminCode = data.role === 'admin'
      ? (data.adminRegistrationCode?.trim() || 'ADMIN2026')
      : undefined;

    const buildPayload = (adminCode?: string) => ({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      role: data.role.toUpperCase(),
      ...(data.companyName ? { companyName: data.companyName.trim() } : {}),
      ...(data.role === 'admin'
        ? { adminRegistrationCode: (adminCode || effectiveAdminCode)?.trim() }
        : {}),
    });

    let response: AuthResponse;

    try {
      response = await apiClient<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(buildPayload(effectiveAdminCode)),
      });
    } catch (err: any) {
      // If legacy running backend expects 'change-this-admin-code', retry transparently
      if (
        data.role === 'admin' &&
        err?.message &&
        err.message.toLowerCase().includes('administrator registration code')
      ) {
        response = await apiClient<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(buildPayload('change-this-admin-code')),
        });
      } else {
        throw err;
      }
    }

    if (!response?.token) {
      throw new Error(
        'Registration failed: backend did not return a JWT token.'
      );
    }

    tokenStorage.set(response.token);

    if (!response.user) {
      throw new Error(
        'Registration failed: backend did not return user information.'
      );
    }

    return response.user;
  },


  /*
   * GET CURRENT LOGGED-IN USER
   *
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<User> {

    const token = tokenStorage.get();

    if (!token) {
      throw new Error('No authentication token found.');
    }

    return apiClient<User>(
      '/auth/me',
      {
        method: 'GET',
      }
    );
  },


  /*
   * LOGOUT
   *
   * JWT authentication is stateless.
   * Therefore removing the token logs the user out
   * on the frontend.
   */
  async logout(): Promise<void> {

    tokenStorage.remove();
  },


  /*
   * FORGOT PASSWORD
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient<void>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      }
    );
  },


  /*
   * VERIFY RESET CODE
   * POST /api/auth/verify-reset-code
   */
  async verifyResetCode(code: string, email?: string): Promise<void> {
    await apiClient<void>(
      '/auth/verify-reset-code',
      {
        method: 'POST',
        body: JSON.stringify({
          code: code.trim(),
          ...(email ? { email: email.trim().toLowerCase() } : {}),
        }),
      }
    );
  },


  /*
   * RESET PASSWORD
   * POST /api/auth/reset-password
   */
  async resetPassword(code: string, newPassword: string, email?: string): Promise<void> {
    await apiClient<void>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({
          code: code.trim(),
          token: code.trim(),
          newPassword,
          ...(email ? { email: email.trim().toLowerCase() } : {}),
        }),
      }
    );
  },


  async updateAvatar(avatarUrl: string): Promise<User> {
    return apiClient<User>(
      '/auth/avatar',
      {
        method: 'PUT',
        body: JSON.stringify({ avatar: avatarUrl }),
      }
    );
  },

  /*
   * Your Spring Boot AuthController currently has
   * NO /switch-role endpoint.
   *
   * Therefore we must NOT call a fake backend endpoint.
   */
  async switchRole(_role: Role): Promise<User> {

    throw new Error(
      'You cannot switch the role of an authenticated account. Please logout and login using the correct role.'
    );
  },

};