"use client";

import { SubmitButton } from "./SubmitButton";

export function DeleteButton({
  action,
  confirmText,
  label = "Delete",
  className = "btn-danger",
}: {
  action: () => Promise<void>;
  confirmText: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <SubmitButton className={className} pendingText="Deleting…">
        {label}
      </SubmitButton>
    </form>
  );
}
