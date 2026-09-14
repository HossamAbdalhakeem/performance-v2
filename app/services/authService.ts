import { authFetch } from "~/utils/apiFetch";
import { useSupabase } from "~/composables/useSupabase";

const DASHBOARD_ROLES = {
  admin: "admin",
  library_employee: "branch",
  customer_service: "social",
} as const;

export const mapDashboardRole = (roles: string[] = []) => {
  if (roles.includes("admin")) return DASHBOARD_ROLES.admin;
  if (roles.includes("library_employee")) return DASHBOARD_ROLES.library_employee;
  if (roles.includes("customer_service")) return DASHBOARD_ROLES.customer_service;
  return DASHBOARD_ROLES.admin;
};

const toRoleList = (user: Record<string, any> = {}) => {
  const meta = {
    ...(user.app_metadata || {}),
    ...(user.user_metadata || {}),
  };
  const roles = meta.roles || meta.role || user.roles || [];
  return (Array.isArray(roles) ? roles : [roles]).filter(Boolean);
};

const normalizeAuth = (payload: Record<string, any> = {}, token: string | null = null) => {
  const user = payload.user || payload;
  const meta = {
    ...(user.app_metadata || {}),
    ...(user.user_metadata || {}),
  };
  const roles = toRoleList(user);
  const branches = payload.branches || user.branches || meta.branches || [];

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: meta.full_name || meta.name || user.full_name || user.email,
      name: meta.full_name || meta.name || user.full_name || user.email,
      phone: meta.phone || user.phone || "",
      roles,
      branches,
      role: mapDashboardRole(roles),
      branch_id: branches[0]?.id || meta.branch_id || null,
    },
    roles,
    branches,
    token,
  };
};

export const authService = {
  async login(payload: { email: string; password: string }) {
    const session = await authFetch<Record<string, any>>("/token?grant_type=password", {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
      },
    });

    const token = session?.access_token || null;
    if (token) useCookie("token").value = token;

    try {
      const supabase = useSupabase();
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } catch {
      // Session cookie is enough for API calls if the client is unavailable.
    }

    return normalizeAuth(session, token);
  },

  async logout() {
    try {
      await authFetch("/logout", { method: "POST" });
    } catch {
      // Local logout still proceeds.
    }

    try {
      const supabase = useSupabase();
      await supabase.auth.signOut();
    } catch {
      // Ignore client sign-out failures.
    }

    return { success: true };
  },

  async getCurrentUser() {
    const user = await authFetch("/user", { method: "GET" });
    return normalizeAuth({ user }, useCookie("token").value);
  },

  async me() {
    return this.getCurrentUser();
  },
};
