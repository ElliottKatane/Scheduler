import { useState, useEffect } from "react";
import ScheduleSnippet from "./ScheduleSnippet";
import { Activity, SavedSchedule } from "../types";

interface Props {
  activities: Activity[];
  onLoad: (map: Map<string, string>) => void;
  newSchedule?: SavedSchedule | null;
}

const SavedSchedules: React.FC<Props> = ({
  activities,
  onLoad,
  newSchedule,
}) => {
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("schedules");
    if (saved) {
      const parsed = JSON.parse(saved);
      const restored = parsed.map((s: any) => ({
        ...s,
        data: new Map(s.data), // ✅ reconstruction du Map
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

  const handleAddNew = () => {
    const name = prompt("Nom de l'emploi du temps :") || "Sans nom";
    const newSchedule: SavedSchedule = {
      id: crypto.randomUUID(),
      name,
      data: [],
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

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

        <div className="snippet-new" onClick={handleAddNew}>
          <div className="slot-mini" style={{ backgroundColor: "#eee" }}>
            +
          </div>
          <p>Nouvel emploi du temps</p>
        </div>
      </div>
    </div>
  );
};

export default SavedSchedules;
