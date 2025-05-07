import { useState, useEffect } from "react";
import ScheduleSnippet from "./ScheduleSnippet";
import { Activity, SavedSchedule } from "../types";

interface Props {
  activities: Activity[];
  onLoad: (map: Map<string, string>) => void;
  newSchedule?: SavedSchedule | null;
  onCreateNewRequest?: () => void;
}

const SavedSchedules: React.FC<Props> = ({
  activities,
  onLoad,
  newSchedule,
  onCreateNewRequest,
}) => {
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("schedules");
    if (saved) {
      const parsed = JSON.parse(saved);
      const restored = parsed.map((s: any) => ({
        ...s,
        data: new Map(s.data),
      }));
      setSchedules(restored);
    }
  }, []);

  // Save to localStorage on update
  useEffect(() => {
    localStorage.setItem("schedules", JSON.stringify(schedules));
  }, [schedules]);
  useEffect(() => {
    if (newSchedule) {
      setSchedules((prev) => [...prev, newSchedule]);
    }
  }, [newSchedule]);

  const handleDelete = (id: string) => {
    if (confirm("Supprimer cet emploi du temps ?")) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="saved-schedules">
      <h3>Mes emplois du temps sauvegardés</h3>
      <div className="snippet-grid">
        {schedules.map((s) => (
          <div key={s.id}>
            <ScheduleSnippet
              title={s.name}
              slotToActivityMap={new Map(s.data)} // ✅ on reconstruit la Map ici
              activities={activities}
              onClick={() => onLoad(new Map(s.data))}
            />
            <button onClick={() => handleDelete(s.id)}>Supprimer</button>
          </div>
        ))}

        <div className="snippet-new">
          <div className="slot-mini">+</div>
          <button
            onClick={() => onCreateNewRequest?.()} // ✅ redirige sans créer
          >
            Nouvel emploi du temps
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedSchedules;
