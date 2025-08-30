export function toErrorMessage(
  message: string,
  details?: unknown
) {
  return {
    error: {
      message,
      ...(details ? { details } : {})
    }
  };
}