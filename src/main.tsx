import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ActivityProvider } from "./context/ActivityContext";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ActivityProvider>
      <App />
    </ActivityProvider>
  </StrictMode>
);
