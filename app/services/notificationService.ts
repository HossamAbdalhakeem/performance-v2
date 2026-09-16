import { apiFetch, asList } from "~/utils/apiFetch";

const normalizeNotification = (item: Record<string, any> = {}) => {
  const createdAt = item.createdAt || item.created_at || item.timestamp || null;

  return {
    ...item,
    id: item.id || item._id || `${item.type || "n"}-${createdAt || Math.random()}`,
    title: item.title || item.subject || "تنبيه مخزون",
    message:
      item.message ||
      item.body ||
      item.content ||
      item.description ||
      "يوجد تحديث بخصوص المخزون.",
    type: String(item.type || item.kind || "STOCK").toUpperCase(),
    createdAt,
    productId: item.productId || item.product_id || item.product?.id || null,
    productName: item.productName || item.product_name || item.product?.name || "",
  };
};

export const notificationService = {
  async getNotifications(params: Record<string, any> = {}) {
    const list = asList(
      await apiFetch("/notifications", { method: "GET", params }),
    );
    return list.map((item) => normalizeNotification(item || {}));
  },
};
