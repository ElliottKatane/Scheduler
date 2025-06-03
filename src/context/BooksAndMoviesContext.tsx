import { createContext, useState, useEffect, ReactNode } from "react";

type Entry = {
  id: string;
  title: string;
  author?: string;
  date?: string;
};

interface BooksAndMoviesContextType {
  books: Entry[];
  movies: Entry[];
  addBook: (book: Entry) => void;
  deleteBook: (id: string) => void;
  addMovie: (movie: Entry) => void;
  deleteMovie: (id: string) => void;
}

export const BooksAndMoviesContext =
  createContext<BooksAndMoviesContextType | null>(null);

export const BooksAndMoviesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [books, setBooks] = useState<Entry[]>(() => {
    const stored = localStorage.getItem("books");
    return stored ? JSON.parse(stored) : [];
  });

  const [movies, setMovies] = useState<Entry[]>(() => {
    const stored = localStorage.getItem("movies");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem("movies", JSON.stringify(movies));
  }, [movies]);

  const addBook = (book: Entry) => {
    setBooks((prev) => [...prev, book]);
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const addMovie = (movie: Entry) => {
    setMovies((prev) => [...prev, movie]);
  };

  const deleteMovie = (id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <BooksAndMoviesContext.Provider
      value={{ books, movies, addBook, deleteBook, addMovie, deleteMovie }}
    >
      {children}
    </BooksAndMoviesContext.Provider>
  );
};
