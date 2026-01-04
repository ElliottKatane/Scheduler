import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "../firebase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!isOpen) return null;

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // pas obligé de close, mais tu peux
    // onClose();
  };

  const logout = async () => {
    await signOut(auth);
    // onClose();
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
          <>
            <button
              onClick={logout}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-semibold
                         hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <button
            onClick={loginGoogle}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600
                       bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-semibold
                       hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Se connecter avec Google
          </button>
        )}
      </div>
    </div>
  );
}
