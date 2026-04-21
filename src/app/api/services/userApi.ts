import { apiClient } from "../apiClient";
import {
  AddReviewRequest,
  BookingRequest,
  ToggleFavoriteRequest,
} from "../types";

interface TokenOptions {
  token?: string;
}

export const userApi = {
  getAllBeaches: <TResponse = unknown>() =>
    apiClient.get<TResponse>("/api/beach"),

  searchBeaches: <TResponse = unknown>(query: string) =>
    apiClient.get<TResponse>("/api/beach/search", { query: { q: query } }),

  getOneBeach: <TResponse = unknown>(beachId: number) =>
    apiClient.get<TResponse>(`/api/beach/${beachId}`),

  getTopRatedBeaches: <TResponse = unknown>() =>
    apiClient.get<TResponse>("/api/beach/top-rated"),

  createBooking: <TResponse = unknown>(
    payload: BookingRequest,
    options: TokenOptions = {},
  ) => apiClient.post<TResponse>("/api/bookings", payload, options),

  getMyBookings: <TResponse = unknown>(options: TokenOptions = {}) =>
    apiClient.get<TResponse>("/api/bookings/my-bookings", options),

  toggleFavorite: <TResponse = unknown>(
    payload: ToggleFavoriteRequest,
    options: TokenOptions = {},
  ) => apiClient.post<TResponse>("/api/favorites/toggle", payload, options),

  getUserFavorites: <TResponse = unknown>(options: TokenOptions = {}) =>
    apiClient.get<TResponse>("/api/favorites", options),

  getMyNotifications: <TResponse = unknown>(options: TokenOptions = {}) =>
    apiClient.get<TResponse>("/api/notifications/my-notifications", options),

  initiatePayment: <TResponse = unknown>(
    bookingId: number,
    options: TokenOptions = {},
  ) =>
    apiClient.post<TResponse>("/api/payment/initiate", { bookingId }, options),

  addReview: <TResponse = unknown>(
    payload: AddReviewRequest,
    options: TokenOptions = {},
  ) => apiClient.post<TResponse>("/api/reviews/add", payload, options),

  getProfile: <TResponse = unknown>(options: TokenOptions = {}) =>
    apiClient.get<TResponse>("/api/users/profile", options),

  editProfile: <TResponse = unknown>(
    payload: { name?: string },
    options: TokenOptions = {},
  ) => apiClient.put<TResponse>("/api/users/edit-profile", payload, options),

  createTicket: <TResponse = unknown>(
    bookingId: number,
    options: TokenOptions = {},
  ) => apiClient.get<TResponse>(`/api/tickets/${bookingId}`, options),

  requestAdminRole: <TResponse = unknown>(
    idCardUrl: string,
    options: TokenOptions = {},
  ) =>
    apiClient.post<TResponse>(
      "/api/users/request-admin",
      { idCardUrl },
      options,
    ),
};
