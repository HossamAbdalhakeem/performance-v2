import { formatMoney, formatDateTime } from "~/utils/format";
import { PAYMENT_METHOD_LABELS } from "~/utils/paymentMethods";
import { getUserRoleLabel } from "~/enums/userRole";
import { getStatusTagMeta } from "~/utils/statusTags";

const toMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/**
 * Map Nest GET /reservations row (camelCase + includes + live pricing) to table/UI.
 * Reads only backend keys — no snake_case / legacy fallbacks.
 */
export const normalizeReservation = (item = {}) => {
  const quantity = item.quantity ?? 1;
  const paidAmount = toMoney(item.paidAmount);
  const sellingPrice = toMoney(
    item.currentUnitPrice ?? item.product?.sellingPrice ?? item.reservationPrice,
  );
  const totalAmount = toMoney(
    item.currentTotalAmount ?? item.totalAmount ?? sellingPrice * quantity,
  );
  const remainingAmount = toMoney(
    item.remainingAmount ?? Math.max(totalAmount - paidAmount, 0),
  );
  const status = String(item.status || "").toUpperCase();
  const statusMeta = getStatusTagMeta("reservation", status);
  const paymentMethod = String(item.paymentMethod || "CASH").toUpperCase();
  const createdByName = item.createdBy?.fullName || "-";
  const createdByRole = item.createdBy?.role || "";

  return {
    ...item,
    id: item.id,
    productId: item.productId ?? item.product?.id ?? null,
    branchId: item.branchId ?? item.branch?.id ?? null,
    reservationNumber: item.reservationNumber,
    quantity,
    status,
    totalAmount,
    paidAmount,
    remainingAmount,
    hasRemaining: remainingAmount > 0,
    sellingPrice,
    createdAt: item.createdAt ?? null,
    createdAtLabel: formatDateTime(item.createdAt, { empty: "—" }),
    studentName: item.student?.name || "-",
    phone: item.student?.phone || "",
    productName: item.product?.name || "-",
    teacherName: item.product?.teacher?.name || "-",
    branchName: item.branch?.name || "-",
    createdByName,
    createdByRole,
    createdByRoleLabel: getUserRoleLabel(createdByRole),
    createdByLabel: createdByName,
    sellingPriceLabel: sellingPrice > 0 ? formatMoney(sellingPrice) : "—",
    paidAmountLabel: formatMoney(paidAmount),
    remainingAmountLabel: formatMoney(remainingAmount),
    paymentId: item.paymentId ?? null,
    paymentMethod,
    paymentMethodLabel:
      item.paymentMethodLabel ||
      PAYMENT_METHOD_LABELS[paymentMethod] ||
      paymentMethod,
    proofReference: item.proofReference ?? null,
    proofUrl: item.proofUrl ?? null,
    hasProof: Boolean(item.hasProof),
    statusLabel:
      remainingAmount > 0 && status === "READY"
        ? "جاهز · متبقي مبلغ"
        : statusMeta.label,
  };
};
