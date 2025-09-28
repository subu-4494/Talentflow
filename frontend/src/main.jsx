import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { worker } from "./lib/msw/browser";
import { seedIfEmpty } from "./lib/seed";

// Start MSW worker in dev only
if (import.meta.env.DEV) {
  worker.start().then(() => {
    console.log(" MSW worker started");
  });
}

// Seed DB if empty
seedIfEmpty();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
