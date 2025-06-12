import { useEffect, useState, useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";

const ManageActivities = () => {
  const context = useContext(ActivityContext);
  if (!context) return null;

  const { activities, addActivity, updateActivity, deleteActivity } = context;

  const [newActivity, setNewActivity] = useState({
    name: "",
    color: "",
    labels: [] as string[],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const predefinedLabels = [
    "LRDG",
    "Perso",
    "Pro",
    "Autre",
    "Santé",
    "Sport",
    "Preply",
  ];

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

    setNewActivity({ name: "", color: "", labels: [] });
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
              e.target.value = ""; // reset du select
            }}
          >
            <option value="">-- Choisir un label --</option>
            {predefinedLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>

          {/* Liste des labels actuels */}
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
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {editingId ? "Modifier" : "Ajouter"} l’activité
        </button>
      </form>

      <h4 className="text-lg font-bold text-white">Activités enregistrées</h4>
      <ul className="space-y-2">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex justify-between items-center p-2 border border-gray-600 rounded"
          >
            <div className="flex items-center space-x-3 flex-wrap">
              <span className="font-semibold" style={{ color: activity.color }}>
                {activity.name}
              </span>

              {activity.labels &&
                activity.labels.map((label) => (
                  <span
                    key={label}
                    className="px-2 py-0.5 border border-gray-400 rounded text-xs text-gray-300"
                  >
                    {label}
                  </span>
                ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(activity.id)}
                className="text-orange-400 hover:text-orange-500"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(activity.id)}
                className="text-red-400 hover:text-red-500"
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageActivities;
