import { WEEK_DAYS, TIME_SLOTS } from "../constants";
import "../CSS/ScheduleSnippet.css";

interface Props {
  slotToActivityMap: Map<string, string>;
  activities: { id: string; color: string }[];
  onClick?: () => void;
  title?: string;
}

const ScheduleSnippet: React.FC<Props> = ({
  slotToActivityMap,
  activities,
  onClick,
  title = "Emploi du temps",
}) => {
  const getColor = (slotId: string) => {
    const activityId = slotToActivityMap.get(slotId);
    const activity = activities.find((a) => a.id === activityId);
    return activity?.color || "#ffffff";
  };

  return (
    <div
      className="schedule-snippet"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <h5>{title}</h5>
      <div className="grid-snippet">
        {TIME_SLOTS.map((hour) =>
          WEEK_DAYS.map((_, dayIndex) => {
            const slotId = `${hour}-${dayIndex}`;
            const bg = getColor(slotId);
            return (
              <div
                key={slotId}
                className="slot-mini"
                style={{ backgroundColor: bg }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScheduleSnippet;
