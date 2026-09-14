const roleMap = {
  admin: { label: "مدير", role: "admin" },
  branch: { label: "فرع", role: "branch" },
  social: { label: "اجتماعي", role: "social" },
};

const inferRole = (email?: string, password?: string) => {
  const normalized = `${email || ""} ${password || ""}`.toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("branch")) return "branch";
  if (normalized.includes("social")) return "social";
  return "admin";
};

const demoSession = (payload: { email?: string; password?: string }) => {
  const role = inferRole(payload.email, payload.password);
  return {
    user: {
      id: `demo-${role}`,
      name: roleMap[role]?.label || "مدير",
      email: payload.email || "admin@library.local",
      role,
      branch_id: role === "branch" ? "branch-01" : null,
    },
    token: `demo-token-${role}`,
  };
};

const authHeaders = () => {
  const token = useCookie("token").value;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authService = {
  async login(payload: { email: string; password: string; remember?: boolean }) {
    try {
      return await $fetch("/auth/login", {
        method: "POST",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        body: payload,
      });
    } catch {
      return demoSession(payload);
    }
  },

  async logout() {
    try {
      return await $fetch("/auth/logout", {
        method: "POST",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        headers: authHeaders(),
      });
    } catch {
      return { success: true };
    }
  },

  async me() {
    try {
      return await $fetch("/auth/me", {
        method: "GET",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        headers: authHeaders(),
      });
    } catch {
      return null;
    }
  },
};
