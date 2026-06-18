import type { ToastOptions } from 'react-toastify';
import { toast } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, { ...defaultOptions, ...options });

export const toastError = (message: string, options?: ToastOptions) =>
  toast.error(message, { ...defaultOptions, autoClose: 6000, ...options });

export const toastInfo = (message: string, options?: ToastOptions) =>
  toast.info(message, { ...defaultOptions, ...options });

export const toastWarning = (message: string, options?: ToastOptions) =>
  toast.warning(message, { ...defaultOptions, ...options });

export const toastLoading = (message: string, options?: ToastOptions) =>
  toast.loading(message, { ...defaultOptions, autoClose: false, ...options });

export const toastUpdate = (
  toastId: any,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'success'
) =>
  toast.update(toastId, {
    render: message,
    type,
    isLoading: false,
    autoClose: 4000,
    closeButton: true,
  });

export { toast };
