"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type Toast = { id: string; message: string; tone: "success" | "error" | "info" };
const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function show(message: string, tone: Toast["tone"] = "info") {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, tone }]);
    setTimeout(() => setToasts((items) => items.filter((toast) => toast.id !== id)), 3000);
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-soft ${
              toast.tone === "error" ? "bg-civic-red" : toast.tone === "success" ? "bg-civic-green" : "bg-civic-navy"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
