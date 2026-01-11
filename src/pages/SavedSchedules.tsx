import { useState } from "react";
import { createPortal } from "react-dom";
import html2pdf from "html2pdf.js";
import ScheduleSnippet from "../components/ScheduleSnippet";
import ScheduleExportPreview from "../components/ScheduleExportPreview";
import { Activity, SavedSchedule } from "../types";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import Button from "../UI/Button";
import { addDays, formatDateFR, parseISODate } from "../constants";

interface Props {
  activities: Activity[];
  onLoad: (schedule: SavedSchedule) => void; // <-- NEW
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
      if (!element) return;

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
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">
        Mes emplois du temps sauvegardés
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="w-full max-w-[420px] mx-auto rounded-2xl bg-gray-900/90 border border-white/10 shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 text-center space-y-2">
              {editingId === s.id ? (
                <input
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-lg font-semibold bg-white text-gray-900"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => confirmRename(s.id)}
                  onKeyDown={(e) => e.key === "Enter" && confirmRename(s.id)}
                  autoFocus
                />
              ) : (
                <h4 className="text-lg font-semibold text-white">{s.name}</h4>
              )}

              {s.weekStartDate ? (
                <p className="text-sm text-gray-300">
                  {formatDateFR(parseISODate(s.weekStartDate))} –{" "}
                  {formatDateFR(addDays(parseISODate(s.weekStartDate), 6))}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Semaine non définie</p>
              )}
            </div>

            {/* Snippet zone */}
            <div className="px-5 pb-5">
              <div className="w-full rounded-2xl bg-gray-950/30 border border-white/10 p-4">
                <div className="w-full rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="w-full flex justify-center">
                    <div className="w-[240px] sm:w-[260px] md:w-[280px]">
                      <ScheduleSnippet
                        title=""
                        slotToActivityMap={new Map(s.data)}
                        activities={activities}
                        onClick={() => onLoad(s)}
                        enableMergedView
                        cell={10}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="danger" onClick={() => deleteSchedule(s.id)}>
                  Supprimer
                </Button>

                <Button variant="primary" onClick={() => handleExport(s)}>
                  Exporter en PDF
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => handleExport(s, true)}
                >
                  PDF compact
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => handleRename(s.id, s.name)}
                >
                  Renommer
                </Button>
              </div>
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
