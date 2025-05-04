import { useState, useRef, useEffect } from "react";

export const useSelection = () => {
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const isMouseDown = useRef(false);

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
    
                // Supprimer la classe 'selected'
                const slotElement = document.getElementById(slotId);
                if (slotElement) {
                    slotElement.classList.remove("selected");
                }
            } else {
                newSelection.add(slotId);
                console.log(`✅ Sélection de : ${slotId}`);
    
                // Ajouter la classe 'selected'
                const slotElement = document.getElementById(slotId);
                if (slotElement) {
                    slotElement.classList.add("selected");
                }
            }
    
            return newSelection;
        });
    };
    

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains("slot")) return;

        isMouseDown.current = true;
        toggleSlotSelection(target.id);
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!isMouseDown.current) return;
        
        const target = e.target as HTMLElement;
        if (!target.classList.contains("slot")) return;

        toggleSlotSelection(target.id);
    };

    return {
        selectedSlots,
        handleMouseDown,
        handleMouseEnter
    };
};
