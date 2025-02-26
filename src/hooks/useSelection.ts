import { useEffect, useState, useRef } from "react";
import { formatHoursInferiorTo10 } from "../constants";

export const useSelection = () => {
    interface SelectedSlot {
        day: string;
        startHour: number;
        endHour: number;
    }

    const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
    const selectedDay = useRef<string | null>(null);

    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionComplete, setSelectionComplete] = useState(false);

    const isMouseDown = useRef<boolean>(false); // la souris est-elle enfoncée ?
    const prevStartHour = useRef<number | null>(null); // Référence pour suivre la première heure de début sélectionnée

    useEffect(() => {
        const handleMouseUp = () => {
            isMouseDown.current = false;
            setIsSelecting(false);
            setSelectionComplete(true);
        }

        const handleGlobalMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.classList.contains("slot")) {
                console.log("on clique en dehors, pas bon");
                setIsSelecting(false); // arrête la sélection si on clique en dehors
                setSelectionComplete(false);
                selectedDay.current = null;
                setSelectedSlots([]);
            }
        }

        window.addEventListener("mouseup", handleMouseUp); // relâchement du clic
        window.addEventListener("mousedown", handleGlobalMouseDown); // appui du clic
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousedown", handleGlobalMouseDown);
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => { // fired when 1st click occurs
        if (selectionComplete) {
            console.log("selection complete, faire choix");
            return;
        }

        const target = e.target as HTMLElement;
        const [startHourStr, dayId] = target.id.split('-');
        const startHour = parseInt(startHourStr, 10); // Utiliser un nombre pour les heures
        let endHour = startHour + 1;

        if (!selectedDay.current) {
            selectedDay.current = dayId;
            console.log("Premier jour sélectionné", selectedDay.current);
        }

        if (dayId === selectedDay.current && !selectionComplete) {
            setIsSelecting(true);

            setSelectedSlots(() => [{
                day: selectedDay.current || "",
                startHour,
                endHour
            }]);

            target.classList.add("selected");
            prevStartHour.current = startHour; // Garder en mémoire l'heure de début sélectionnée
        }

        isMouseDown.current = true;
    }

    const handleMouseUp = () => {
        isMouseDown.current = false;
        setSelectionComplete(true);
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (isMouseDown.current && !selectionComplete) {
            const target = e.target as HTMLElement;
    
            if (target.classList.contains("slot")) {
                const [currentHourStr, currentDay] = target.id.split('-');
                const currentHourNumber = parseInt(currentHourStr, 10); 
    
                // Si le jour sélectionné est différent, on arrête
                if (selectedDay.current && currentDay !== selectedDay.current) {
                    console.log("Jour sélectionné différent, retour.");
                    return;
                }
    
                // Mise à jour de l'état des slots sélectionnés
                setSelectedSlots((prevSelected) => {
                    if (prevSelected.length === 0) return prevSelected;
    
                    const startHourNumber = prevSelected[0].startHour
                    let newStartHour = startHourNumber;
                    let newEndHour = currentHourNumber + 1; // Ajout d'1 pour avoir l'heure de fin correcte
    
                    // Si l'utilisateur sélectionne vers le haut (inversé), on ajuste startHour et endHour
                    if (currentHourNumber < startHourNumber) {
                        newStartHour = currentHourNumber;
                        newEndHour = prevSelected[0].endHour; // on garde l'ancien endHour
                    } else {
                        newEndHour = currentHourNumber + 1; // Ajout de 1 pour obtenir l'heure de fin correcte
                    }
     // Empêche de sélectionner une case "en trop" si endHour est supérieur à startHour
     if (newEndHour <= newStartHour) {
        newEndHour = newStartHour + 1; // Si endHour est plus petit ou égal, on réajuste
    }
                    // Mise à jour de l'affichage
                    updateSelectedSlotsUI(currentDay, newStartHour, newEndHour);
    
                    // Retourner le nouvel état avec l'heure de fin correctement ajustée
                    return [{
                        day: currentDay || "",
                        startHour: newStartHour,
                        endHour: newEndHour
                    }];
                });
            }
        }
    }
    

    const updateSelectedSlotsUI = (day: string, startHour: number, endHour: number) => {
        // supprimer tous les styles de la sélection
        document.querySelectorAll(".selected").forEach((slot) => {
            slot.classList.remove("selected");
        });

        // ajouter la classe "selected" aux cases qui sont dans la plage sélectionnée
        for (let hour = startHour; hour <= endHour; hour++) {
            const slot = document.getElementById(`${formatHoursInferiorTo10(hour)}-${day}`);
            if (slot) {
                slot.classList.add("selected");
            }
        }
    }

    return {
        selectedSlots,
        handleMouseDown,
        handleMouseEnter,
        handleMouseUp,
    }
}
