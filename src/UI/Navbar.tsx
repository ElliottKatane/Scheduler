import React, { useState } from "react";
import "./Navbar.css"; // tu peux aussi utiliser Tailwind si tu préfères

interface NavbarProps {
  onTabChange?: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("Emploi du temps");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <nav>
      <button
        className={activeTab === "Emploi du temps" ? "active" : ""}
        onClick={() => handleTabClick("Emploi du temps")}
      >
        Emploi du temps
      </button>
      <button
        className={activeTab === "Gérer les activités" ? "active" : ""}
        onClick={() => handleTabClick("Gérer les activités")}
      >
        Gérer les activités
      </button>
      <button
        className={activeTab === "Mes emplois du temps" ? "active" : ""}
        onClick={() => handleTabClick("Mes emplois du temps")}
      >
        Mes emplois du temps sauvegardés
      </button>
      <button
        className={activeTab === "Debug" ? "active" : ""}
        onClick={() => handleTabClick("Debug")}
      >
        Debug
      </button>
    </nav>
  );
};

export default Navbar;
