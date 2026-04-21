import { apiClient } from "../apiClient";
import { AddBeachRequest, UpdateBeachRequest } from "../types";

interface TokenOptions {
  token?: string;
}

export const adminApi = {
  getMyBeaches: <TResponse = unknown>(options: TokenOptions = {}) =>
    apiClient.get<TResponse>("/api/beach/my-beaches", options),

  addNewBeach: <TResponse = unknown>(
    payload: AddBeachRequest,
    options: TokenOptions = {},
  ) => apiClient.post<TResponse>("/api/beach", payload, options),

  updateBeach: <TResponse = unknown>(
    beachId: number,
    payload: UpdateBeachRequest,
    options: TokenOptions = {},
  ) => apiClient.put<TResponse>(`/api/beach/${beachId}`, payload, options),

  deleteBeach: <TResponse = unknown>(
    beachId: number,
    options: TokenOptions = {},
  ) => apiClient.delete<TResponse>(`/api/beach/${beachId}`, options),

  scanQr: <TResponse = unknown>(
    identifier: string,
    options: TokenOptions = {},
  ) =>
    apiClient.post<TResponse>(
      "/api/tickets/verify-checkin",
      { identifier },
      options,
    ),

  getAdminBookings: <TResponse = unknown>(options: TokenOptions = {}) =>
    apiClient.get<TResponse>("/api/bookings/my-beach-bookings", options),
};
