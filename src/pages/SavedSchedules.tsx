import { useState } from "react";
import { createPortal } from "react-dom";
import html2pdf from "html2pdf.js";
import ScheduleSnippet from "../components/ScheduleSnippet";
import ScheduleExportPreview from "../components/ScheduleExportPreview";
import { Activity, SavedSchedule } from "../types";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import "../CSS/SavedSchedules.css";

interface Props {
  activities: Activity[];
  onLoad: (map: [string, string][], scheduleId: string, name: string) => void;
}

const SavedSchedules: React.FC<Props> = ({ activities, onLoad }) => {
  const { schedules, deleteSchedule } = useSavedSchedules();
  const [renderedExport, setRenderedExport] = useState<React.ReactNode | null>(
    null
  );
  const handleExport = (s: SavedSchedule) => {
    const map = new Map(s.data);

    // Inject the export component invisibly into the DOM
    setRenderedExport(
      <div style={{ display: "none" }}>
        <ScheduleExportPreview
          slotToActivityMap={map}
          activities={activities}
        />
      </div>
    );

    // Laisse le temps au DOM de se mettre à jour, puis exporte
    setTimeout(() => {
      const element = document.getElementById("full-export");
      if (element) {
        html2pdf()
          .from(element)
          .set({
            margin: 0.5,
            filename: `${s.name}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
          })
          .save()
          .then(() => setRenderedExport(null)); // Clean up
      }
    }, 100);
  };

  return (
    <div className="saved-schedules">
      <h3>Mes emplois du temps sauvegardés</h3>
      <div className="snippet-grid">
        {schedules.map((s) => (
          <div key={s.id} className="snippet-card">
            <h4>{s.name}</h4>

            <ScheduleSnippet
              title=""
              slotToActivityMap={new Map(s.data)}
              activities={activities}
              onClick={() => onLoad(s.data, s.id, s.name)}
            />

            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              <button onClick={() => deleteSchedule(s.id)}>Supprimer</button>
              <button onClick={() => handleExport(s)}>Exporter en PDF</button>
            </div>
          </div>
        ))}
      </div>
      {renderedExport &&
        createPortal(
          renderedExport,
          document.getElementById("export-container")!
        )}
    </div>
  );
};

export default SavedSchedules;
