import { WEEK_DAYS } from "../constants";
import ManageActivities from "./ManageActivities";

interface TimeSlotPreviewProps {
  selectedSlots: { day: string; startHour: string; endHour: string }[];
}

const TimeSlotPreview: React.FC<TimeSlotPreviewProps> = ({ selectedSlots }) => {
  return (
    <div>
      <h4>Selected Slots</h4>
      <ul>
        {selectedSlots.map((slot, index) => (
          <li key={index}>
            {WEEK_DAYS[parseInt(slot.day)]} : {slot.startHour} - {slot.endHour}
          </li>
        ))}
      </ul>
      <button>Faire une nouvelle sélection</button>
      <div>
        <ManageActivities />
      </div>
    </div>
  );
};

export default TimeSlotPreview;
