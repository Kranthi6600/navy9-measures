"use client";

import { useEffect, useRef } from "react";
import type { ActionState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

export function PhotoUpload({
  action,
  enabled,
  hasPhoto,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  enabled: boolean;
  hasPhoto: boolean;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  if (!enabled) {
    return (
      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Photo uploads are disabled. Set the CLOUDINARY_* environment variables to enable them.
      </p>
    );
  }

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} className="space-y-2">
      <input className="input" name="photo" type="file" accept="image/*" capture="environment" required aria-label="Photo" />
      <SubmitButton pending={pending} pendingText="Uploading…" className="btn w-full">
        {hasPhoto ? "Replace photo" : "Upload photo"}
      </SubmitButton>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">{state.success}</p>}
    </form>
  );
}
