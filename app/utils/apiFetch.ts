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
  return stripSlash(config.public.baseUrl || config.public.supabaseUrl);
};

const getAuthHeaders = (extra: Record<string, string> = {}) => {
  const config = useRuntimeConfig();
  const key = config.public.supabaseKey || "";
  const token = useCookie("token").value || key;

  return {
    ...(key ? { apikey: key } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const toApiError = (error: any) => {
  const body = error?.data || error;
  const code = body?.error?.code || body?.code || body?.hint || "REQUEST_FAILED";
  const message =
    body?.error?.message ||
    body?.message ||
    error?.message ||
    "Request failed.";
  return new ApiError(String(code), String(message), error?.status || error?.statusCode);
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

const request = async <T = any>(baseURL: string, path: string, options: FetchOptions = {}) => {
  if (!baseURL) {
    throw new ApiError("MISSING_API_BASE", "API base URL is not configured.");
  }

  try {
    return await $fetch<T>(path, {
      ...options,
      params: cleanParams((options.params || {}) as Record<string, any>),
      baseURL,
      headers: getAuthHeaders({
        Prefer: "return=representation",
        ...((options.headers || {}) as Record<string, string>),
      }),
    });
  } catch (error) {
    throw toApiError(error);
  }
};

export const apiFetch = async <T = any>(path: string, options: FetchOptions = {}) => {
  return request<T>(`${getApiOrigin()}/rest/v1`, path, options);
};

export const authFetch = async <T = any>(path: string, options: FetchOptions = {}) => {
  return request<T>(`${getApiOrigin()}/auth/v1`, path, options);
};
