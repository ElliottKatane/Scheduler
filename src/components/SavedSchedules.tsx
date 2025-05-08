import ScheduleSnippet from "./ScheduleSnippet";
import { Activity } from "../types";
import { useSavedSchedules } from "../hooks/useSavedSchedules";
import "../CSS/SavedSchedules.css";

interface Props {
  activities: Activity[];
  onLoad: (map: Map<string, string>) => void;
}

const SavedSchedules: React.FC<Props> = ({ activities, onLoad }) => {
  const { schedules, deleteSchedule } = useSavedSchedules();

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
              onClick={() => onLoad(new Map(s.data))}
            />
            <button onClick={() => deleteSchedule(s.id)}>Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedSchedules;
