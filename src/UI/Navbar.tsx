import React, { useState } from "react";
import { useAuthStatus } from "../hooks/useAuthStatus";
import AuthModal from "../components/AuthModal";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentSchedule?: { id: string; name: string } | null;
}

const TABS = [
  "Emploi du temps",
  "Mes emplois du temps",
  "Gérer les activités",
  "Livres / Films",
  "Revenus",
  "Debug",
] as const;

const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentSchedule,
}) => {
  const { user, isOnlineMode } = useAuthStatus();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const gitSha = import.meta.env.VITE_GIT_SHA as string | undefined;
  const shortSha = gitSha ? gitSha.slice(0, 7) : "dev";

  return (
    <nav className="flex flex-wrap items-center gap-2 p-4 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      {/* Tabs */}
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
        >
          {tab}
        </button>
      ))}

      {/* Current schedule */}
      {currentSchedule && (
        <div className="ml-4 text-sm text-gray-600 dark:text-gray-300">
          <strong>Édition :</strong> {currentSchedule.name}
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
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

        <span className="text-xs text-gray-400">v{shortSha}</span>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
};

export default Navbar;
