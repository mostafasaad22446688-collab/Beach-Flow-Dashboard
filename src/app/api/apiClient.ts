export interface ApiErrorPayload {
  message: string;
  status: number;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.details = payload.details;
  }
}

type Primitive = string | number | boolean;
type QueryValue = Primitive | Primitive[] | null | undefined;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
  token?: string;
  signal?: AbortSignal;
}

interface ApiClientConfig {
  baseUrl?: string;
  getAccessToken?: () => string | null;
}

const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://beachflow-app-final-production.up.railway.app";

function appendQueryParams(url: URL, query?: Record<string, QueryValue>) {
  if (!query) {
    return;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      return;
    }

    url.searchParams.set(key, String(value));
  });
}

function extractErrorMessage(status: number, payload: unknown) {
  if (typeof payload === "string" && payload.trim().length > 0) {
    const normalizedText = payload.trim();
    if (
      normalizedText.startsWith("<!DOCTYPE html") ||
      normalizedText.includes("<html")
    ) {
      return `Server error (${status}). Please try again later.`;
    }

    return payload;
  }

  if (payload && typeof payload === "object") {
    const maybePayload = payload as Record<string, unknown>;
    const messageKeys = ["message", "error", "details"];

    for (const key of messageKeys) {
      const value = maybePayload[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
  }

  return `Request failed with status ${status}`;
}

function normalizePayload<T>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if ("data" in record) {
      return record.data as T;
    }

    if ("result" in record) {
      return record.result as T;
    }
  }

  return payload as T;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length ? text : null;
}

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "Missing API base URL. Add VITE_API_BASE_URL to your environment variables.",
    );
  }

  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const method = options.method ?? "GET";
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${baseUrl}${normalizedPath}`);

    appendQueryParams(url, options.query);

    const token = options.token ?? config.getAccessToken?.();
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");

    const hasBody = options.body !== undefined && options.body !== null;
    if (hasBody && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      signal: options.signal,
      body: hasBody
        ? options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body)
        : undefined,
    });

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      throw new ApiError({
        message: extractErrorMessage(response.status, payload),
        status: response.status,
        details: payload,
      });
    }

    return normalizePayload<T>(payload);
  }

  return {
    request,
    get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
      request<T>(path, { ...options, method: "GET" }),
    post: <T>(
      path: string,
      body?: unknown,
      options?: Omit<RequestOptions, "method" | "body">,
    ) => request<T>(path, { ...options, method: "POST", body }),
    put: <T>(
      path: string,
      body?: unknown,
      options?: Omit<RequestOptions, "method" | "body">,
    ) => request<T>(path, { ...options, method: "PUT", body }),
    patch: <T>(
      path: string,
      body?: unknown,
      options?: Omit<RequestOptions, "method" | "body">,
    ) => request<T>(path, { ...options, method: "PATCH", body }),
    delete: <T>(
      path: string,
      options?: Omit<RequestOptions, "method" | "body">,
    ) => request<T>(path, { ...options, method: "DELETE" }),
  };
}

export const apiClient = createApiClient({
  getAccessToken: () => localStorage.getItem("token"),
});
