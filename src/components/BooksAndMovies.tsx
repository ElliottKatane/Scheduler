import { useContext, useState } from "react";
import { BooksAndMoviesContext } from "../context/BooksAndMoviesContext";

type Entry = {
  id: string;
  title: string;
  author?: string;
  date?: string;
  link?: string;
};

export default function BooksAndMovies() {
  const context = useContext(BooksAndMoviesContext);
  if (!context) return null;

  const { books, movies, addBook, deleteBook, addMovie, deleteMovie } = context;

  const [newBook, setNewBook] = useState<Entry>({
    id: "",
    title: "",
    author: "",
    date: "",
    link: "",
  });

  const [newMovie, setNewMovie] = useState<Entry>({
    id: "",
    title: "",
    author: "",
    date: "",
    link: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedEntry, setEditedEntry] = useState<Entry | null>(null);
  const [editError, setEditError] = useState(false);

  const handleAdd = (type: "book" | "movie") => {
    const entry = type === "book" ? newBook : newMovie;
    if (!entry.title.trim()) return;

    const newEntry: Entry = {
      ...entry,
      id: Date.now().toString(),
    };

    if (type === "book") {
      addBook(newEntry);
      setNewBook({ id: "", title: "", author: "", date: "", link: "" });
    } else {
      addMovie(newEntry);
      setNewMovie({ id: "", title: "", author: "", date: "", link: "" });
    }
  };

  const handleDelete = (id: string, type: "book" | "movie") => {
    if (type === "book") deleteBook(id);
    else deleteMovie(id);
  };

  const handleEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditedEntry({ ...entry });
  };

  const handleSaveEdit = (type: "book" | "movie") => {
    if (!editedEntry || !editedEntry.title.trim()) {
      setEditError(true);
      return;
    }

    const update = type === "book" ? addBook : addMovie;
    const remove = type === "book" ? deleteBook : deleteMovie;

    remove(editedEntry.id);
    update(editedEntry);

    setEditingId(null);
    setEditedEntry(null);
    setEditError(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedEntry(null);
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const renderEntry = (entry: Entry, type: "book" | "movie") => {
    const isEditing = editingId === entry.id;

    if (isEditing && editedEntry) {
      return (
        <li
          key={entry.id}
          className="flex flex-wrap md:flex-nowrap gap-2 items-center mb-2"
        >
          <input
            className={`flex-1 min-w-[120px] border rounded px-2 py-1 ${
              editError && !editedEntry.title.trim()
                ? "border-red-500"
                : "border-gray-300"
            }`}
            value={editedEntry.title}
            onChange={(e) => {
              setEditedEntry({ ...editedEntry, title: e.target.value });
              if (editError) setEditError(false);
            }}
          />
          <input
            className="border border-gray-300 rounded px-2 py-1"
            value={editedEntry.author || ""}
            onChange={(e) =>
              setEditedEntry({ ...editedEntry, author: e.target.value })
            }
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1"
            value={editedEntry.date || ""}
            onChange={(e) =>
              setEditedEntry({ ...editedEntry, date: e.target.value })
            }
          />
          <input
            placeholder="Lien"
            className="border border-gray-300 rounded px-2 py-1"
            value={editedEntry.link || ""}
            onChange={(e) =>
              setEditedEntry({ ...editedEntry, link: e.target.value })
            }
          />
          <span
            className="cursor-pointer text-green-600 hover:underline"
            title="Enregistrer"
            onClick={() => handleSaveEdit(type)}
          >
            💾
          </span>
          <span
            className="cursor-pointer text-red-600 hover:underline"
            title="Annuler"
            onClick={handleCancelEdit}
          >
            ❌
          </span>
        </li>
      );
    }

    return (
      <li key={entry.id} className="mb-2 flex items-center gap-2 flex-wrap">
        {entry.link ? (
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            {entry.title}
          </a>
        ) : (
          <strong>{entry.title}</strong>
        )}
        {entry.author && (
          <span className="text-gray-700">— {entry.author}</span>
        )}
        {entry.date && (
          <span className="text-gray-500">({formatDate(entry.date)})</span>
        )}
        <span
          className="cursor-pointer text-yellow-600 hover:underline"
          title="Modifier"
          onClick={() => handleEdit(entry)}
        >
          ✏️
        </span>
        <span
          className="cursor-pointer text-red-600 hover:underline"
          title="Supprimer"
          onClick={() => handleDelete(entry.id, type)}
        >
          ❌
        </span>
      </li>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 max-w-screen-lg mx-auto">
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">
          Livres lus en {new Date().getFullYear()}
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          <input
            className="border border-gray-300 rounded px-2 py-1"
            placeholder="Titre du livre *"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          />
          <input
            className="border border-gray-300 rounded px-2 py-1"
            placeholder="Auteur"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1"
            value={newBook.date}
            onChange={(e) => setNewBook({ ...newBook, date: e.target.value })}
          />
          <input
            className="border border-gray-300 rounded px-2 py-1"
            placeholder="Lien (facultatif)"
            value={newBook.link}
            onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => handleAdd("book")}
          >
            Ajouter
          </button>
        </div>
        <ul>{books.map((b) => renderEntry(b, "book"))}</ul>
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">
          Films vus en {new Date().getFullYear()}
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          <input
            className="border border-gray-300 rounded px-2 py-1"
            placeholder="Titre du film *"
            value={newMovie.title}
            onChange={(e) =>
              setNewMovie({ ...newMovie, title: e.target.value })
            }
          />
          <input
            className="border border-gray-300 rounded px-2 py-1"
            placeholder="Réalisateur"
            value={newMovie.author}
            onChange={(e) =>
              setNewMovie({ ...newMovie, author: e.target.value })
            }
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1"
            value={newMovie.date}
            onChange={(e) => setNewMovie({ ...newMovie, date: e.target.value })}
          />
          <input
            className="border border-gray-300 rounded px-2 py-1"
            placeholder="Lien (facultatif)"
            value={newMovie.link}
            onChange={(e) => setNewMovie({ ...newMovie, link: e.target.value })}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => handleAdd("movie")}
          >
            Ajouter
          </button>
        </div>
      </div>
      <ul>{movies.map((m) => renderEntry(m, "movie"))}</ul>
    </div>
  );
}
