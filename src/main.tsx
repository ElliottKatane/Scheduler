import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ActivityProvider } from "./context/ActivityContext";
import { SavedSchedulesProvider } from "./context/SavedSchedulesContext";
import { CurrentScheduleProvider } from "./context/CurrentScheduleContext";
import { BooksAndMoviesProvider } from "./context/BooksAndMoviesContext";
import { LabelsProvider } from "./context/LabelsContext";
import "./index.css";
import App from "./App.tsx";
import "./firebase";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ActivityProvider>
      <SavedSchedulesProvider>
        <CurrentScheduleProvider>
          <BooksAndMoviesProvider>
            <LabelsProvider>
              <App />
            </LabelsProvider>
          </BooksAndMoviesProvider>
        </CurrentScheduleProvider>
      </SavedSchedulesProvider>
    </ActivityProvider>
  </StrictMode>
);
