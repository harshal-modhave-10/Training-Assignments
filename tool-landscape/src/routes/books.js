const express = require('express');
const router = express.Router();
const { bookStore, VALID_STATUSES } = require('../store/bookStore');

// --- Validation Middlewares ---

function validateCreateBook(req, res, next) {
  const { title, author, rating, status, genre } = req.body || {};
  const errors = [];

  if (title === undefined || title === null || typeof title !== 'string' || title.trim() === '') {
    errors.push("'title' is required and must be a non-empty string");
  }

  if (author === undefined || author === null || typeof author !== 'string' || author.trim() === '') {
    errors.push("'author' is required and must be a non-empty string");
  }

  if (rating !== undefined && rating !== null) {
    const numRating = Number(rating);
    if (typeof rating === 'boolean' || isNaN(numRating) || numRating < 1 || numRating > 5) {
      errors.push("'rating' must be a number between 1 and 5");
    }
  }

  if (status !== undefined && status !== null) {
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status.trim().toUpperCase())) {
      errors.push(`'status' must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (genre !== undefined && genre !== null && typeof genre !== 'string') {
    errors.push("'genre' must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid input', details: errors });
  }

  next();
}

function validateUpdateBook(req, res, next) {
  const { title, author, rating, status, genre } = req.body || {};
  const errors = [];

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Invalid input', details: ['Request body cannot be empty'] });
  }

  if (title !== undefined) {
    if (title === null || typeof title !== 'string' || title.trim() === '') {
      errors.push("'title' must be a non-empty string");
    }
  }

  if (author !== undefined) {
    if (author === null || typeof author !== 'string' || author.trim() === '') {
      errors.push("'author' must be a non-empty string");
    }
  }

  if (rating !== undefined && rating !== null) {
    const numRating = Number(rating);
    if (typeof rating === 'boolean' || isNaN(numRating) || numRating < 1 || numRating > 5) {
      errors.push("'rating' must be a number between 1 and 5");
    }
  }

  if (status !== undefined && status !== null) {
    if (typeof status !== 'string' || !VALID_STATUSES.includes(status.trim().toUpperCase())) {
      errors.push(`'status' must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (genre !== undefined && genre !== null && typeof genre !== 'string') {
    errors.push("'genre' must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Invalid input', details: errors });
  }

  next();
}

function validateSearchQuery(req, res, next) {
  const { q } = req.query;
  if (q === undefined || q === null || typeof q !== 'string' || q.trim() === '') {
    return res.status(400).json({
      error: 'Invalid input',
      details: ["Search query parameter 'q' is required and cannot be empty"]
    });
  }
  next();
}

// --- Routes & Handlers ---

// POST /books - Create book
router.post('/', validateCreateBook, (req, res) => {
  const newBook = bookStore.create(req.body);
  return res.status(201).json(newBook);
});

// GET /books - List books (with optional ?genre and ?status filters)
router.get('/', (req, res) => {
  const { genre, status } = req.query;
  const books = bookStore.getAll({ genre, status });
  return res.status(200).json(books);
});

// GET /books/search?q={query} - Substring search on title/author
router.get('/search', validateSearchQuery, (req, res) => {
  const { q } = req.query;
  const results = bookStore.search(q);
  return res.status(200).json(results);
});

// GET /books/stats - Aggregate statistics
router.get('/stats', (req, res) => {
  const stats = bookStore.getStats();
  return res.status(200).json(stats);
});

// GET /books/:id - Get book by ID
router.get('/:id', (req, res) => {
  const book = bookStore.getById(req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(200).json(book);
});

// PUT /books/:id - Update book by ID
router.put('/:id', validateUpdateBook, (req, res) => {
  const updatedBook = bookStore.update(req.params.id, req.body);
  if (!updatedBook) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(200).json(updatedBook);
});

// DELETE /books/:id - Delete book by ID
router.delete('/:id', (req, res) => {
  const deletedBook = bookStore.delete(req.params.id);
  if (!deletedBook) {
    return res.status(404).json({ error: 'Book not found' });
  }
  return res.status(200).json({
    message: 'Book deleted successfully',
    book: deletedBook
  });
});

module.exports = router;
