"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Button from "@/components/form/Button";
import Heading from "@/components/common/Heading";
import Text from "@/components/common/Text";

const ESCAPE_KEY = "Escape";
const TAB_KEY = "Tab";

interface ConfirmDialogProps {
  title: string;
  text: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  text,
  confirmLabel,
  cancelLabel,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const cancelUnlessConfirming = () => {
    if (!isConfirming) onCancel();
  };

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ESCAPE_KEY) {
        cancelUnlessConfirming();
        return;
      }
      if (event.key !== TAB_KEY) return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        ) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!dialogRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={cancelUnlessConfirming}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-line bg-surface p-6 text-left shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <Heading level={2} size="title" id={titleId}>
          {title}
        </Heading>
        <Text tone="muted">{text}</Text>
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            size="sm"
            disabled={isConfirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={isConfirming}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
