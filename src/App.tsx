import { useState, useContext, useEffect } from "react";
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
import { CALENDAR_START, getCurrentWeekMonday } from "./constants";
import { Toaster } from "sonner";
import { SavedSchedule } from "./types";
import "./App.css";
import BooksAndMovies from "./components/BooksAndMovies";
import HoursSummary from "./components/HoursSummary";
import { useAuthStatus } from "./hooks/useAuthStatus";
function App() {
  const activityContext = useContext(ActivityContext);
  if (!activityContext) return null; // ou fallback/chargement si besoin
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<string>(CALENDAR_START);
  const { user } = useAuthStatus();
  const uid = user?.uid ?? null;
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
  const { currentSchedule, setCurrentSchedule, markSaved } =
    useCurrentSchedule();
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
    // Si on édite déjà un EDT, on ne change pas son identité en fonction des modifications
    if (currentSchedule) return;

    if (slotToActivityMap.size === 0 || schedules.length === 0) {
      setCurrentSchedule(null);
      return;
    }

    let matched: SavedSchedule | null = null;

    for (const schedule of schedules) {
      const savedMap = new Map(schedule.data);
      if (savedMap.size !== slotToActivityMap.size) continue;

      let same = true;
      for (const [k, v] of savedMap) {
        if (slotToActivityMap.get(k) !== v) {
          same = false;
          break;
        }
      }

      if (same) {
        matched = schedule;
        break;
      }
    }

    setCurrentSchedule(matched);
  }, [slotToActivityMap, schedules, currentSchedule, setCurrentSchedule]);

  useEffect(() => {
    if (uid) return; // connecté => pas de brouillon local

    const serialized = JSON.stringify(Array.from(slotToActivityMap.entries()));
    localStorage.setItem("slotToActivityMap", serialized);
  }, [slotToActivityMap, uid]);

  useEffect(() => {
    // reset UI schedule identity
    setCurrentSchedule(null);

    // reset brouillon
    setSlotToActivityMap(new Map());
    setWeekStartDate(getCurrentWeekMonday());

    // reset UI selection
    clearSelection();
    setSelectedActivityId("");
    setPendingAssignment(null);
    setConflictingSlots([]);
    setHasConflicts(false);
  }, [uid]);

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
    setHasConflicts(false); // <-- ajoute ça
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
  useEffect(() => {
    // Si on n'a pas de current schedule, rien à faire
    if (!currentSchedule) return;

    // Si le schedule courant a été supprimé des saved schedules => wipe total
    const stillExists = schedules.some((s) => s.id === currentSchedule.id);
    if (stillExists) return;

    // wipe identité + brouillon + UI
    setCurrentSchedule(null);
    setSlotToActivityMap(new Map());
    clearSelection();
    setSelectedActivityId("");
    setPendingAssignment(null);
    setConflictingSlots([]);
    setHasConflicts(false);

    // optionnel : reset semaine aussi si tu veux vraiment "retour à 0"
    // setWeekStartDate(getCurrentWeekMonday());
  }, [
    schedules,
    currentSchedule,
    setCurrentSchedule,
    setSlotToActivityMap,
    clearSelection,
    setSelectedActivityId,
    setPendingAssignment,
    setConflictingSlots,
    setHasConflicts,
  ]);

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
      <Toaster richColors position="top-right" closeButton />

      <div className="container-main">
        {activeTab === "Emploi du temps" && (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            {/* SIDEBAR -> au-dessus en mobile, à gauche en desktop */}
            <div className="w-full lg:w-[360px] lg:shrink-0">
              <div className="flex flex-col space-y-4 p-4 bg-transparent overflow-y-auto lg:max-h-[calc(100vh-6rem)]">
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
            </div>

            {/* MODAL inchangé */}
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

            {/* CALENDAR -> min-w-0 sinon le scroll horizontal est cassé dans un flex row */}
            <div className="w-full min-w-0">
              <div className="calendar-section">
                <ResizableTable
                  selectedSlots={selectedSlots}
                  slotToActivityMap={slotToActivityMap}
                  activities={activities}
                  handleMouseDown={handleMouseDown}
                  handleMouseEnter={handleMouseEnter}
                  setSelectedSlots={setSelectedSlots}
                  weekStartDate={weekStartDate}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Gérer les activités" && <ManageActivities />}

        {activeTab === "Mes emplois du temps" && (
          <SavedSchedules
            activities={activities}
            onLoad={(mapData, scheduleId, scheduleName) => {
              const asMap = new Map(mapData);
              markSaved(asMap); // <- ajoute ça
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
