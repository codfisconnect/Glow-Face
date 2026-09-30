import React, { createContext, useContext, useState, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast container overlay */}
      <div className="toast-container" style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none"
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              pointerEvents: "auto",
              padding: "12px 20px",
              borderRadius: "100px",
              background: toast.type === "error" ? "#C92A2A" : (toast.type === "info" ? "#1F4D3A" : "#123C2A"),
              color: "#FFFDF9",
              fontSize: "0.88rem",
              fontWeight: 500,
              boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <span>{toast.type === "error" ? "⚠️" : (toast.type === "info" ? "ℹ️" : "✓")}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};