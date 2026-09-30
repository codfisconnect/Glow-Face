import React, { useEffect } from "react";
import { X } from "lucide-react";
import "./Modal.css";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md"
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="gf-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`gf-modal gf-modal--${size}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="gf-modal__header">
          {title && <h3 className="gf-modal__title">{title}</h3>}
          <button
            className="gf-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="gf-modal__body">{children}</div>
      </div>
    </div>
  );
};
