import type { FormEvent } from "react";

type NewActivityForm = {
  name: string;
  color: string;
  labels: string[];
  hidden: boolean;
  hourlyRate?: number;
};

type Props = {
  labels: string[];

  newActivity: NewActivityForm;
  setNewActivity: (next: NewActivityForm) => void;

  editingId: string | null;

  hourlyRateInput: string;
  setHourlyRateInput: (v: string) => void;

  onSubmit: () => void;
  onCancelEdit?: () => void; // optionnel
};

export default function ActivityFormCard({
  labels,
  newActivity,
  setNewActivity,
  editingId,
  hourlyRateInput,
  setHourlyRateInput,
  onSubmit,
  onCancelEdit,
}: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-700 bg-gray-950/20 p-4 md:p-5 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">
          {editingId ? "Modifier une activité" : "Créer une activité"}
        </h3>
        <p className="text-sm text-gray-400">
          Nom, couleur, taux horaire et labels.
        </p>
      </div>

      <div className="h-px bg-gray-800" />

      {/* Ligne 1 : Nom + Couleur */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={newActivity.name}
            onChange={(e) =>
              setNewActivity({ ...newActivity, name: e.target.value })
            }
            placeholder="Ex : Français (cours), Sport, Rédaction..."
            className="w-full h-11 rounded border border-gray-600 px-3 bg-gray-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Couleur
          </label>
          <div className="h-11 w-full flex items-center gap-3 rounded border border-gray-600 bg-gray-800 px-3">
            <input
              type="color"
              value={newActivity.color}
              onChange={(e) =>
                setNewActivity({ ...newActivity, color: e.target.value })
              }
              className="w-9 h-9 p-0 border border-gray-600 rounded bg-transparent"
              aria-label="Choisir la couleur"
            />
            <div className="min-w-0">
              <div className="text-xs text-gray-400 leading-none">Aperçu</div>
              <div
                className="text-sm font-medium truncate"
                style={{ color: newActivity.color }}
                title={newActivity.name || "Nom de l’activité"}
              >
                {newActivity.name || "Nom de l’activité"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ligne 2 : Taux horaire + Ajouter un label existant */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Taux horaire
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={hourlyRateInput}
            onChange={(e) => setHourlyRateInput(e.target.value)}
            onBlur={() => {
              const v = hourlyRateInput.trim();
              const n = v === "" ? undefined : Number(v);
              setNewActivity({
                ...newActivity,
                hourlyRate: Number.isNaN(n as number) ? undefined : n,
              });
              if (Number.isNaN(n as number)) setHourlyRateInput("");
            }}
            placeholder="Ex : 28.00"
            className="w-full h-11 rounded border border-gray-600 px-3 bg-gray-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <p className="mt-1 text-xs text-gray-500">
            Laisse vide si non applicable.
          </p>
        </div>

        <div className="col-span-12 md:col-span-8">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Ajouter un label existant
          </label>
          <select
            className="w-full h-11 rounded border border-gray-600 px-3 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => {
              const label = e.target.value;
              if (label && !newActivity.labels.includes(label)) {
                setNewActivity({
                  ...newActivity,
                  labels: [...newActivity.labels, label],
                });
              }
              e.target.value = "";
            }}
          >
            <option value="">Choisir un label…</option>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Ajoute un label global à cette activité.
          </p>
        </div>
      </div>

      {/* Chips labels */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Labels de l’activité
        </label>

        {newActivity.labels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {newActivity.labels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-600 bg-gray-800 text-xs text-gray-200"
              >
                {label}
                <button
                  type="button"
                  onClick={() =>
                    setNewActivity({
                      ...newActivity,
                      labels: newActivity.labels.filter((l) => l !== label),
                    })
                  }
                  className="text-gray-400 hover:text-red-400"
                  aria-label={`Retirer le label ${label}`}
                  title={`Retirer le label ${label}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded border border-gray-700 bg-gray-950/20 px-3 py-2 text-sm text-gray-500">
            Aucun label ajouté à l’activité.
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-2 flex items-center justify-end gap-2">
        {editingId && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="h-11 px-4 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
          >
            Annuler
          </button>
        )}

        <button
          type="submit"
          className="h-11 px-5 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {editingId ? "Enregistrer l’activité" : "Ajouter l’activité"}
        </button>
      </div>
    </form>
  );
}
