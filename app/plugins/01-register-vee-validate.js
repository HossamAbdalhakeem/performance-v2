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
export default defineNuxtPlugin((NuxtApp) => {
  defineRule("required", (value, [target], ctx) => {
    const fieldName = ctx.field || "Field";
    const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

    // Handle arrays (e.g., tags)
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${capitalizedField} is Required`;
      }
      return true;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? `${capitalizedField} is Required` : true;
    }

    // Handle objects (e.g., main_photo with file_url)
    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Check if it's an image object with file_url
      if (value.file_url !== undefined) {
        if (
          !value.file_url ||
          (typeof value.file_url === "string" && !value.file_url.trim())
        ) {
          return `${capitalizedField} is Required`;
        }
        return true;
      }
      // For other objects, check if it's empty
      if (Object.keys(value).length === 0) {
        return `${capitalizedField} is Required`;
      }
      return true;
    }
    // Handle strings
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${capitalizedField} is Required`;
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
    if (!value) return "Please enter your full name";
    const split = value?.split(" ");
    if (split.length > 1 && split[1].length) {
      return true;
    }
    return "Please enter your full name";
  });
  defineRule("url", (value) => {
    if (!value || (typeof value === "string" && !value.trim())) return true; // required handles empty
    const trimmed = typeof value === "string" ? value.trim() : String(value);
    try {
      const u = new URL(trimmed);
      return u.protocol === "http:" || u.protocol === "https:"
        ? true
        : "Must be a valid URL";
    } catch {
      return "Must be a valid URL";
    }
  });
});
