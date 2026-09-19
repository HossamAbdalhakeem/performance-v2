import { useLocalStorage } from "~/composables/useLocalStorage";

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
  const token = useLocalStorage("token").value;

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

export type PaginationMeta = {
  total: number;
  current_page: number;
  to: number;
  per_page: number;
};

export type PaginatedResponse<T = any> = {
  data: T[];
  pagination: PaginationMeta;
};

export const asList = <T = any>(response: any): T[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const asPaginated = <T = any>(
  response: any,
): PaginatedResponse<T> => ({
  data: asList<T>(response),
  pagination: response?.pagination || {
    total: asList(response).length,
    current_page: 1,
    to: asList(response).length,
    per_page: asList(response).length || 20,
  },
});

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

/**
 * Only attach academicYearId to endpoints that actually filter by it.
 * Do NOT send it to expense-categories, study-years, users, etc.
 * /branches uses it only when inventory_summary=true (plain branch lists ignore it).
 */
const ACADEMIC_YEAR_SCOPED_PATHS = [
  "/products",
  "/teachers",
  "/students",
  "/branches",
  "/sales",
  "/reservations",
  "/inventory",
  "/returns",
  "/exchanges",
  "/expenses",
  "/reports",
  "/notifications",
];

const shouldAttachAcademicYear = (path: string) => {
  const normalized = String(path || "").split("?")[0] || "";
  if (!normalized) return false;
  // expense-categories is under /expense-categories, not /expenses — excluded
  return ACADEMIC_YEAR_SCOPED_PATHS.some(
    (prefix) =>
      normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
};

const getAcademicYearId = () => {
  try {
    return useLocalStorage("academicYearId").value || null;
  } catch {
    return null;
  }
};

const withAcademicYearParams = (
  path: string,
  params: Record<string, any> = {},
  method?: string,
) => {
  const next = { ...params };

  // Opt out of auto academic-year scoping when explicitly requested
  if (next.skipAcademicYearFilter) {
    delete next.skipAcademicYearFilter;
    return next;
  }

  // Create/update/delete: never send academicYearId as a query param.
  // Callers must put it in the request body when needed.
  const verb = String(method || "GET").toUpperCase();
  if (verb !== "GET" && verb !== "HEAD") {
    delete next.academicYearId;
    return next;
  }

  if (!shouldAttachAcademicYear(path)) return next;
  if (next.academicYearId != null && next.academicYearId !== "") return next;

  const academicYearId = getAcademicYearId();
  if (academicYearId) next.academicYearId = academicYearId;
  return next;
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
      params: cleanParams(
        withAcademicYearParams(
          path,
          (options.params || {}) as Record<string, any>,
          options.method as string | undefined,
        ),
      ),
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

export type BlobDownloadResult = {
  blob: Blob;
  headers: Headers;
  filename: string | null;
};

const parseContentDispositionFilename = (header: string | null) => {
  if (!header) return null;

  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ""));
    } catch {
      return utf8Match[1].trim().replace(/^"|"$/g, "");
    }
  }

  const plainMatch = /filename\s*=\s*("?)([^";]+)\1/i.exec(header);
  if (plainMatch?.[2]) return plainMatch[2].trim();

  return null;
};

const blobLooksLikeJsonError = async (blob: Blob) => {
  const type = String(blob.type || "").toLowerCase();
  if (type.includes("json") || type.includes("text")) return true;
  if (blob.size > 0 && blob.size < 4096) {
    try {
      const text = await blob.slice(0, 64).text();
      const trimmed = text.trim();
      return trimmed.startsWith("{") || trimmed.startsWith("[");
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Binary download helper (Excel, etc.).
 * Uses $fetch.raw so Content-Disposition filename is available.
 */
export const apiFetchBlob = async (
  path: string,
  options: FetchOptions = {},
): Promise<BlobDownloadResult> => {
  const baseURL = getApiOrigin();
  if (!baseURL) {
    throw new ApiError("MISSING_API_BASE", "API base URL is not configured.");
  }

  try {
    const response = await $fetch.raw(path, {
      ...options,
      responseType: "blob",
      params: cleanParams(
        withAcademicYearParams(
          path,
          (options.params || {}) as Record<string, any>,
          options.method as string | undefined,
        ),
      ),
      baseURL,
      headers: getAuthHeaders({
        ...((options.headers || {}) as Record<string, string>),
      }),
    });

    const blob = response._data as Blob;
    if (!blob) {
      throw new ApiError("EMPTY_RESPONSE", "Empty file response.");
    }

    if (await blobLooksLikeJsonError(blob)) {
      try {
        const body = JSON.parse(await blob.text());
        throw toApiError({ data: body, status: response.status });
      } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("REQUEST_FAILED", "Request failed.", response.status);
      }
    }

    return {
      blob,
      headers: response.headers,
      filename: parseContentDispositionFilename(
        response.headers.get("content-disposition"),
      ),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw toApiError(error);
  }
};
