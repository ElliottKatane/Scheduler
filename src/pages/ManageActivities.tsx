import { useEffect, useState, useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";
import { LabelsContext } from "../context/LabelsContext";

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

  const [newActivity, setNewActivity] = useState({
    name: "",
    color: "",
    labels: [] as string[],
    hidden: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newLabelInput, setNewLabelInput] = useState("");

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const handleAddOrUpdateActivity = () => {
    if (!newActivity.name.trim() || !newActivity.color) return;

    if (editingId) {
      updateActivity({
        id: editingId,
        name: newActivity.name,
        color: newActivity.color,
        labels: newActivity.labels,
      });
      setEditingId(null);
    } else {
      addActivity({
        id: crypto.randomUUID(),
        name: newActivity.name,
        color: newActivity.color,
        labels: newActivity.labels,
      });
    }

    setNewActivity({ name: "", color: "", labels: [], hidden: false });
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
    if (act) {
      setNewActivity({
        name: act.name,
        color: act.color,
        labels: act.labels || [],
        hidden: act.hidden ?? false,
      });
      setEditingId(id);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddOrUpdateActivity();
        }}
        className="flex flex-wrap gap-4 items-end"
      >
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-300 mb-1">
            Nom :
          </label>
          <input
            type="text"
            value={newActivity.name}
            onChange={(e) =>
              setNewActivity({ ...newActivity, name: e.target.value })
            }
            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-700 text-black dark:text-white"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-300 mb-1">
            Couleur :
          </label>
          <input
            type="color"
            value={newActivity.color}
            onChange={(e) =>
              setNewActivity({ ...newActivity, color: e.target.value })
            }
            className="w-12 h-10 p-0 border border-gray-300 dark:border-gray-600 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-300 mb-1">
            Ajouter un label :
          </label>
          <select
            className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-700 text-black dark:text-white"
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
            <option value="">-- Choisir un label --</option>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>

          {/* Ajout dynamique de labels */}
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nouveau label"
              value={newLabelInput}
              onChange={(e) => setNewLabelInput(e.target.value)}
              className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-700 text-black dark:text-white"
            />
            <button
              type="button"
              onClick={() => {
                if (newLabelInput.trim()) {
                  addLabel(newLabelInput.trim());
                  setNewLabelInput("");
                }
              }}
              className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Ajouter
            </button>
          </div>

          {/* Liste des labels actuels de l'activité */}
          <div className="flex flex-wrap gap-2 mt-2">
            {newActivity.labels.map((label) => (
              <span
                key={label}
                className="flex items-center space-x-1 px-2 py-0.5 border border-gray-400 rounded text-xs text-gray-300"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setNewActivity({
                      ...newActivity,
                      labels: newActivity.labels.filter((l) => l !== label),
                    })
                  }
                  className="text-red-400 hover:text-red-500 ml-1"
                  aria-label={`Retirer le label ${label}`}
                  title={`Retirer le label ${label}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Nouveau: Masquer cette activité */}
        <div className="flex items-center gap-2">
          <input
            id="hidden"
            type="checkbox"
            checked={!!newActivity.hidden}
            onChange={(e) =>
              setNewActivity({ ...newActivity, hidden: e.target.checked })
            }
            className="w-4 h-4"
          />
          <label htmlFor="hidden" className="text-sm font-medium text-gray-300">
            Masquer cette activité
          </label>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {editingId ? "Modifier" : "Ajouter"} l’activité
        </button>
      </form>

      <h4 className="text-lg font-bold text-white">
        Labels existants (globaux)
      </h4>
      <div className="flex flex-wrap gap-2">
        {labels.length === 0 && (
          <p className="text-gray-400 text-sm">Aucun label pour le moment.</p>
        )}
        {labels.map((label) => (
          <span
            key={label}
            className="flex items-center space-x-1 px-2 py-0.5 border border-gray-400 rounded text-xs text-gray-300"
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
              x
            </button>
          </span>
        ))}
      </div>

      <h4 className="text-lg font-bold text-white">Activités enregistrées</h4>
      <ul className="space-y-2">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex justify-between items-center p-2 border border-gray-600 rounded"
          >
            <div className="flex items-center space-x-3 flex-wrap">
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
            </div>

            <div className="flex gap-2">
              {/* Nouveau: bascule Afficher/Masquer */}
              <button
                onClick={() => toggleHidden(activity.id)}
                className="text-sm px-2 py-1 rounded border border-gray-500 hover:bg-gray-700"
              >
                {activity.hidden ? "Afficher" : "Masquer"}
              </button>

              <button
                onClick={() => handleEdit(activity.id)}
                className="text-sm px-2 py-1 rounded border border-orange-500 hover:bg-orange-600"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(activity.id)}
                className="text-sm px-2 py-1 rounded border border-red-500 hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageActivities;
