type FetchOptions = Parameters<typeof $fetch>[1];

const normalizeOrigin = (value = "") =>
  String(value || "")
    .trim()
    .replace(/\/$/, "")
    .replace(".supabase.com", ".supabase.co");

export const getApiOrigin = () => {
  const config = useRuntimeConfig();
  return normalizeOrigin(config.public.supabaseUrl || config.public.baseUrl);
};

const getAuthHeaders = (extra: Record<string, string> = {}) => {
  const config = useRuntimeConfig();
  const key = config.public.supabaseKey || "";
  const token = useCookie("token").value || key;

  return {
    apikey: key,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

export const apiFetch = <T>(path: string, options: FetchOptions = {}) => {
  return $fetch<T>(path, {
    ...options,
    baseURL: `${getApiOrigin()}/rest/v1`,
    headers: getAuthHeaders((options.headers || {}) as Record<string, string>),
  });
};

export const authFetch = <T>(path: string, options: FetchOptions = {}) => {
  return $fetch<T>(path, {
    ...options,
    baseURL: `${getApiOrigin()}/auth/v1`,
    headers: getAuthHeaders((options.headers || {}) as Record<string, string>),
  });
};
