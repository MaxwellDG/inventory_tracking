export type AuthUser = {
  id: number;
  name: string;
  email: string;
  company_id: number;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  role: "admin" | "user";
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
  refresh_token: string;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type VerifyEmailRequest = {
  id: string;
  hash: string;
};
