import { useState, useRef, useEffect } from "react";

export const useSelection = () => {
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const isMouseDown = useRef(false);
    const clearSelection = () => {
        setSelectedSlots(new Set());
      };
    useEffect(() => {
        const handleMouseUp = () => {
            isMouseDown.current = false;
        };

        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const toggleSlotSelection = (slotId: string) => {
        setSelectedSlots((prev) => {
          const newSelection = new Set(prev);
      
          if (newSelection.has(slotId)) {
            newSelection.delete(slotId);
            console.log(`❌ Désélection de : ${slotId}`);
          } else {
            newSelection.add(slotId);
            console.log(`✅ Sélection de : ${slotId}`);
          }
      
          return newSelection;
        });
      };
      
    

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
          console.log("Mouse down on:", target.id, target.className);

        if (!target.classList.contains("half-slot")) return;

        isMouseDown.current = true;
        toggleSlotSelection(target.id);
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!isMouseDown.current) return;
        
        const target = e.target as HTMLElement;
        if (!target.classList.contains("half-slot")) return;

        toggleSlotSelection(target.id);
    };

    return {
        selectedSlots,
        handleMouseDown,
        handleMouseEnter,
        clearSelection,
    };
};
