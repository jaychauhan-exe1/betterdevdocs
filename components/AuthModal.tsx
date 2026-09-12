"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import AuthForm from "./AuthForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  badge?: string;
  defaultMode?: "sign-in" | "sign-up";
}

export default function AuthModal({
  isOpen,
  onClose,
  title,
  defaultMode = "sign-in",
}: AuthModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="bg-card border border-border rounded-3xl p-6 sm:p-7 max-w-md w-full relative overflow-hidden shadow-2xl space-y-4 text-center my-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-white rounded-full hover:bg-secondary/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Minimal Header */}
            {title && (
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight pt-1">
                {title}
              </h3>
            )}

            {/* Embedded Custom Auth Form */}
            <AuthForm defaultMode={defaultMode} onSuccess={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
