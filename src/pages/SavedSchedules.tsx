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
  const { schedules, deleteSchedule, updateScheduleName } = useSavedSchedules();
  const [renderedExport, setRenderedExport] = useState<React.ReactNode | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");

  const handleExport = (s: SavedSchedule, smart: boolean = false) => {
    const map = new Map(s.data);

    setRenderedExport(
      <div style={{ display: "none" }}>
        <ScheduleExportPreview
          slotToActivityMap={map}
          activities={activities}
          smart={smart}
        />
      </div>
    );

    setTimeout(() => {
      const element = document.getElementById("full-export");
      if (element) {
        html2pdf()
          .from(element)
          .set({
            margin: 0,
            filename: `${s.name}${smart ? "_smart" : ""}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          })
          .save()
          .then(() => setRenderedExport(null));
      }
    }, 100);
  };

  const handleRename = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const confirmRename = (id: string) => {
    if (newName.trim() !== "") {
      updateScheduleName(id, newName.trim());
    }
    setEditingId(null);
    setNewName("");
  };

  return (
    <div className="saved-schedules">
      <h3>Mes emplois du temps sauvegardés</h3>
      <div className="snippet-grid">
        {schedules.map((s) => (
          <div key={s.id} className="snippet-card">
            {editingId === s.id ? (
              <input
                className="rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => confirmRename(s.id)}
                onKeyDown={(e) => e.key === "Enter" && confirmRename(s.id)}
                autoFocus
              />
            ) : (
              <h4>{s.name}</h4>
            )}
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
              <button
                style={{ backgroundColor: "green", color: "white" }}
                onClick={() => handleExport(s, true)}
              >
                Smart Export
              </button>
              <button onClick={() => handleRename(s.id, s.name)}>
                Renommer
              </button>
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
