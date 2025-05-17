export interface Activity {
  name: string;
  color: string;
  id: string;
}
export interface TimeSlotPreviewProps {
  selectedSlots: Set<string>;
  selectedActivityId: string;
  onResetSelection: () => void;
  setSelectedActivityId: (id: string) => void;
  onAssignActivity: (activityId: string) => void;
  error?: string | null;
  pendingAssignment: string | null;
  conflictingSlots: string[];
  onForceReplace: () => void;
  onClearAndAssign: () => void;
  hasConflicts: boolean;
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
}
export interface SavedSchedule {
  id: string;
  name: string;
  data: [string, string][]; // slotToActivityMap
}
