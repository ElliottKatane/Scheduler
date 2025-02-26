import { TIME_SLOTS, WEEK_DAYS } from "./constants";
import { useSelection } from "./hooks/useSelection";
import TimeSlotPreview from "./components/TimeSlotPreview";
import "./App.css";

function App() {
  // tr : ligne. donc pour avoir les horaires en ligne, il faut mapper les slotHours dans des <tr>
  const { handleMouseDown, handleMouseEnter, handleMouseUp, selectedSlots } =
    useSelection();

  // const handleClickOnSlot = (e: React.MouseEvent) => {
  //   const target = e.target as HTMLElement;
  //   console.log(target.id);
  //   const element = document.getElementById(target.id);

  //   if (element) {
  //     element.innerHTML = "Hi";
  //   } else {
  //     console.log("element not found.");
  //   }
  // };

  return (
    <div className="container-main">
      <table>
        <thead>
          <tr>
            <th>Heures/jour</th>
            {WEEK_DAYS.map((day, dayIndex) => (
              <th key={dayIndex}> {day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot, index) => (
            <tr key={index}>
              <th>{slot}</th>
              {/* 1er mapping: chaque slot time dans une ligne (tr, th) */}
              {WEEK_DAYS.map((_, idx) => (
                <td
                  key={idx}
                  id={`${slot}-${idx}`}
                  className="timeSlotHour slot"
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onMouseUp={handleMouseUp}
                ></td> // 2e chose mappée: cellules vides correspondant au nombre de jours (7 cellules) pour chaque timeSlot
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <TimeSlotPreview selectedSlots={selectedSlots} />
      </div>
    </div>
  );
}

export default App;
