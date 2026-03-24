import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "../components/UI/Toast";
import { Modal } from "../components/UI/Modal";

interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ModalData {
  title: string;
  content: ReactNode;
  isOpen: boolean;
}

interface UIContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  openModal: (title: string, content: ReactNode) => void;
  closeModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [modal, setModal] = useState<ModalData>({ title: "", content: null, isOpen: false });

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const openModal = useCallback((title: string, content: ReactNode) => {
    setModal({ title, content, isOpen: true });
  }, []);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <UIContext.Provider value={{ showToast, openModal, closeModal }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast.message} type={toast.type} />
          ))}
        </AnimatePresence>
      </div>
      <Modal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        onClose={closeModal}
      >
        {modal.content}
      </Modal>
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
}
