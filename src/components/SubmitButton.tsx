"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className = "btn-primary",
  pending,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const isPending = pending ?? status.pending;
  return (
    <button type="submit" className={className} disabled={isPending}>
      {isPending ? pendingText : children}
    </button>
  );
}
