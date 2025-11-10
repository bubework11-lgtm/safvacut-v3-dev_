import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { supabase } from "./lib/supabase";

async function enableMocking() {
  if (import.meta.env.DEV) {
    const { worker } = await import("./mocks/browser");
    return worker.start();
  }
  return Promise.resolve();
}

enableMocking().then(() => {
  // Wait for Supabase to know if user is logged in
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
});
