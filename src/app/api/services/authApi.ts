import { apiClient } from "../apiClient";
import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "../types";

export const authApi = {
  register: <TResponse = unknown>(payload: RegisterRequest) =>
    apiClient.post<TResponse>("/api/auth/register", payload),

  login: <TResponse = unknown>(payload: LoginRequest) =>
    apiClient.post<TResponse>("/api/auth/login", payload),

  verifyOtp: <TResponse = unknown>(payload: VerifyOtpRequest) =>
    apiClient.post<TResponse>("/api/auth/verify", payload),

  resendOtp: <TResponse = unknown>(payload: { email: string }) =>
    apiClient.post<TResponse>("/api/auth/resend-otp", payload),

  forgotPassword: <TResponse = unknown>(payload: ForgotPasswordRequest) =>
    apiClient.post<TResponse>("/api/auth/forgot-password", payload),

  verifyResetCode: <TResponse = unknown>(payload: VerifyOtpRequest) =>
    apiClient.post<TResponse>("/api/auth/verify-reset-code", payload),

  resetPassword: <TResponse = unknown>(payload: ResetPasswordRequest) =>
    apiClient.post<TResponse>("/api/auth/reset-password", payload),

  testAuth: <TResponse = unknown>(token?: string) =>
    apiClient.get<TResponse>("/api/auth/test", { token }),
};
