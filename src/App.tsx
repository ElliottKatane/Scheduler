import { useState, useContext, useEffect } from "react";
import { TIME_SLOTS, WEEK_DAYS } from "./constants";
import { useSelection } from "./hooks/useSelection";
import TimeSlotPreview from "./components/TimeSlotPreview";
import ManageActivities from "./pages/ManageActivities";
import Navbar from "./UI/Navbar";
import { ActivityContext } from "./context/ActivityContext";
import SavedSchedules from "./pages/SavedSchedules";
import LocalStorageViewer from "./pages/LocalStorageViewer";
import { useCurrentSchedule } from "./context/CurrentScheduleContext";
import { useSavedSchedules } from "./context/SavedSchedulesContext";
import ScheduleActions from "./components/ScheduleActions";
import ResizableTable from "./components/ResizableTable";
import ActivityActions from "./components/ActivityActions";
import "./App.css";
import BooksAndMovies from "./components/BooksAndMovies";
import HoursSummary from "./components/HoursSummary";
function App() {
  const activityContext = useContext(ActivityContext);
  if (!activityContext) return null; // ou fallback/chargement si besoin
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const { activities } = activityContext;
  const { schedules } = useSavedSchedules(); // pour comparer avec les emplois sauvegardés

  // tr : ligne. donc pour avoir les horaires en ligne, il faut mapper les slotHours dans des <tr>
  const {
    handleMouseDown,
    handleMouseEnter,
    selectedSlots,
    clearSelection,
    setSelectedSlots,
  } = useSelection();
  const { currentSchedule, setCurrentSchedule } = useCurrentSchedule();
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
  // On essaie de retrouver un emploi du temps qui correspond exactement
  useEffect(() => {
    if (slotToActivityMap.size === 0 || schedules.length === 0) return;

    // On essaie de retrouver un emploi du temps qui correspond exactement
    for (const schedule of schedules) {
      const savedMap = new Map(schedule.data);
      let isSame = savedMap.size === slotToActivityMap.size;
      if (isSame) {
        for (const [key, value] of savedMap) {
          if (slotToActivityMap.get(key) !== value) {
            isSame = false;
            break;
          }
        }
      }
      if (isSame) {
        setCurrentSchedule(schedule);
        break;
      }
    }
  }, [slotToActivityMap, schedules]);

  useEffect(() => {
    const serialized = JSON.stringify(Array.from(slotToActivityMap.entries()));
    localStorage.setItem("slotToActivityMap", serialized);
  }, [slotToActivityMap]);

  const [pendingAssignment, setPendingAssignment] = useState<string | null>(
    null
  );
  const [hasConflicts, setHasConflicts] = useState(false);
  const [conflictingSlots, setConflictingSlots] = useState<string[]>([]);
  const [isHoursOpen, setIsHoursOpen] = useState(false);

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
      <Navbar onTabChange={setActiveTab} currentSchedule={currentSchedule} />

      <div className="container-main">
        {activeTab === "Emploi du temps" && (
          <div className="main-content">
            <div className="sidebar flex flex-col space-y-4 p-4 bg-transparent overflow-y-auto max-h-[calc(100vh-6rem)]">
              <TimeSlotPreview
                selectedSlots={selectedSlots}
                setSelectedActivityId={setSelectedActivityId}
                onAssignActivity={assignActivityToSelectedSlots}
              />
              <ActivityActions
                activities={activities}
                selectedActivityId={selectedActivityId}
                setSelectedActivityId={setSelectedActivityId}
                onAssignActivity={assignActivityToSelectedSlots}
                onResetSelection={clearSelection}
                hasSelection={selectedSlots.size > 0}
                hasConflicts={hasConflicts}
                conflictingSlots={conflictingSlots}
                onClearAndAssign={() => {
                  setSlotToActivityMap((prev) => {
                    const newMap = new Map(prev);
                    selectedSlots.forEach((slotId) => newMap.delete(slotId));
                    return newMap;
                  });
                  setError(null);
                  setPendingAssignment(null);
                  setConflictingSlots([]);
                }}
                onForceReplace={() => {
                  if (pendingAssignment) applyAssignment(pendingAssignment);
                }}
                error={error || undefined}
                isCreating={isCreating}
                setIsCreating={setIsCreating}
              />
              <ScheduleActions
                slotToActivityMap={slotToActivityMap}
                clearSelection={clearSelection}
                setSlotToActivityMap={setSlotToActivityMap}
                setSelectedActivityId={setSelectedActivityId}
                setPendingAssignment={setPendingAssignment}
                setConflictingSlots={setConflictingSlots}
                setHasConflicts={setHasConflicts}
              />
              <button
                onClick={() => setIsHoursOpen(true)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-center hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Résumé des heures
              </button>
            </div>
            {isHoursOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                onMouseDown={() => setIsHoursOpen(false)}
              >
                <div
                  className="w-full max-w-3xl rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-3">
                    <h3 className="text-lg font-semibold">
                      Résumé des heures et coûts
                    </h3>
                    <button
                      onClick={() => setIsHoursOpen(false)}
                      className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="p-5">
                    <HoursSummary variant="modal" />
                  </div>
                </div>
              </div>
            )}

            <div className="calendar-section">
              <ResizableTable
                selectedSlots={selectedSlots}
                slotToActivityMap={slotToActivityMap}
                activities={activities}
                WEEK_DAYS={WEEK_DAYS}
                TIME_SLOTS={TIME_SLOTS}
                handleMouseDown={handleMouseDown}
                handleMouseEnter={handleMouseEnter}
                clearSelection={clearSelection}
                setSelectedSlots={setSelectedSlots}
              />
            </div>
          </div>
        )}

        {activeTab === "Gérer les activités" && <ManageActivities />}

        {activeTab === "Mes emplois du temps" && (
          <SavedSchedules
            activities={activities}
            onLoad={(mapData, scheduleId, scheduleName) => {
              const asMap = new Map(mapData);
              setCurrentSchedule({
                id: scheduleId,
                name: scheduleName,
                data: mapData,
              });
              setSlotToActivityMap(asMap);
              setSelectedActivityId("");
              setPendingAssignment(null);
              setConflictingSlots([]);
              setHasConflicts(false);
            }}
          />
        )}
        {activeTab === "Livres / Films" && <BooksAndMovies />}

        {activeTab === "Debug" && <LocalStorageViewer />}
      </div>
    </section>
  );
}

export default App;
