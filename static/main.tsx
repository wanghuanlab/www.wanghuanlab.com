import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import { I18nProvider } from "../app/lib/i18n";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <Home />
    </I18nProvider>
  </StrictMode>,
);
