import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastActionsType {
  showToast: (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number,
    action?: ToastAction,
  ) => void;
  showUndo: (title: string, onUndo: () => void) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

interface ToastStateType {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

type ToastContextType = ToastActionsType & ToastStateType;

const UNDO_TOAST_ID = "toast-undo";
const UNDO_DURATION_MS = 6000;
const DEFAULT_DURATION_MS = 4500;
const ERROR_DURATION_MS = 6000;

const ToastActionsContext = createContext<ToastActionsType | undefined>(undefined);
const ToastStateContext = createContext<ToastStateType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const enqueue = useCallback(
    (toast: ToastMessage) => {
      const pending = timersRef.current.get(toast.id);
      if (pending !== undefined) clearTimeout(pending);

      setToasts((prev) => [...prev.filter((t) => t.id !== toast.id), toast]);

      if (toast.duration !== undefined && toast.duration > 0) {
        timersRef.current.set(
          toast.id,
          setTimeout(() => removeToast(toast.id), toast.duration),
        );
      }
    },
    [removeToast],
  );

  const showToast = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      duration: number = DEFAULT_DURATION_MS,
      action?: ToastAction,
    ) => {
      enqueue({
        id: Math.random().toString(36).substring(2, 9),
        type,
        title,
        message,
        duration,
        action,
      });
    },
    [enqueue],
  );

  const showUndo = useCallback(
    (title: string, onUndo: () => void) => {
      enqueue({
        id: UNDO_TOAST_ID,
        type: "info",
        title,
        duration: UNDO_DURATION_MS,
        action: { label: "Annuler", onClick: onUndo },
      });
    },
    [enqueue],
  );

  const success = useCallback(
    (title: string, message?: string) => showToast("success", title, message),
    [showToast],
  );

  const error = useCallback(
    (title: string, message?: string) =>
      showToast("error", title, message, ERROR_DURATION_MS),
    [showToast],
  );

  const info = useCallback(
    (title: string, message?: string) => showToast("info", title, message),
    [showToast],
  );

  const actions = useMemo(
    () => ({ showToast, showUndo, success, error, info }),
    [showToast, showUndo, success, error, info],
  );

  const state = useMemo(() => ({ toasts, removeToast }), [toasts, removeToast]);

  return (
    <ToastActionsContext.Provider value={actions}>
      <ToastStateContext.Provider value={state}>
        {children}
      </ToastStateContext.Provider>
    </ToastActionsContext.Provider>
  );
}

/**
 * Émetteur de toasts. La valeur du contexte est stable : un composant qui ne
 * fait qu'émettre ne se re-rend pas quand un toast apparaît. À préférer à
 * `useToast`, qui expose aussi la liste et donc réabonne à chaque toast.
 */
export function useToastActions(): ToastActionsType {
  const context = useContext(ToastActionsContext);
  if (!context) {
    throw new Error(
      "useToastActions doit être utilisé à l'intérieur de ToastProvider",
    );
  }
  return context;
}

export function useToast(): ToastContextType {
  const actions = useContext(ToastActionsContext);
  const state = useContext(ToastStateContext);
  if (!actions || !state) {
    throw new Error("useToast doit être utilisé à l'intérieur de ToastProvider");
  }
  return { ...actions, ...state };
}
