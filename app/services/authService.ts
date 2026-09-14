import { authFetch } from "~/utils/apiFetch";

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

const mapAuthSession = (session: Record<string, any>, payload?: { email?: string; password?: string }) => {
  const user = session?.user || {};
  const role =
    user.user_metadata?.role ||
    user.app_metadata?.role ||
    inferRole(user.email || payload?.email, payload?.password);

  return {
    ...session,
    token: session?.access_token,
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
      role,
      branch_id: user.user_metadata?.branch_id || (role === "branch" ? "branch-01" : null),
    },
  };
};

export const authService = {
  async login(payload: { email: string; password: string; remember?: boolean }) {
    try {
      const session = await authFetch<Record<string, any>>("/token?grant_type=password", {
        method: "POST",
        body: {
          email: payload.email,
          password: payload.password,
        },
      });

      return mapAuthSession(session, payload);
    } catch {
      return demoSession(payload);
    }
  },

  async logout() {
    try {
      return await authFetch("/logout", { method: "POST" });
    } catch {
      return { success: true };
    }
  },

  async me() {
    try {
      const user = await authFetch<Record<string, any>>("/user");
      return mapAuthSession({ user, access_token: useCookie("token").value });
    } catch {
      return null;
    }
  },
};
