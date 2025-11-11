import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { supabase } from "./lib/supabase";

// NO MSW. NO MOCKS. NO IMPORTS. NO ERRORS.
// MSW belongs in vite.config.ts or setupTests.ts — NOT main.tsx

// Wait for Supabase session — this fixes #311 hydration error
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
