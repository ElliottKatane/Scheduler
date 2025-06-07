import { useState } from "react";
import { createPortal } from "react-dom";
import html2pdf from "html2pdf.js";
import ScheduleSnippet from "../components/ScheduleSnippet";
import ScheduleExportPreview from "../components/ScheduleExportPreview";
import { Activity, SavedSchedule } from "../types";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import Button from "../UI/Button";

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
    <div className="saved-schedules p-4">
      <h3 className="text-xl font-bold mb-4">
        Mes emplois du temps sauvegardés
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-[400px] text-center overflow-hidden flex flex-col items-center space-y-4"
          >
            {editingId === s.id ? (
              <input
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center text-lg font-semibold w-full"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => confirmRename(s.id)}
                onKeyDown={(e) => e.key === "Enter" && confirmRename(s.id)}
                autoFocus
              />
            ) : (
              <h4 className="text-lg font-semibold">{s.name}</h4>
            )}

            <div className="w-full max-w-full overflow-x-auto scale-[0.8] origin-top">
              <ScheduleSnippet
                title=""
                slotToActivityMap={new Map(s.data)}
                activities={activities}
                onClick={() => onLoad(s.data, s.id, s.name)}
                enableMergedView={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="danger" onClick={() => deleteSchedule(s.id)}>
                Supprimer
              </Button>
              <Button variant="primary" onClick={() => handleExport(s)}>
                Exporter en PDF
              </Button>
              <Button variant="secondary" onClick={() => handleExport(s, true)}>
                Smart Export
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleRename(s.id, s.name)}
              >
                Renommer
              </Button>
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
