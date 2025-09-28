import { setupWorker } from "msw/browser"; // <-- CORRECT: Use 'msw/browser'
import { handlers } from "./handlers";

// The rest of the code remains the same
export const worker = setupWorker(...handlers);

// Start the worker only in development
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: "bypass",
  });
}