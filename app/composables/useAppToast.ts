import { useToast } from "primevue/usetoast";

export const useAppToast = () => {
  const toast = useToast();

  const showError = (detail, summary = "خطأ") => {
    toast.add({
      severity: "error",
      summary,
      detail: detail || "حدث خطأ غير متوقع.",
      life: 4500,
    });
  };

  const showSuccess = (detail, summary = "تم بنجاح") => {
    toast.add({
      severity: "success",
      summary,
      detail: detail || "تمت العملية بنجاح.",
      life: 3500,
    });
  };

  return { toast, showError, showSuccess };
};
