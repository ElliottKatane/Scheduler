import { WEEK_DAYS } from "../constants";
import ManageActivities from "./ManageActivities";

interface TimeSlotPreviewProps {
  selectedSlots: Set<string>; // Acceptation de Set<string> au lieu de tableau
}

const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({ selectedSlots }) => {
  const formattedSlots = Array.from(selectedSlots).map((slotId) => {
    const [hour, day] = slotId.split("-");
    return {
      day: WEEK_DAYS[parseInt(day, 10)],
      startHour: parseInt(hour, 10),
      endHour: parseInt(hour, 10) + 1, // Supposition : chaque créneau dure 1h
    };
  });

  return (
    <div>
      <h4>Selected Slots</h4>
      <ul>
        {formattedSlots.map((slot, index) => (
          <li key={index}>
            {slot.day} : {slot.startHour}h - {slot.endHour}h
          </li>
        ))}
      </ul>
      <button>Faire une nouvelle sélection</button>
    </div>
  );
};

export default TimeSlotPreview;
