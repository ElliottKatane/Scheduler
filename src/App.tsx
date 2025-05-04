import { useState } from "react";
import { TIME_SLOTS, WEEK_DAYS } from "./constants";
import { useSelection } from "./hooks/useSelection";
import TimeSlotPreview from "./components/TimeSlotPreview";
import ManageActivities from "./components/ManageActivities";
import Navbar from "./UI/Navbar";
import "./App.css";

function App() {
  // tr : ligne. donc pour avoir les horaires en ligne, il faut mapper les slotHours dans des <tr>
  const { handleMouseDown, handleMouseEnter, selectedSlots } = useSelection();
  const [activeTab, setActiveTab] = useState("Emploi du temps");

  return (
    <section>
      <Navbar onTabChange={setActiveTab} />

      <div className="container-main">
        {activeTab === "Emploi du temps" && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Heures/jour</th>
                  {WEEK_DAYS.map((day, dayIndex) => (
                    <th key={dayIndex}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, index) => (
                  <tr key={index}>
                    <th>{slot < 10 ? "0" + slot : slot}h</th>
                    {WEEK_DAYS.map((_, idx) => (
                      <td
                        key={idx}
                        id={`${slot}-${idx}`}
                        className="timeSlotHour slot"
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                      ></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <TimeSlotPreview selectedSlots={selectedSlots} />
          </>
        )}

        {activeTab === "Gérer les activités" && <ManageActivities />}

        {activeTab === "Mes emplois du temps" && (
          <p>
            Fonctionnalité à venir : gestion des emplois du temps sauvegardés.
          </p>
        )}
      </div>
    </section>
  );
}

export default App;
