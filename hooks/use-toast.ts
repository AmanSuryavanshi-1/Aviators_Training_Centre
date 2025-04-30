import * as React from "react";
import { ToastAction } from "@/components/ui/toast"; // Keep this import

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = {
  variant?: "default" | "destructive";
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement<typeof ToastAction>;
  duration?: number;
  open?: boolean;
};

type Toast = Omit<ToasterToast, "id">
export type { Toast };

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return `toast-${count}`;
}

type ToastActionType = {
  type: 'ADD_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST' | 'REMOVE_TOAST';
  toast?: ToasterToast;
  toastId?: string
}

const toastReducer = (state: ToasterToast[], action: ToastActionType): ToasterToast[] => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [action.toast!, ...state].slice(0, TOAST_LIMIT);
    case 'UPDATE_TOAST':
      return state.map((t) => (t.id === action.toast?.id ? { ...t, ...action.toast } : t));
    case 'DISMISS_TOAST':
      return state.map((t) => (t.id === action.toastId ? { ...t, open: false } : t));
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.toastId);
    default:
      return state;
  }
}

export function useToast() {
  const [toasts, dispatch] = React.useReducer(toastReducer, []);

  return {
    toasts,
    toast: (toast: Toast) => dispatch({ type: 'ADD_TOAST', toast: { ...toast, id: genId(), open: true } }),
    dismissToast: (toastId: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    removeToast: (toastId: string) => dispatch({ type: 'REMOVE_TOAST', toastId }),
    updateToast: (toast: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast })
  };
}

export type { Toast };













