/** Shared domain labels for API enum keys (Arabic UI). */

import { getStatusTagSeverity } from "~/utils/statusTags";

export const RESERVATION_STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  WAITING_FOR_STOCK: "بانتظار المخزون",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export const SALE_STATUS_LABELS = {
  COMPLETED: "مكتمل",
  PARTIALLY_RETURNED: "مسترد جزئيًا",
  RETURNED: "تم الاسترداد",
};

export const STOCK_MOVEMENT_LABELS = {
  STOCK_IN: "استلام",
  STOCK_OUT: "سحب",
  SALE: "بيع",
  RESERVATION: "حجز",
  RESERVATION_RELEASE: "إلغاء حجز",
  RETURN: "مرتجع",
  DAMAGED: "تالف",
  ADJUSTMENT: "تسوية",
  EXCHANGE: "استبدال",
  REFUND: "استرداد",
};

/** Warehouse stock operation types (add / remove). */
export const STOCK_OPERATION_LABELS = {
  STOCK_IN: "إضافة للمخزن",
  STOCK_OUT: "سحب من المخزن",
};

/** Sales and new reservations. */
export const STUDENT_SALE_LABELS = {
  SALE: "بيع",
  RESERVATION: "حجز",
};

/** Cancellations, refunds, and returns. */
export const STUDENT_REFUND_LABELS = {
  RESERVATION_RELEASE: "إلغاء حجز",
  REFUND_SALE: "استرداد بيع",
  REFUND_RESERVATION: "استرداد حجز",
  RETURN_SALE: "مرتجع بيع",
  RETURN_RESERVATION: "مرتجع حجز",
};

/** Product exchanges (old → new). */
export const STUDENT_EXCHANGE_LABELS = {
  EXCHANGE_SALE: "استبدال بيع",
  EXCHANGE_RESERVATION: "استبدال حجز",
};

/** @deprecated prefer STUDENT_REFUND_LABELS / STUDENT_EXCHANGE_LABELS */
export const STUDENT_ADJUSTMENT_LABELS = {
  ...STUDENT_EXCHANGE_LABELS,
  ...STUDENT_REFUND_LABELS,
};

/** @deprecated combined list — prefer the two maps above */
export const STUDENT_OPERATION_LABELS = {
  ...STUDENT_SALE_LABELS,
  ...STUDENT_ADJUSTMENT_LABELS,
};

/** Distinct accent colors for stock-movement type chips in tables. */
export const STOCK_MOVEMENT_COLORS = {
  STOCK_IN: "#10b981",
  STOCK_OUT: "#f97316",
  SALE: "#f5af52",
  RESERVATION: "#a78bfa",
  RESERVATION_RELEASE: "#fb7185",
  RETURN: "#e11d48",
  DAMAGED: "#b91c1c",
  ADJUSTMENT: "#94a3b8",
  EXCHANGE: "#6366f1",
  REFUND: "#f43f5e",
  EXCHANGE_SALE: "#6366f1",
  EXCHANGE_RESERVATION: "#8b5cf6",
  REFUND_SALE: "#f43f5e",
  REFUND_RESERVATION: "#fb7185",
  RETURN_SALE: "#e11d48",
  RETURN_RESERVATION: "#be123c",
};



export const TRANSACTION_TYPE_LABELS = {
  SALE: "بيع",
  RESERVATION: "حجز",
  RETURN: "مرتجع",
  EXCHANGE: "استبدال",
};

export const EXCHANGE_DIFF_META = {
  more: {
    title: "الطالب سيدفع فرق سعر إضافي",
    diffLabel: "المبلغ المطلوب تحصيله",
    confirmText: (amount) =>
      `سيتم تحصيل فرق سعر قدره ${Number(amount || 0).toFixed(2)} من الطالب.`,
  },
  less: {
    title: "سيتم رد فرق السعر للطالب",
    diffLabel: "المبلغ الذي سيُرد للطالب",
    confirmText: (amount) =>
      `سيتم رد فرق سعر قدره ${Number(amount || 0).toFixed(2)} للطالب.`,
  },
  same: {
    title: "نفس السعر — لا يوجد فرق مالي",
    diffLabel: "فرق السعر",
    confirmText: () => "السعر متساوٍ ولن يتم تحصيل أو رد أي مبلغ.",
  },
};

export const AVAILABILITY_LABELS = {
  AVAILABLE: "متاح",
  UNAVAILABLE: "غير متاح",
};

export const REPORT_ACTIVITY_KEY_LABELS = {
  sales: "المبيعات",
  delivered: "حجوزات مسلّمة",
  undelivered: "حجوزات لم تستلم",
  cancelled: "حجوزات ملغاة",
  stockMovements: "حركات مخزن",
  ready: "جاهزة",
  waiting: "بانتظار المخزون",
  received: "وارد",
  stockOut: "سحب",
  returns: "مرتجعات",
  exchanges: "استبدالات",
  refunds: "عمليات الاسترداد",
  reservations: "الحجوزات",
  allMovements: "حركات المخزن",
};

/** Chart / legend colors by report metric key (frontend only). */
export const REPORT_METRIC_COLORS = {
  sales: "#f5af52",
  delivered: "#10b981",
  undelivered: "#f5af52",
  cancelled: "#e11d48",
  received: "#14b8a6",
  stockOut: "#ea580c",
  allMovements: "#8b5cf6",
  movements: "#8b5cf6",
  stockMovements: "#8b5cf6",
  returns: "#d946ef",
  exchanges: "#6366f1",
  refunds: "#f43f5e",
  reservations: "#f5af52",
  ready: "#10b981",
  waiting: "#06b6d4",
  branches: "#64748b",
};

export const DEFAULT_METRIC_COLOR = "#94a3b8";

export const UNSPECIFIED_LABEL = "غير محدد";

export const getLabel = (map, key, fallback = key || "—") => {
  if (key == null || key === "") return fallback;
  const normalized = String(key);
  return map[normalized] || map[normalized.toUpperCase()] || fallback;
};

export const getReservationStatusLabel = (status) =>
  getLabel(RESERVATION_STATUS_LABELS, status);

export const getSaleStatusLabel = (status) =>
  getLabel(SALE_STATUS_LABELS, status);

export const getSaleStatusSeverity = (status) =>
  getStatusTagSeverity("sale", status);

export const getStockMovementLabel = (type) =>
  getLabel(STOCK_MOVEMENT_LABELS, String(type || "").toUpperCase());

export const getStockOperationLabel = (type) =>
  getLabel(STOCK_OPERATION_LABELS, String(type || "").toUpperCase());

export const getStudentOperationLabel = (type) =>
  getLabel(STUDENT_OPERATION_LABELS, String(type || "").toUpperCase());

export const getStockMovementColor = (type) =>
  STOCK_MOVEMENT_COLORS[String(type || "").toUpperCase()] || DEFAULT_METRIC_COLOR;


export const getTransactionTypeLabel = (type) =>
  getLabel(TRANSACTION_TYPE_LABELS, String(type || "").toUpperCase());

export const getReportMetricColor = (key) =>
  REPORT_METRIC_COLORS[key] || DEFAULT_METRIC_COLOR;

export const getAvailabilityLabel = (value) => {
  if (value === true || value === "AVAILABLE" || value === "available") {
    return AVAILABILITY_LABELS.AVAILABLE;
  }
  if (value === false || value === "UNAVAILABLE" || value === "unavailable") {
    return AVAILABILITY_LABELS.UNAVAILABLE;
  }
  return getLabel(AVAILABILITY_LABELS, value, String(value || "—"));
};

export const buildExchangeDiffLabels = (comparison) => {
  const kind = comparison?.kind || "same";
  const meta = EXCHANGE_DIFF_META[kind] || EXCHANGE_DIFF_META.same;
  const amount = comparison?.absoluteDifference ?? Math.abs(comparison?.difference || 0);
  return {
    title: meta.title,
    diffLabel: meta.diffLabel,
    confirmText: meta.confirmText(amount),
  };
};

export const formatLowStockNotification = (item) => {
  const product = item?.productName || "منتج";
  const branch = item?.branchName || "—";
  const available = item?.availableQuantity ?? 0;
  const threshold = item?.threshold ?? 0;
  return {
    title: "تنبيه نقص مخزون",
    message: `${product} في فرع ${branch} — المتاح ${available} (حد التنبيه ${threshold})`,
  };
};
