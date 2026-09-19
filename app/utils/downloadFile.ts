/** Trigger a browser file download from a Blob, then revoke the object URL. */
export const downloadBlob = (blob: Blob, filename: string) => {
  if (!import.meta.client) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/** Sanitize a label for use in a download filename. */
export const sanitizeDownloadFilename = (value: string, fallback = "file") => {
  const cleaned = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || fallback;
};
