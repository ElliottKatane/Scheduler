import ScheduleSnippet from "./ScheduleSnippet";
import { Activity } from "../types";
import { useSavedSchedules } from "../hooks/useSavedSchedules";

interface Props {
  activities: Activity[];
  onLoad: (map: Map<string, string>) => void;
  onCreateNewRequest?: () => void;
}

const SavedSchedules: React.FC<Props> = ({
  activities,
  onLoad,
  onCreateNewRequest,
}) => {
  const { schedules, deleteSchedule } = useSavedSchedules();

  return (
    <div className="saved-schedules">
      <h3>Mes emplois du temps sauvegardés</h3>
      <div className="snippet-grid">
        {schedules.map((s) => (
          <div key={s.id}>
            <ScheduleSnippet
              title={s.name}
              slotToActivityMap={new Map(s.data)}
              activities={activities}
              onClick={() => onLoad(new Map(s.data))}
            />
            <button onClick={() => deleteSchedule(s.id)}>Supprimer</button>
          </div>
        ))}

        <div className="snippet-new">
          <div className="slot-mini">+</div>
          <button onClick={() => onCreateNewRequest?.()}>
            Nouvel emploi du temps
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedSchedules;
