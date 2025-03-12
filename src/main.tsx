import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { SupabaseProvider } from "./components/context/SupabaseProvider";

// Initialize Tempo Devtools with error handling
try {
  const { TempoDevtools } = require("tempo-devtools");
  TempoDevtools.init();
} catch (error) {
  console.warn("Failed to initialize Tempo Devtools:", error);
}

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
