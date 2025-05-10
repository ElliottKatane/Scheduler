import ScheduleSnippet from "../components/ScheduleSnippet";
import { Activity } from "../types";
import { useSavedSchedules } from "../context/SavedSchedulesContext";
import "../CSS/SavedSchedules.css";
import html2pdf from "html2pdf.js";

interface Props {
  activities: Activity[];
  onLoad: (map: [string, string][], scheduleId: string, name: string) => void;
}

const SavedSchedules: React.FC<Props> = ({ activities, onLoad }) => {
  const { schedules, deleteSchedule } = useSavedSchedules();

  const exportToPDF = (id: string, name: string) => {
    const element = document.getElementById(`pdf-${id}`);
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `${name}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="saved-schedules">
      <h3>Mes emplois du temps sauvegardés</h3>
      <div className="snippet-grid">
        {schedules.map((s) => (
          <div key={s.id} className="snippet-card">
            <h4>{s.name}</h4>

            {/* Zone cible pour export PDF */}
            <div id={`pdf-${s.id}`}>
              <ScheduleSnippet
                title=""
                slotToActivityMap={new Map(s.data)}
                activities={activities}
                onClick={() => onLoad(s.data, s.id, s.name)}
              />
            </div>

            {/* Boutons */}
            <div
              style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              <button onClick={() => deleteSchedule(s.id)}>Supprimer</button>
              <button onClick={() => exportToPDF(s.id, s.name)}>
                Exporter en PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedSchedules;
