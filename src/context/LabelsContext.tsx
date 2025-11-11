import { createContext, useState, useEffect, ReactNode } from "react";

interface LabelsContextType {
  labels: string[];
  addLabel: (label: string) => void;
  deleteLabel: (label: string) => void;
}

export const LabelsContext = createContext<LabelsContextType | null>(null);

export const LabelsProvider = ({ children }: { children: ReactNode }) => {
  const [labels, setLabels] = useState<string[]>(() => {
    const stored = localStorage.getItem("labels");
    return stored ? JSON.parse(stored) : []; // <== plus de labels prédéfinis
  });

  useEffect(() => {
    localStorage.setItem("labels", JSON.stringify(labels));
  }, [labels]);

  const addLabel = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (labels.includes(trimmed)) return;
    setLabels((prev) => [...prev, trimmed]);
  };

  const deleteLabel = (label: string) => {
    setLabels((prev) => prev.filter((l) => l !== label));
  };

  return (
    <LabelsContext.Provider value={{ labels, addLabel, deleteLabel }}>
      {children}
    </LabelsContext.Provider>
  );
};
