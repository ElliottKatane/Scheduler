import { useContext, useState } from "react";
import { BooksAndMoviesContext } from "../context/BooksAndMoviesContext";
import "../CSS/BooksAndMovies.css";

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
        <li key={entry.id}>
          <input
            className={
              editError && !editedEntry.title.trim() ? "input-error" : ""
            }
            value={editedEntry.title}
            onChange={(e) => {
              setEditedEntry({ ...editedEntry, title: e.target.value });
              if (editError) setEditError(false);
            }}
          />

          <input
            value={editedEntry.author || ""}
            onChange={(e) =>
              setEditedEntry({ ...editedEntry, author: e.target.value })
            }
          />
          <input
            type="date"
            value={editedEntry.date || ""}
            onChange={(e) =>
              setEditedEntry({ ...editedEntry, date: e.target.value })
            }
          />
          <input
            placeholder="Lien"
            value={editedEntry.link || ""}
            onChange={(e) =>
              setEditedEntry({ ...editedEntry, link: e.target.value })
            }
          />

          <span
            className="icon"
            title="Enregistrer"
            onClick={() => handleSaveEdit(type)}
          >
            💾
          </span>
          <span className="icon" title="Annuler" onClick={handleCancelEdit}>
            ❌
          </span>
        </li>
      );
    }

    return (
      <li key={entry.id}>
        {entry.link ? (
          <a href={entry.link} target="_blank" rel="noopener noreferrer">
            <strong>{entry.title}</strong>
          </a>
        ) : (
          <strong>{entry.title}</strong>
        )}
        {entry.author && ` — ${entry.author}`}
        {entry.date && ` (${formatDate(entry.date)})`}
        <span
          className="icon"
          title="Modifier"
          onClick={() => handleEdit(entry)}
        >
          ✏️
        </span>
        <span
          className="icon"
          title="Supprimer"
          onClick={() => handleDelete(entry.id, type)}
        >
          ❌
        </span>
      </li>
    );
  };

  return (
    <div className="books-movies-container">
      <div className="column">
        <h2>Livres lus en {new Date().getFullYear()}</h2>
        <ul>{books.map((b) => renderEntry(b, "book"))}</ul>
        <div className="form">
          <input
            placeholder="Titre du livre *"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          />
          <input
            placeholder="Auteur"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          />
          <input
            type="date"
            value={newBook.date}
            onChange={(e) => setNewBook({ ...newBook, date: e.target.value })}
          />
          <input
            placeholder="Lien (facultatif)"
            value={newBook.link}
            onChange={(e) => setNewBook({ ...newBook, link: e.target.value })}
          />

          <button onClick={() => handleAdd("book")}>Ajouter</button>
        </div>
      </div>

      <div className="column">
        <h2>Films vus en {new Date().getFullYear()}</h2>
        <ul>{movies.map((m) => renderEntry(m, "movie"))}</ul>
        <div className="form">
          <input
            placeholder="Titre du film *"
            value={newMovie.title}
            onChange={(e) =>
              setNewMovie({ ...newMovie, title: e.target.value })
            }
          />
          <input
            placeholder="Réalisateur"
            value={newMovie.author}
            onChange={(e) =>
              setNewMovie({ ...newMovie, author: e.target.value })
            }
          />
          <input
            type="date"
            value={newMovie.date}
            onChange={(e) => setNewMovie({ ...newMovie, date: e.target.value })}
          />
          <input
            placeholder="Lien (facultatif)"
            value={newMovie.link}
            onChange={(e) => setNewMovie({ ...newMovie, link: e.target.value })}
          />

          <button onClick={() => handleAdd("movie")}>Ajouter</button>
        </div>
      </div>
    </div>
  );
}
