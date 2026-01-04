import { useMemo, useState, useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";
import { LabelsContext } from "../context/LabelsContext";
import BulkActivitiesActionsBar from "./ManageActivitiesActions/BulkActivitiesActionsBar";
import ActivityFormCard from "./ManageActivitiesActions/ActivityFormCard";

// -----------------------
// Helpers (tri activités)
// -----------------------
const getPrimaryLabel = (a: { labels?: string[] }) =>
  (a.labels?.[0] ?? "").trim();

const compareActivities = (
  a: { name: string; labels?: string[] },
  b: { name: string; labels?: string[] }
) => {
  const la = getPrimaryLabel(a);
  const lb = getPrimaryLabel(b);

  // sans label d'abord
  if (!la && lb) return -1;
  if (la && !lb) return 1;

  // puis label A→Z
  if (la !== lb) return la.localeCompare(lb, "fr", { sensitivity: "base" });

  // puis nom A→Z
  return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
};

const ManageActivities = () => {
  const activityContext = useContext(ActivityContext);
  const labelsContext = useContext(LabelsContext);

  if (!activityContext || !labelsContext) return null;

  const {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    toggleHidden,
  } = activityContext;

  const { labels, addLabel, deleteLabel } = labelsContext;

  // -----------------------
  // Form state (activité)
  // -----------------------
  type NewActivityForm = {
    name: string;
    color: string;
    labels: string[];
    hidden: boolean;
    hourlyRate?: number;
  };

  const [newActivity, setNewActivity] = useState<NewActivityForm>({
    name: "",
    color: "#f55151",
    labels: [],
    hidden: false,
    hourlyRate: undefined,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // UI string (pour garder les flèches / saisie)
  const [hourlyRateInput, setHourlyRateInput] = useState<string>("");

  // -----------------------
  // Form state (label global)
  // -----------------------
  const [newLabelInput, setNewLabelInput] = useState("");

  // -----------------------
  // View / Sorting
  // -----------------------
  const [viewMode, setViewMode] = useState<"list" | "labels">("list");
  const [sortEnabled, setSortEnabled] = useState(false);

  // -----------------------
  // Bulk selection
  // -----------------------
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  const selectedIdsArray = useMemo(
    () => Array.from(selectedIds),
    [selectedIds]
  );

  const bulkMode = selectedIds.size > 0;
  const selectionMultiple = selectedIds.size > 1;

  // -----------------------
  // Derived data
  // -----------------------
  const displayedActivities = useMemo(() => {
    const arr = [...activities];
    if (sortEnabled) arr.sort(compareActivities);
    return arr;
  }, [activities, sortEnabled]);

  const groupedByLabel = useMemo(() => {
    const groups: Record<string, (typeof activities)[number][]> = { "": [] };

    for (const a of displayedActivities) {
      const labelKey = getPrimaryLabel(a);
      (groups[labelKey] ??= []).push(a);
    }

    const keys = Object.keys(groups).sort((a, b) => {
      if (a === "") return -1;
      if (b === "") return 1;
      return a.localeCompare(b, "fr", { sensitivity: "base" });
    });

    return { groups, keys };
  }, [displayedActivities]);

  const activityById = useMemo(() => {
    const m = new Map<string, (typeof activities)[number]>();
    for (const a of activities) m.set(a.id, a);
    return m;
  }, [activities]);

  const allSelected = useMemo(() => {
    if (activities.length === 0) return false;
    return activities.every((a) => selectedIds.has(a.id));
  }, [activities, selectedIds]);

  // -----------------------
  // Helpers UI
  // -----------------------
  const resetForm = () => {
    setNewActivity({
      name: "",
      color: "#f55151",
      labels: [],
      hidden: false,
      hourlyRate: undefined,
    });
    setHourlyRateInput("");
    setEditingId(null);
  };

  const clearSelection = () => setSelectedIds(new Set());

  // -----------------------
  // Selection logic
  // -----------------------
  const handleRowCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const checked = e.target.checked;

    setSelectedIds((prev) => {
      const next = new Set(prev);

      // shift + clic + anchor -> range (ordre actuel: activities, pas trié)
      if (
        e.nativeEvent instanceof MouseEvent &&
        (e.nativeEvent as MouseEvent).shiftKey &&
        lastClickedId
      ) {
        const ids = activities.map((a) => a.id);
        const a = ids.indexOf(lastClickedId);
        const b = ids.indexOf(id);
        if (a !== -1 && b !== -1) {
          const [start, end] = a < b ? [a, b] : [b, a];
          for (let i = start; i <= end; i++) {
            if (checked) next.add(ids[i]);
            else next.delete(ids[i]);
          }
          return next;
        }
      }

      // normal
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

    setLastClickedId(id);
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const shouldSelectAll = !activities.every((a) => next.has(a.id));
      if (shouldSelectAll) return new Set(activities.map((a) => a.id));
      return new Set();
    });
  };

  const toggleLabelSelection = (labelKey: string) => {
    const acts = groupedByLabel.groups[labelKey] ?? [];
    const ids = acts.map((a) => a.id);
    const isAllSelected =
      ids.length > 0 && ids.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (isAllSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  // -----------------------
  // CRUD activité
  // -----------------------
  const handleAddOrUpdateActivity = () => {
    if (!newActivity.name.trim() || !newActivity.color) return;

    if (editingId) {
      updateActivity({
        id: editingId,
        name: newActivity.name,
        color: newActivity.color,
        labels: newActivity.labels,
        hourlyRate: newActivity.hourlyRate,
        hidden: newActivity.hidden,
      });
      setEditingId(null);
    } else {
      addActivity({
        id: crypto.randomUUID(),
        name: newActivity.name,
        color: newActivity.color,
        labels: newActivity.labels,
        hourlyRate: newActivity.hourlyRate,
        hidden: newActivity.hidden,
      });
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Supprimer cette activité ? Cela supprimera aussi les heures associées."
      )
    ) {
      deleteActivity(id);
    }
  };

  const handleEdit = (id: string) => {
    const act = activities.find((a) => a.id === id);
    if (!act) return;

    setNewActivity({
      name: act.name,
      color: act.color,
      labels: act.labels ?? [],
      hidden: act.hidden ?? false,
      hourlyRate: act.hourlyRate,
    });

    setHourlyRateInput(act.hourlyRate != null ? String(act.hourlyRate) : "");
    setEditingId(id);
  };

  // -----------------------
  // Bulk ops (callbacks vers BulkActivitiesActionsBar)
  // -----------------------
  const bulkAddLabel = (ids: string[], label: string) => {
    ids.forEach((id) => {
      const a = activityById.get(id);
      if (!a) return;

      const nextLabels = a.labels?.includes(label)
        ? a.labels
        : [...(a.labels ?? []), label];

      updateActivity({ ...a, labels: nextLabels });
    });
  };

  const bulkRemoveLabels = (
    ids: string[],
    mode: "all" | "one",
    label?: string
  ) => {
    ids.forEach((id) => {
      const a = activityById.get(id);
      if (!a) return;

      const current = a.labels ?? [];
      const next = mode === "all" ? [] : current.filter((l) => l !== label);

      updateActivity({ ...a, labels: next });
    });
  };

  const bulkSetHourlyRate = (ids: string[], rate?: number) => {
    ids.forEach((id) => {
      const a = activityById.get(id);
      if (!a) return;
      updateActivity({ ...a, hourlyRate: rate });
    });
  };

  const bulkSetHidden = (ids: string[], hidden: boolean) => {
    ids.forEach((id) => {
      const a = activityById.get(id);
      if (!a) return;
      updateActivity({ ...a, hidden });
    });
  };

  const bulkSetColor = (ids: string[], color: string) => {
    ids.forEach((id) => {
      const a = activityById.get(id);
      if (!a) return;
      updateActivity({ ...a, color });
    });
  };

  const bulkDeleteMany = (ids: string[]) => {
    ids.forEach((id) => deleteActivity(id));
    clearSelection();
  };

  // -----------------------
  // Render row (réutilisé dans les 2 vues)
  // -----------------------
  const renderActivityRow = (activity: (typeof activities)[number]) => {
    const isSelected = selectedIds.has(activity.id);
    const disableRowActions = selectionMultiple;

    return (
      <>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleRowCheck(e, activity.id)}
            className="w-4 h-4"
            aria-label={`Sélectionner ${activity.name}`}
          />

          <span
            className={`font-semibold ${
              activity.hidden ? "opacity-50 italic" : ""
            }`}
            style={{ color: activity.color }}
          >
            {activity.name}
          </span>

          {activity.labels?.map((label) => (
            <span
              key={label}
              className="px-2 py-0.5 border border-gray-400 rounded text-xs text-gray-300"
            >
              {label}
            </span>
          ))}

          {activity.hidden && (
            <span className="px-2 py-0.5 border border-yellow-600 rounded text-xs text-yellow-400">
              masquée
            </span>
          )}

          <span className="text-xs text-gray-400 border border-gray-500 rounded px-2 py-0.5">
            {activity.hourlyRate != null
              ? `${activity.hourlyRate.toFixed(2)} /h`
              : "taux non assigné"}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleHidden(activity.id)}
            disabled={disableRowActions}
            className={`text-sm px-2 py-1 rounded border border-gray-500 hover:bg-gray-700 ${
              disableRowActions ? "opacity-40 cursor-not-allowed" : ""
            }`}
            title={
              disableRowActions
                ? "Actions individuelles désactivées en sélection multiple"
                : ""
            }
          >
            {activity.hidden ? "Afficher" : "Masquer"}
          </button>

          <button
            onClick={() => handleEdit(activity.id)}
            disabled={disableRowActions}
            className={`text-sm px-2 py-1 rounded border border-orange-500 hover:bg-orange-600 ${
              disableRowActions ? "opacity-40 cursor-not-allowed" : ""
            }`}
            title={
              disableRowActions
                ? "Actions individuelles désactivées en sélection multiple"
                : ""
            }
          >
            Modifier
          </button>

          <button
            onClick={() => handleDelete(activity.id)}
            disabled={disableRowActions}
            className={`text-sm px-2 py-1 rounded border border-red-500 hover:bg-red-700 ${
              disableRowActions ? "opacity-40 cursor-not-allowed" : ""
            }`}
            title={
              disableRowActions
                ? "Actions individuelles désactivées en sélection multiple"
                : ""
            }
          >
            Supprimer
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="p-4 space-y-6">
      {/* =======================
          FORM / BULK AREA
         ======================= */}
      <div className="rounded-xl border border-gray-700 bg-gray-900/40 p-4 md:p-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* COLONNE GAUCHE */}
            <div className="lg:col-span-8">
              {bulkMode ? (
                <BulkActivitiesActionsBar
                  selectedIds={selectedIdsArray}
                  activities={activities}
                  globalLabels={labels}
                  onAddLabel={bulkAddLabel}
                  onRemoveLabels={bulkRemoveLabels}
                  onSetHourlyRate={bulkSetHourlyRate}
                  onSetHidden={bulkSetHidden}
                  onSetColor={bulkSetColor}
                  onDeleteMany={bulkDeleteMany}
                  onClearSelection={clearSelection}
                />
              ) : (
                <ActivityFormCard
                  labels={labels}
                  newActivity={newActivity}
                  setNewActivity={setNewActivity}
                  editingId={editingId}
                  hourlyRateInput={hourlyRateInput}
                  setHourlyRateInput={setHourlyRateInput}
                  onSubmit={handleAddOrUpdateActivity}
                  onCancelEdit={resetForm}
                />
              )}
            </div>

            {/* COLONNE DROITE – LABELS */}
            <div className="lg:col-span-4 rounded-xl border border-gray-700 bg-gray-950/10 p-4 md:p-5 space-y-4">
              <h4 className="text-base font-semibold text-white">
                Créer un label
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom du label
                </label>
                <input
                  type="text"
                  placeholder="Ex : urgent, admin, perso..."
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  className="w-full h-11 rounded border border-gray-600 px-3 bg-gray-800 text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (newLabelInput.trim()) {
                      addLabel(newLabelInput.trim());
                      setNewLabelInput("");
                    }
                  }}
                  className="h-11 px-5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Ajouter le label
                </button>
              </div>

              <div>
                <div className="text-xs font-medium text-gray-400 mb-2">
                  Labels existants
                </div>

                {labels.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aucun label pour le moment.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => (
                      <span
                        key={label}
                        className="flex items-center gap-1 px-2 py-0.5 border border-gray-600 rounded-full bg-gray-800 text-xs text-gray-200"
                      >
                        <span>{label}</span>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Supprimer le label "${label}" ? Cela ne modifiera pas les activités existantes.`
                              )
                            ) {
                              deleteLabel(label);
                            }
                          }}
                          className="text-red-400 hover:text-red-500 ml-1"
                          aria-label={`Supprimer le label ${label}`}
                          title={`Supprimer le label ${label}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================
          HEADER ACTIVITÉS
         ======================= */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-lg font-bold text-white">Activités</h4>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setViewMode((v) => (v === "list" ? "labels" : "list"))
            }
            className="text-sm px-3 py-2 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
          >
            Vue : {viewMode === "list" ? "Liste" : "Labels"}
          </button>

          <button
            type="button"
            onClick={() => setSortEnabled((v) => !v)}
            className="text-sm px-3 py-2 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
          >
            {sortEnabled ? "Désactiver le tri" : "Trier A→Z"}
          </button>

          {activities.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-sm px-3 py-2 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
            >
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </button>
          )}
        </div>
      </div>

      {/* =======================
          VUE LISTE
         ======================= */}
      {viewMode === "list" && (
        <ul className="space-y-2">
          {displayedActivities.map((activity) => {
            const isSelected = selectedIds.has(activity.id);

            return (
              <li
                key={activity.id}
                className={`flex justify-between items-center p-2 border rounded ${
                  isSelected
                    ? "border-blue-600 bg-blue-950/20"
                    : "border-gray-600"
                }`}
              >
                {renderActivityRow(activity)}
              </li>
            );
          })}
        </ul>
      )}

      {/* =======================
          VUE LABELS
         ======================= */}
      {viewMode === "labels" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groupedByLabel.keys.map((labelKey) => {
            const title = labelKey || "Sans label";
            const acts = groupedByLabel.groups[labelKey];
            const ids = acts.map((a) => a.id);
            const allSel =
              ids.length > 0 && ids.every((id) => selectedIds.has(id));

            return (
              <div
                key={labelKey}
                className="rounded-xl border border-gray-600 p-3"
              >
                <button
                  type="button"
                  onClick={() => toggleLabelSelection(labelKey)}
                  className="w-full text-left font-semibold mb-3 flex justify-between"
                >
                  <span>{title}</span>
                  <span className="text-sm opacity-70">
                    {allSel ? "Tout sélectionné" : acts.length}
                  </span>
                </button>

                <div className="space-y-2">
                  {acts.map((activity) => {
                    const isSelected = selectedIds.has(activity.id);

                    return (
                      <div
                        key={activity.id}
                        className={`flex justify-between items-center p-2 border rounded ${
                          isSelected
                            ? "border-blue-600 bg-blue-950/20"
                            : "border-gray-600"
                        }`}
                      >
                        {renderActivityRow(activity)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ManageActivities;
