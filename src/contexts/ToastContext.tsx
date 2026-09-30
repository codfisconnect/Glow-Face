import React, { createContext, useContext, useState, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

export interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 9999,
          pointerEvents: "none"
        }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: toast.type === "error" ? "#C92A2A" : "var(--green-deeper)",
              color: "var(--ivory)",
              padding: "12px 20px",
              borderRadius: "var(--radius-full)",
              boxShadow: "var(--shadow-lg)",
              fontSize: "0.88rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              animation: "fadeIn 0.2s ease-out"
            }}
          >
            <span>{toast.type === "error" ? "⚠️" : "✨"}</span>
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
