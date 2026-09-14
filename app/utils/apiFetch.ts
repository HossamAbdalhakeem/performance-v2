type FetchOptions = Parameters<typeof $fetch>[1];

export class ApiError extends Error {
  code: string;
  status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const stripSlash = (value = "") => String(value || "").trim().replace(/\/$/, "");

export const getApiOrigin = () => {
  const config = useRuntimeConfig();
  return stripSlash(config.public.baseUrl || "");
};

const getAuthHeaders = (extra: Record<string, string> = {}) => {
  const token = useCookie("token").value;

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const extractMessage = (body: any): string => {
  const message = body?.message;

  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");
  if (message && typeof message === "object") {
    if (typeof message.message === "string") return message.message;
    if (Array.isArray(message.message)) return message.message.join(", ");
  }

  return body?.error || "Request failed.";
};

const toApiError = (error: any) => {
  const body = error?.data || error;
  const code = String(
    body?.statusCode || body?.code || body?.error || "REQUEST_FAILED",
  );
  const message = extractMessage(body) || error?.message || "Request failed.";
  return new ApiError(code, String(message), error?.status || error?.statusCode);
};

export const asData = <T = any>(response: any): T => {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }

  return response as T;
};

export const asList = <T = any>(response: any): T[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const firstRow = <T = any>(response: any): T | null => {
  const list = asList<T>(response);
  if (list.length) return list[0] ?? null;
  const data = asData(response);
  return data && !Array.isArray(data) ? (data as T) : null;
};

const cleanParams = (params: Record<string, any> = {}) => {
  const out: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    out[key] = value;
  });

  return out;
};

const request = async <T = any>(
  baseURL: string,
  path: string,
  options: FetchOptions = {},
) => {
  if (!baseURL) {
    throw new ApiError("MISSING_API_BASE", "API base URL is not configured.");
  }

  try {
    return await $fetch<T>(path, {
      ...options,
      params: cleanParams((options.params || {}) as Record<string, any>),
      baseURL,
      headers: getAuthHeaders({
        ...((options.headers || {}) as Record<string, string>),
      }),
    });
  } catch (error) {
    throw toApiError(error);
  }
};

/** NestJS REST API requests */
export const apiFetch = async <T = any>(
  path: string,
  options: FetchOptions = {},
) => {
  return request<T>(getApiOrigin(), path, options);
};

/** Auth endpoints on the same NestJS API */
export const authFetch = async <T = any>(
  path: string,
  options: FetchOptions = {},
) => {
  return request<T>(getApiOrigin(), path, options);
};
