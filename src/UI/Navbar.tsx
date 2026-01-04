import React, { useState } from "react";
import { useAuthStatus } from "../hooks/useAuthStatus";
import AuthModal from "../components/AuthModal"; // ajuste le chemin

interface NavbarProps {
  onTabChange?: (tab: string) => void;
  currentSchedule?: { id: string; name: string } | null;
}

const Navbar: React.FC<NavbarProps> = ({ onTabChange, currentSchedule }) => {
  const [activeTab, setActiveTab] = useState("Emploi du temps");

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabs = [
    "Emploi du temps",
    "Gérer les activités",
    "Mes emplois du temps",
    "Livres / Films",
    "Debug",
  ];
  const { user, isOnlineMode } = useAuthStatus();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  return (
    <nav className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`px-4 py-2 rounded-md text-sm font-medium
            ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
        >
          {tab}
        </button>
      ))}
      {currentSchedule && (
        <div className="text-sm text-gray-600 dark:text-gray-300 ml-4">
          <p>
            <strong>Édition :</strong> {currentSchedule.name} (ID:{" "}
            {currentSchedule.id})
          </p>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full border
               border-gray-300 dark:border-gray-700"
          title={
            isOnlineMode
              ? "Connecté – données synchronisées"
              : "Mode local – données sur cet appareil"
          }
        >
          {isOnlineMode ? "Online" : "Local"}
        </span>

        <button
          onClick={() => setIsAuthOpen(true)}
          className="rounded-xl border px-3 py-2 text-sm font-semibold
               hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {user ? (
            <span className="max-w-[140px] truncate inline-block align-middle">
              {user.displayName || user.email}
            </span>
          ) : (
            "Connexion"
          )}
        </button>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
};

export default Navbar;
