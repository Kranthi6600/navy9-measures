"use client";

import { useEffect, useRef } from "react";
import type { ActionState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";
import { useActionForm } from "./useActionForm";

export function PhotoUpload({
  action,
  enabled,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  enabled: boolean;
}) {
  const { state, onSubmit, pending } = useActionForm(action);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  if (!enabled) {
    return (
      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Photo uploads are disabled. Set the CLOUDINARY_* environment variables to enable them.
      </p>
    );
  }

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label" htmlFor="photo">Photo</label>
        <input className="input" id="photo" name="photo" type="file" accept="image/*" capture="environment" required />
      </div>
      <div className="flex-1">
        <label className="label" htmlFor="caption">Caption</label>
        <input className="input" id="caption" name="caption" placeholder="e.g. Front view" />
      </div>
      <SubmitButton pending={pending} pendingText="Uploading…">Upload</SubmitButton>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">{state.success}</p>}
    </form>
  );
}
