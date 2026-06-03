import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type ToastTone = "info" | "success" | "error";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  push: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const toastToneStyles: Record<ToastTone, string> = {
  info: "border-border bg-card",
  success: "border-primary/50 bg-card",
  error: "border-red-500/50 bg-card",
};

const ToastContext = createContext<ToastContextValue>({
  push: () => undefined,
  dismiss: () => undefined,
});

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current, { id, tone: input.tone ?? "info", ...input }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      push,
      dismiss,
    }),
    [dismiss, push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-panel ${toastToneStyles[toast.tone ?? "info"]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description === undefined ? null : (
                  <p className="text-sm text-muted-foreground">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                aria-label="关闭提示"
                className="text-xs text-muted-foreground transition hover:text-foreground"
                onClick={() => dismiss(toast.id)}
              >
                关闭
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
