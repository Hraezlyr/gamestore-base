import { useState } from "react";
import { HttpError } from "../api/errors";

export function useFormSubmission<T>(operation: (input: T) => Promise<void>) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});

  async function submit(input: T): Promise<boolean> {
    if (submitting) return false;
    setSubmitting(true);
    setError(null);
    setFields({});
    try {
      await operation(input);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo completar la operación.");
      setFields(cause instanceof HttpError ? cause.fields : {});
      return false;
    } finally {
      setSubmitting(false);
    }
  }
  return { submitting, error, fields, submit };
}
