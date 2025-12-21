import { useMemo, useState } from "react";
import type { Activity } from "../../types";

type Props = {
  selectedIds: string[];
  activities: Activity[];
  globalLabels: string[];

  onAddLabel: (ids: string[], label: string) => void;
  onRemoveLabels: (ids: string[], mode: "all" | "one", label?: string) => void;
  onSetHourlyRate: (ids: string[], rate?: number) => void;
  onSetHidden: (ids: string[], hidden: boolean) => void;
  onSetColor: (ids: string[], color: string) => void;
  onDeleteMany: (ids: string[]) => void;

  onClearSelection: () => void;
};

export default function BulkActivitiesActionsBar({
  selectedIds,
  activities,
  globalLabels,
  onAddLabel,
  onRemoveLabels,
  onSetHourlyRate,
  onSetHidden,
  onSetColor,
  onDeleteMany,
  onClearSelection,
}: Props) {
  const selectedCount = selectedIds.length;
  if (selectedCount === 0) return null;

  const [labelToAdd, setLabelToAdd] = useState("");
  const [labelToRemove, setLabelToRemove] = useState("");
  const [removeMode, setRemoveMode] = useState<"all" | "one">("all");

  const [hourlyRateInput, setHourlyRateInput] = useState<string>("");

  const [bulkColor, setBulkColor] = useState<string>("#3b82f6");

  const selectedActivities = useMemo(() => {
    const set = new Set(selectedIds);
    return activities.filter((a) => set.has(a.id));
  }, [activities, selectedIds]);

  const anyHidden = useMemo(
    () => selectedActivities.some((a) => !!a.hidden),
    [selectedActivities]
  );

  const anyVisible = useMemo(
    () => selectedActivities.some((a) => !a.hidden),
    [selectedActivities]
  );

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950/20 p-4 md:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white">Actions groupées</h3>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-200">{selectedCount}</span>{" "}
            {selectedCount === 1
              ? "activité sélectionnée"
              : "activités sélectionnées"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearSelection}
            className="h-11 px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
          >
            Tout déselectionner
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  `Supprimer ${selectedCount} activité(s) ? Cette action est irréversible.`
                )
              ) {
                onDeleteMany(selectedIds);
              }
            }}
            className="h-11 px-4 rounded border border-red-600 text-red-200 hover:bg-red-900/30"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="h-px bg-gray-800" />

      {/* Actions */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bloc gauche : Actions rapides alignées */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {/* Ajouter un label */}
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <div>
              <div className="text-xs font-medium text-gray-400 mb-1">
                Ajouter un label
              </div>
              <select
                value={labelToAdd}
                onChange={(e) => setLabelToAdd(e.target.value)}
                className="h-11 w-full rounded border border-gray-600 bg-gray-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Choisir…</option>
                {globalLabels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!labelToAdd}
              onClick={() => {
                onAddLabel(selectedIds, labelToAdd);
                setLabelToAdd("");
              }}
              className="h-11 shrink-0 whitespace-nowrap px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Appliquer
            </button>
          </div>

          {/* Taux horaire */}
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <div>
              <div className="text-xs font-medium text-gray-400 mb-1">
                Taux horaire
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={hourlyRateInput}
                onChange={(e) => setHourlyRateInput(e.target.value)}
                placeholder="Ex : 28.00"
                className="h-11 w-full rounded border border-gray-600 bg-gray-800 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const v = hourlyRateInput.trim();
                const n = v === "" ? undefined : Number(v);
                onSetHourlyRate(
                  selectedIds,
                  Number.isFinite(n as number) ? n : undefined
                );
              }}
              title="Laisse vide pour effacer le taux"
              className="h-11 shrink-0 whitespace-nowrap px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
            >
              Appliquer
            </button>
          </div>

          {/* Couleur */}
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <div>
              <div className="text-xs font-medium text-gray-400 mb-1">
                Appliquer une couleur
              </div>

              <div className="h-11 w-full flex items-center gap-2 rounded border border-gray-600 bg-gray-800 px-3">
                <input
                  type="color"
                  value={bulkColor}
                  onChange={(e) => setBulkColor(e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-600 rounded bg-transparent"
                  aria-label="Choisir la couleur à appliquer"
                />
                <div className="text-xs text-gray-300">{bulkColor}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSetColor(selectedIds, bulkColor)}
              className="h-11 shrink-0 whitespace-nowrap px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
            >
              Appliquer
            </button>
          </div>
        </div>

        {/* Bloc droit : Supprimer des labels aligné */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div>
            <div className="text-xs font-medium text-gray-400 mb-2">
              Supprimer des labels
            </div>

            {/* Mode */}
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => setRemoveMode("all")}
                className={`h-11 px-4 rounded border ${
                  removeMode === "all"
                    ? "border-blue-600 text-white"
                    : "border-gray-600 text-gray-200"
                } hover:bg-gray-800`}
              >
                Tout retirer
              </button>
              <button
                type="button"
                onClick={() => setRemoveMode("one")}
                className={`h-11 px-4 rounded border ${
                  removeMode === "one"
                    ? "border-blue-600 text-white"
                    : "border-gray-600 text-gray-200"
                } hover:bg-gray-800`}
              >
                Retirer 1 label
              </button>
            </div>

            {/* Choix + Appliquer alignés */}
            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <select
                value={labelToRemove}
                onChange={(e) => setLabelToRemove(e.target.value)}
                disabled={removeMode !== "one"}
                className="h-11 w-full rounded border border-gray-600 bg-gray-800 text-white px-3 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Choisir un label…</option>
                {globalLabels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  if (removeMode === "all") {
                    onRemoveLabels(selectedIds, "all");
                    setLabelToRemove("");
                    return;
                  }
                  if (removeMode === "one" && labelToRemove) {
                    onRemoveLabels(selectedIds, "one", labelToRemove);
                    setLabelToRemove("");
                  }
                }}
                disabled={removeMode === "one" && !labelToRemove}
                className="h-11 shrink-0 whitespace-nowrap px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Appliquer
              </button>
            </div>

            {removeMode === "all" && (
              <div className="mt-2 text-xs text-gray-500">
                Tout retirer ignore le choix du label.
              </div>
            )}
          </div>
        </div>

        {/* Visibilité : ligne dédiée */}
        <div className="col-span-12">
          <div className="text-xs font-medium text-gray-400 mb-1">
            Visibilité
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSetHidden(selectedIds, true)}
              disabled={!anyVisible}
              className="h-11 px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Masquer
            </button>

            <button
              type="button"
              onClick={() => onSetHidden(selectedIds, false)}
              disabled={!anyHidden}
              className="h-11 px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Afficher
            </button>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Les actions s’appliquent uniquement aux activités sélectionnées.
      </div>
    </div>
  );
}
