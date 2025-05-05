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
export interface SavedSchedule {
  id: string;
  name: string;
  data: Map<string, string>; // slotToActivityMap
}
