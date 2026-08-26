const express = require('express');
const booksRouter = require('./routes/books');

const app = express();

// Body parser middleware
app.use(express.json());

// Handle JSON parsing errors gracefully with a 400 Bad Request
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON payload'
    });
  }
  next(err);
});

// Root welcome / info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Book Tracking API',
    version: '1.0.0',
    endpoints: {
      'POST /books': 'Create a new book',
      'GET /books': 'List all books (supports ?genre= and ?status= filters)',
      'GET /books/search?q={query}': 'Search books by title or author',
      'GET /books/stats': 'Get aggregated reading statistics',
      'GET /books/:id': 'Get book by ID',
      'PUT /books/:id': 'Update book by ID',
      'DELETE /books/:id': 'Delete book by ID'
    }
  });
});

// Mount /books routes
app.use('/books', booksRouter);

// 404 Handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
