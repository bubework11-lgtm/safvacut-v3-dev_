import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { supabase } from "./lib/supabase";

// ONLY TRY TO LOAD MSW IN DEV — AND IF IT FAILS, WE DON'T CARE
if (import.meta.env.DEV) {
  import("./mocks/browser")
    .then(({ worker }) => worker.start())
    .catch(() => null); // ← SILENTLY IGNORE IF FILE DOESN'T EXIST
}

// THIS IS THE REAL FIX — WAIT FOR SUPABASE SESSION
supabase.auth.getSession().then(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  createRoot(rootElement).render(
    <StrictMode>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </StrictMode>,
  );
});
