import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { supabase } from "./lib/supabase";

// ONLY enable mocking in development AND if the file exists
if (import.meta.env.DEV) {
  import("./mocks/browser")
    .then(({ worker }) => worker.start())
    .catch(() => console.log("MSW not available - skipping mock"));
}

// Wait for Supabase session BEFORE rendering
supabase.auth.getSession().then(() => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <DarkModeProvider>
          <App />
        </DarkModeProvider>
      </StrictMode>,
    );
  }
});
