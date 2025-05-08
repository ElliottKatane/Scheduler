import { useState, useContext, useEffect } from "react";
import { TIME_SLOTS, WEEK_DAYS } from "./constants";
import { useSelection } from "./hooks/useSelection";
import TimeSlotPreview from "./components/TimeSlotPreview";
import ManageActivities from "./components/ManageActivities";
import Navbar from "./UI/Navbar";
import "./App.css";
import { ActivityContext } from "./context/ActivityContext";
import SavedSchedules from "./components/SavedSchedules";
import LocalStorageViewer from "./components/LocalStorageViewer";
import { SavedSchedule } from "./types";
import { useSavedSchedules } from "./hooks/useSavedSchedules";

function App() {
  const activityContext = useContext(ActivityContext);
  if (!activityContext) return null; // ou fallback/chargement si besoin
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");

  const { activities } = activityContext;
  const { addSchedule } = useSavedSchedules();

  // tr : ligne. donc pour avoir les horaires en ligne, il faut mapper les slotHours dans des <tr>
  const { handleMouseDown, handleMouseEnter, selectedSlots, clearSelection } =
    useSelection();
  const [activeTab, setActiveTab] = useState("Emploi du temps");
  const [slotToActivityMap, setSlotToActivityMap] = useState<
    Map<string, string>
  >(() => {
    const saved = localStorage.getItem("slotToActivityMap");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return new Map(parsed); // chaque item doit être [key, value]
      } catch {
        return new Map();
      }
    }
    return new Map();
  });
  useEffect(() => {
    const serialized = JSON.stringify(Array.from(slotToActivityMap.entries()));
    localStorage.setItem("slotToActivityMap", serialized);
  }, [slotToActivityMap]);

  const [pendingAssignment, setPendingAssignment] = useState<string | null>(
    null
  );
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflictingSlots, setConflictingSlots] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  // Function to handle assignment of an activity to selected slots
  const applyAssignment = (activityId: string) => {
    setSlotToActivityMap((prev) => {
      const newMap = new Map(prev);
      selectedSlots.forEach((slotId) => {
        newMap.set(slotId, activityId);
      });
      return newMap;
    });
    setError(null);
    setPendingAssignment(null);
    setConflictingSlots([]);
    clearSelection();
  };

  // Map to keep track of which activity is assigned to which slot
  const assignActivityToSelectedSlots = (activityId: string) => {
    const conflicting = Array.from(selectedSlots).filter((slotId) =>
      slotToActivityMap.has(slotId)
    );

    if (conflicting.length > 0) return; // conflit = rien ne se passe ici

    applyAssignment(activityId);
  };
  useEffect(() => {
    if (!selectedSlots.size) {
      setPendingAssignment(null);
      setConflictingSlots([]);
      setHasConflicts(false);
      return;
    }

    const conflicts = Array.from(selectedSlots).filter((slotId) =>
      slotToActivityMap.has(slotId)
    );

    setConflictingSlots(conflicts);
    setHasConflicts(conflicts.length > 0);

    if (conflicts.length > 0 && selectedActivityId) {
      setPendingAssignment(selectedActivityId);
    } else {
      setPendingAssignment(null);
    }
  }, [selectedSlots, selectedActivityId, slotToActivityMap]);

  // Nettoyer les créneaux dont l'activité a été supprimée
  useEffect(() => {
    setSlotToActivityMap((prev) => {
      const newMap = new Map(
        Array.from(prev.entries()).filter(([_, activityId]) =>
          activities.some((a) => a.id === activityId)
        )
      );
      return newMap;
    });
  }, [activities]);

  // Surveiller les activités supprimées ou modifiées
  // et nettoyer les créneaux correspondants
  // (par exemple, si une activité est supprimée, on veut supprimer les créneaux associés)
  // et si une activité est modifiée, on veut mettre à jour les créneaux associés
  useEffect(() => {
    setSlotToActivityMap((prev) => {
      const newMap = new Map(
        Array.from(prev.entries()).filter(([_, activityId]) =>
          activities.some((a) => a.id === activityId)
        )
      );
      return newMap;
    });
  }, [activities]);

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
                    {WEEK_DAYS.map((_, idx) => {
                      const slotId = `${slot}-${idx}`;
                      const activityId = slotToActivityMap.get(slotId);
                      const activity = activities.find(
                        (a) => a.id === activityId
                      );

                      return (
                        <td
                          key={idx}
                          id={slotId}
                          className={`timeSlotHour slot ${
                            selectedSlots.has(slotId) ? "selected" : ""
                          }`}
                          onMouseDown={handleMouseDown}
                          onMouseEnter={handleMouseEnter}
                          style={{
                            backgroundColor: activity?.color || undefined,
                            color: activity ? "#000" : undefined, // temporaire, à améliorer plus tard
                          }}
                        >
                          {activity?.name || ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <TimeSlotPreview
              selectedSlots={selectedSlots}
              selectedActivityId={selectedActivityId}
              setSelectedActivityId={setSelectedActivityId}
              onAssignActivity={assignActivityToSelectedSlots}
              error={error}
              pendingAssignment={pendingAssignment}
              conflictingSlots={conflictingSlots}
              onClearAndAssign={() => {
                setSlotToActivityMap((prev) => {
                  const newMap = new Map(prev);
                  selectedSlots.forEach((slotId) => newMap.delete(slotId));
                  return newMap;
                });
                clearSelection();
                setError(null);
                setPendingAssignment(null);
                setConflictingSlots([]);
                setSelectedActivityId("");
              }}
              onForceReplace={() => {
                if (pendingAssignment) applyAssignment(pendingAssignment);
              }}
              hasConflicts={hasConflicts}
              onResetSelection={clearSelection}
            />
            <button
              onClick={() => {
                const name = prompt("Nom de l'emploi du temps :");
                if (!name) return;

                const newSchedule: SavedSchedule = {
                  id: crypto.randomUUID(),
                  name,
                  data: Array.from(slotToActivityMap.entries()),
                };
                addSchedule(newSchedule);
                alert("Emploi du temps sauvegardé !");
              }}
            >
              Sauvegarder cet emploi du temps
            </button>
          </>
        )}

        {activeTab === "Gérer les activités" && <ManageActivities />}

        {activeTab === "Mes emplois du temps" && (
          <SavedSchedules
            activities={activities}
            onLoad={(map) => {
              setSlotToActivityMap(new Map(map));
              setSelectedActivityId("");
              setPendingAssignment(null);
              setConflictingSlots([]);
              setHasConflicts(false);
            }}
            onCreateNewRequest={() => setActiveTab("Emploi du temps")}
          />
        )}

        {activeTab === "Debug" && <LocalStorageViewer />}
      </div>
    </section>
  );
}

export default App;
