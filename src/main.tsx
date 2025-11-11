import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { supabase } from "./lib/supabase";

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-gray-900 dark:to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
