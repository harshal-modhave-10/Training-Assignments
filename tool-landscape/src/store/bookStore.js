// Unified in-memory store using Map for fast O(1) lookups and business logic

const VALID_STATUSES = ['READING', 'COMPLETED', 'WISHLIST'];

class BookStore {
  constructor() {
    this.books = new Map();
    this.nextId = 1;
  }

  // Reset store (useful for test isolation)
  reset() {
    this.books.clear();
    this.nextId = 1;
  }

  // Retrieve all books with optional genre and status filters
  getAll(filters = {}) {
    const list = Array.from(this.books.values());

    return list.filter(book => {
      let match = true;
      if (filters.genre && typeof filters.genre === 'string') {
        match = match && Boolean(book.genre && book.genre.toLowerCase() === filters.genre.trim().toLowerCase());
      }
      if (filters.status && typeof filters.status === 'string') {
        match = match && Boolean(book.status && book.status.toUpperCase() === filters.status.trim().toUpperCase());
      }
      return match;
    });
  }

  // Retrieve book by ID
  getById(id) {
    return this.books.get(String(id)) || null;
  }

  // Substring search on title or author (case-insensitive)
  search(query) {
    if (!query || typeof query !== 'string') {
      return [];
    }
    const qLower = query.trim().toLowerCase();
    const list = Array.from(this.books.values());

    return list.filter(book => {
      const titleMatch = book.title && book.title.toLowerCase().includes(qLower);
      const authorMatch = book.author && book.author.toLowerCase().includes(qLower);
      return Boolean(titleMatch || authorMatch);
    });
  }

  // Create and store a new book
  create(data) {
    const id = String(this.nextId++);
    const book = {
      id,
      title: data.title.trim(),
      author: data.author.trim(),
      genre: data.genre && typeof data.genre === 'string' ? data.genre.trim() : null,
      rating: data.rating !== undefined && data.rating !== null ? Number(data.rating) : null,
      status: (data.status && typeof data.status === 'string')
        ? data.status.trim().toUpperCase()
        : 'WISHLIST',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.books.set(id, book);
    return book;
  }

  // Update an existing book
  update(id, data) {
    const key = String(id);
    const existing = this.books.get(key);
    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      author: data.author !== undefined ? data.author.trim() : existing.author,
      genre: data.genre !== undefined
        ? (data.genre && typeof data.genre === 'string' ? data.genre.trim() : null)
        : existing.genre,
      rating: data.rating !== undefined
        ? (data.rating !== null ? Number(data.rating) : null)
        : existing.rating,
      status: data.status !== undefined
        ? data.status.trim().toUpperCase()
        : existing.status,
      updatedAt: new Date().toISOString()
    };

    this.books.set(key, updated);
    return updated;
  }

  // Delete a book by ID
  delete(id) {
    const key = String(id);
    const existing = this.books.get(key);
    if (!existing) {
      return null;
    }
    this.books.delete(key);
    return existing;
  }

  // Aggregate statistics across the book collection
  getStats() {
    const list = Array.from(this.books.values());
    const totalBooks = list.length;

    const byStatus = {
      READING: 0,
      COMPLETED: 0,
      WISHLIST: 0
    };

    let totalRating = 0;
    let ratedCount = 0;
    const byGenre = {};

    list.forEach(book => {
      if (book.status && byStatus.hasOwnProperty(book.status)) {
        byStatus[book.status]++;
      }
      if (book.rating !== null && book.rating !== undefined && !isNaN(book.rating)) {
        totalRating += book.rating;
        ratedCount++;
      }
      if (book.genre) {
        byGenre[book.genre] = (byGenre[book.genre] || 0) + 1;
      }
    });

    const averageRating = ratedCount > 0
      ? Number((totalRating / ratedCount).toFixed(2))
      : 0;

    return {
      totalBooks,
      byStatus,
      averageRating,
      ratedBooksCount: ratedCount,
      byGenre
    };
  }
}

const bookStore = new BookStore();

module.exports = {
  BookStore,
  VALID_STATUSES,
  bookStore
};
