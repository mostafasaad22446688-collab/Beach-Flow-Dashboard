export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "superAdmin";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface Beach {
  id: number;
  name: string;
  location: string;
  price: number;
  maxCapacity: number;
  description?: string;
  imageUrl?: string;
  openingTime?: string;
  closingTime?: string;
}

export interface AddBeachRequest {
  name: string;
  location: string;
  price: number;
  maxCapacity: number;
  description?: string;
  imageUrl?: string;
  openingTime?: string;
  closingTime?: string;
}

export interface UpdateBeachRequest extends Partial<AddBeachRequest> {}

export interface BookingRequest {
  beachId: number;
  bookingDate: string;
  numberOfPersons: number;
}

export interface ToggleFavoriteRequest {
  beachId: number;
}

export interface AddReviewRequest {
  beachId: number;
  rating: number;
  comment: string;
}

export interface AdminActionRequest {
  userId: number;
  action: "approve" | "reject";
}
