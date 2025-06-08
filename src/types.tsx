export interface Activity {
  name: string;
  color: string;
  id: string;
  labels?: string[];
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
  WEEK_DAYS: string[];
  TIME_SLOTS: number[];
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
}
