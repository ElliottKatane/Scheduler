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

    setRenderedExport(
      <div style={{ display: "none" }}>
        <ScheduleExportPreview
          slotToActivityMap={map}
          activities={activities}
        />
      </div>
    );

    setTimeout(() => {
      const element = document.getElementById("full-export");
      if (element) {
        html2pdf()
          .from(element)
          .set({
            margin: 0.5,
            filename: `${s.name}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 1.2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          })
          .save()
          .then(() => setRenderedExport(null));
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
              enableMergedView={true}
            />

            <div className="snippet-actions">
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
