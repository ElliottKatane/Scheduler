export type Currency = "CAD" | "USD" | "EUR";

export interface Activity {
  name: string;
  color: string;
  id: string;
  labels?: string[];
  hidden?: boolean; // nouveau: permet de "cacher" l’activité
  hourlyRate?: number; // nouveau: taux horaire
  currency?: Currency; // optionnel: devise
}
export interface TimeSlotPreviewProps {
  selectedSlots: Set<string>;
  setSelectedActivityId: (id: string) => void;
  onAssignActivity: (id: string) => void;
}
export interface ResizableTableProps {
  selectedSlots: Set<string>;
  slotToActivityMap: Map<string, string>;
  activities: Activity[];
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseEnter: (e: React.MouseEvent) => void;
  clearSelection: () => void;
  setSelectedSlots: React.Dispatch<
    Set<string> | ((prev: Set<string>) => Set<string>)
  >;
}
export interface SavedSchedule {
  id: string;
  name: string;
  data: [string, string][]; // slotToActivityMap
  weekStartDate: string; // YYYY-MM-DD (lundi ISO)
}
