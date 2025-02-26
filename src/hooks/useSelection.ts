import { useEffect, useState, useRef } from "react";
import { formatHoursInferiorTo10 } from "../constants";

export const useSelection = () => {

    interface SelectedSlot {
        day: string;
        startHour: string;
        endHour: string;
    }
    const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([])
    const selectedDay = useRef<string | null>(null);

    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionComplete, setSelectionComplete] = useState(false)

    const isMouseDown = useRef<boolean>(false) // la souris est-elle enfoncée ?

    useEffect(() => {
        const handleMouseUp = () => {
            isMouseDown.current = false;
            setIsSelecting(false);
            setSelectionComplete(true);
        }
        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.classList.contains("slot")) {
                setIsSelecting(false); // arrête la sélection si on clique en dehors
            }
        }

        window.addEventListener("mouseup", handleMouseUp) // relâchement du clic
        window.addEventListener("mousedown", handleMouseDown) // appui du clic

        return () => {
            window.removeEventListener("mouseup", handleMouseUp)
            window.removeEventListener("mousedown", handleMouseDown)
        }
    }, [])

    // mettre à jour l'état des slots sélectionnés dès le premier clic.
    useEffect(() => {
        if (selectedSlots.length > 0) {
            console.log("selected slots ", selectedSlots);
        }
        else return
    }, [selectedSlots]);

    const handleMouseDown = (e: React.MouseEvent) => { // fired when 1st click occurs
        if (selectionComplete) {
            console.log("selection complete, faire choix")
            return 
        }  
        const target = e.target as HTMLElement;
        const [startHour, dayId] = target.id.split('-')
        const endHour = (parseInt(startHour) + 1).toString() + "h00";
        console.log("startHour: " + startHour);
        console.log("endHour: " + endHour);
        console.log("dayId: " + dayId);

        if (target.classList.contains("slot")) {
            console.log(dayId)
          
            if (!selectedDay.current) {
                selectedDay.current = dayId;
                console.log("Premier jour sélectionné", selectedDay.current)
            }
            if (dayId === selectedDay.current && !selectionComplete) {
                setIsSelecting(true);
                setSelectedSlots(() => [ {
                    day: selectedDay.current || "", // jour sélectionné
                    startHour: startHour, // heure de début
                    endHour: endHour, // heure de fin
                }])
                target.classList.add("selected");
            }
            isMouseDown.current = true;

        }
    }
    const handleMouseUp = () => {
        // Une fois que l'user relâche le clic, on termine la sélection
        isMouseDown.current = false;
        setSelectionComplete(true)
    }
    const handleMouseEnter = (e: React.MouseEvent) => { // lorsque le clic est maintenu et qu'on va dans d'autres cellules :

        if (isMouseDown.current && !selectionComplete) {
            const target = e.target as HTMLElement

            if (target.classList.contains("slot")) {
                // on récupère les infos de la case survolée : heure et jour de la cellule
                const [currentHour, currentDay] = target.id.split('-');
                let currentHourNumber = parseInt(currentHour.split("h")[0]);
                // si elles sont différentes du useRef selectedDay.current (défini au mouseClick), alors on arrête et empêche la sélection.
                if (selectedDay.current && currentDay !== selectedDay.current) {
                    console.log("Jour sélectionné différent, retour.");
                    return; // Si on essaie de sélectionner un autre jour, on arrête
                }

                setSelectedSlots((prevSelected) => {
                    
            if (prevSelected.length === 0) return prevSelected;
                const startHourNumber = parseInt(prevSelected[0].startHour.split("h")[0]); // Extraction de l'heure de début
                let newStartHour = prevSelected[0].startHour;
                let newEndHour = prevSelected[0].endHour;

                // Si l'utilisateur sélectionne vers le haut (inversé), on ajuste startHour et endHour correctement
                if (currentHourNumber < startHourNumber) {
                    newStartHour = formatHoursInferiorTo10(currentHourNumber)+"h00";
                    newEndHour = prevSelected[0].endHour; // On garde l'ancien endHour
                } else {
                    newEndHour = formatHoursInferiorTo10(currentHourNumber)+"h00"; // Sinon, on met à jour normalement
                }
               // Mise à jour de l'affichage
               updateSelectedSlotsUI(currentDay, newStartHour, newEndHour);
                return [{
                    day: currentDay || "",
                    startHour: newStartHour,
                    endHour: newEndHour
                }];
            });
            }
        }
    }
    const updateSelectedSlotsUI = (day: string, startHour: string, endHour: string) => {
        // supprimer tous les styles de la sélection
        document.querySelectorAll(".selected").forEach((slot) => {
            slot.classList.remove("selected")
        })
        // ajouter la classe "selected" aux cases qui sont dans la plage sélectionnée

        const start = parseInt(startHour.split("h")[0])
        const end = parseInt(endHour.split("h")[0])

        for (let hour = start; hour <= end; hour++) {
            const slot = document.getElementById(`${formatHoursInferiorTo10(hour)}h00-${day}`)
            console.log(slot)
            if (slot) {
                slot.classList.add("selected")
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