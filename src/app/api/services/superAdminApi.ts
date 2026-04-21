import { apiClient } from "../apiClient";
import { AdminActionRequest } from "../types";

interface TokenOptions {
  token?: string;
}

export const superAdminApi = {
  getSuperRequests: <TResponse = unknown>(options: TokenOptions = {}) =>
    apiClient.get<TResponse>("/api/superAdmin/super-requests", options),

  submitAdminAction: <TResponse = unknown>(
    payload: AdminActionRequest,
    options: TokenOptions = {},
  ) =>
    apiClient.post<TResponse>("/api/superAdmin/super-action", payload, options),
};
