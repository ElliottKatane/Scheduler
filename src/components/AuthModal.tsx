import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!isOpen) return null;

  const loginGoogle = async () => {
    if (isBusy) return;
    setIsBusy(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Ferme la modal immédiatement
      onClose();

      // Toast succès
      const name =
        result.user.displayName ?? result.user.email ?? "Utilisateur";
      toast.success("Connexion réussie", { description: name });
    } catch (err: any) {
      toast.error("Connexion échouée", {
        description: err?.message ?? "Une erreur est survenue",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const logout = async () => {
    if (isBusy) return;
    setIsBusy(true);

    try {
      await signOut(auth);
      onClose();
      toast.success("Déconnexion réussie");
    } catch (err: any) {
      toast.error("Déconnexion échouée", {
        description: err?.message ?? "Une erreur est survenue",
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   p-5 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Connexion</h3>

        {user ? (
          <button
            onClick={logout}
            disabled={isBusy}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-semibold
                       hover:bg-gray-100 dark:hover:bg-gray-600
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBusy ? "Déconnexion..." : "Se déconnecter"}
          </button>
        ) : (
          <button
            onClick={loginGoogle}
            disabled={isBusy}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-semibold
                       hover:bg-gray-100 dark:hover:bg-gray-600
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isBusy ? "Connexion..." : "Se connecter avec Google"}
          </button>
        )}
      </div>
    </div>
  );
}
