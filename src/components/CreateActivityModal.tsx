import { useState } from "react";
import { Activity } from "../types";

interface Props {
  onClose: () => void;
  onCreate: (activity: Activity) => void;
}

const CreateActivityModal: React.FC<Props> = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#00cc88");

  // NEW
  const [label, setLabel] = useState(""); // un seul label pour commencer
  const [hourlyRate, setHourlyRate] = useState(""); // string pour l'input

  const handleSubmit = () => {
    if (!name.trim()) return;

    const rate = hourlyRate.trim() === "" ? undefined : Number(hourlyRate);

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      labels: label.trim() ? [label.trim()] : undefined,
      hourlyRate: Number.isFinite(rate as number)
        ? (rate as number)
        : undefined,
    };

    onCreate(newActivity);

    setName("");
    setColor("#00cc88");
    setLabel("");
    setHourlyRate("");
  };

  return (
    <div className="modal-overlay">
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 w-80 space-y-4 shadow-lg">
          <h4 className="text-lg font-semibold">Nouvelle activité</h4>

          <label className="flex flex-col gap-1 text-sm">
            <span>Nom</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-900 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* NEW: Label */}
          <label className="flex flex-col gap-1 text-sm">
            <span>Label</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: LRDG INDIV"
              className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-900 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* NEW: Taux horaire */}
          <label className="flex flex-col gap-1 text-sm">
            <span>Taux horaire</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="ex: 24"
                className="flex-1 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-900 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm opacity-70">/h</span>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span>Couleur</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 rounded-md border border-gray-300 dark:border-gray-600 
                         bg-transparent cursor-pointer"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-md border border-gray-400 dark:border-gray-600
                         text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 rounded-md border border-blue-500 text-blue-600
                         text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;
