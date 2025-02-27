// Toast utility for showing notifications

type ToastType = "success" | "error" | "info" | "warning";

const createToast = (message: string, type: ToastType) => {
  // In a real app, you'd use a proper toast library
  // like react-toastify or react-hot-toast
  console.log(`Toast (${type}):`, message);

  // Only show alerts for errors to avoid too many popups during development
  if (type === "error") {
    alert(`Error: ${message}`);
  }
};

export const toast = {
  success: (message: string) => createToast(message, "success"),
  error: (message: string) => createToast(message, "error"),
  info: (message: string) => createToast(message, "info"),
  warning: (message: string) => createToast(message, "warning"),
};
