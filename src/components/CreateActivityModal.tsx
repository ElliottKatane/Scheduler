import { useState } from "react";
import { Activity } from "../types";

interface Props {
  onClose: () => void;
  onCreate: (activity: Activity) => void;
}

const CreateActivityModal: React.FC<Props> = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#00cc88");

  const handleSubmit = () => {
    if (!name.trim()) return;
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name,
      color,
    };
    onCreate(newActivity);
    setName("");
    setColor("#00cc88");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h4>Nouvelle activité</h4>
        <label>
          Nom :
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Couleur :
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <div className="creation-buttons">
          <button onClick={handleSubmit}>Créer</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;
