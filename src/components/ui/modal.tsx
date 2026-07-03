"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** true = painel lateral (drawer) em vez de modal central. */
  drawer?: boolean;
}

export function Modal({ open, onClose, title, description, children, className, drawer }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-50 flex", drawer ? "justify-end" : "items-center justify-center p-4")}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={drawer ? { x: "100%" } : { opacity: 0, scale: 0.95, y: 16 }}
            animate={drawer ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={drawer ? { x: "100%" } : { opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "relative z-10 border border-border bg-kyber-rich shadow-card",
              drawer
                ? "h-full w-full max-w-md overflow-y-auto p-6"
                : "max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6",
              className
            )}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                {title && <h2 className="font-display text-lg font-semibold text-kyber-white">{title}</h2>}
                {description && <p className="mt-1 text-sm text-kyber-gray">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="focus-ring rounded-lg p-1.5 text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
