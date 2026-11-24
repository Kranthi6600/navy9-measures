"use client";

import { startTransition, useActionState } from "react";
import type { ActionState } from "@/lib/types";

// Submits via onSubmit instead of <form action> so React doesn't reset
// uncontrolled inputs when the action returns a validation error.
export function useActionForm(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
) {
  const [state, formAction, pending] = useActionState(action, undefined);
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }
  return { state, onSubmit, pending };
}
