import { defineRule } from "vee-validate";
import {
  required,
  confirmed,
  email,
  min,
  min_value,
  max_value,
  numeric,
  alpha,
  between,
} from "@vee-validate/rules";

export default defineNuxtPlugin(() => {
  defineRule("required", (value, _params, ctx) => {
    const fieldName = ctx.label || ctx.field || "الحقل";
    const message = `${fieldName} مطلوب`;

    if (Array.isArray(value)) {
      return value.length === 0 ? message : true;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? message : true;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (value.file_url !== undefined) {
        if (
          !value.file_url ||
          (typeof value.file_url === "string" && !value.file_url.trim())
        ) {
          return message;
        }
        return true;
      }

      if (Object.keys(value).length === 0) {
        return message;
      }
      return true;
    }

    if (value == null || (typeof value === "string" && !value.trim())) {
      return message;
    }

    return true;
  });

  defineRule("email", email);
  defineRule("min", min);
  defineRule("alpha", alpha);
  defineRule("confirmed", confirmed);
  defineRule("numeric", numeric);
  defineRule("min_value", min_value);
  defineRule("max_value", max_value);
  defineRule("between", between);

  defineRule("fullName", (value) => {
    if (!value) return "من فضلك أدخل الاسم بالكامل";
    const split = String(value).split(" ");
    if (split.length > 1 && split[1].length) {
      return true;
    }
    return "من فضلك أدخل الاسم بالكامل";
  });

  defineRule("url", (value) => {
    if (!value || (typeof value === "string" && !value.trim())) return true;
    const trimmed = typeof value === "string" ? value.trim() : String(value);
    try {
      const u = new URL(trimmed);
      return u.protocol === "http:" || u.protocol === "https:"
        ? true
        : "يجب إدخال رابط صالح";
    } catch {
      return "يجب إدخال رابط صالح";
    }
  });
});
