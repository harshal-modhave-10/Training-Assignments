const request = require('supertest');
const assert = require('assert');
const app = require('../src/app');
const { bookStore: store } = require('../src/store/bookStore');

describe('Book Tracking API Tests', () => {
  beforeEach(() => {
    store.reset();
  });

  describe('POST /books', () => {
    it('should create a book with valid input', async () => {
      const payload = {
        title: 'The Pragmatic Programmer',
        author: 'Andy Hunt & Dave Thomas',
        genre: 'Technology',
        rating: 5,
        status: 'COMPLETED'
      };

      const res = await request(app)
        .post('/books')
        .send(payload)
        .expect(201);

      assert.strictEqual(res.body.title, 'The Pragmatic Programmer');
      assert.strictEqual(res.body.author, 'Andy Hunt & Dave Thomas');
      assert.strictEqual(res.body.genre, 'Technology');
      assert.strictEqual(res.body.rating, 5);
      assert.strictEqual(res.body.status, 'COMPLETED');
      assert(res.body.id !== undefined);
      assert(res.body.createdAt !== undefined);
    });

    it('should create a book with minimal required fields and default status to WISHLIST', async () => {
      const res = await request(app)
        .post('/books')
        .send({
          title: 'Clean Code',
          author: 'Robert C. Martin'
        })
        .expect(201);

      assert.strictEqual(res.body.title, 'Clean Code');
      assert.strictEqual(res.body.author, 'Robert C. Martin');
      assert.strictEqual(res.body.status, 'WISHLIST');
      assert.strictEqual(res.body.genre, null);
      assert.strictEqual(res.body.rating, null);
    });

    it('should return 400 if title is missing or empty', async () => {
      const res1 = await request(app)
        .post('/books')
        .send({ author: 'Author Name' })
        .expect(400);
      assert(res1.body.error);

      const res2 = await request(app)
        .post('/books')
        .send({ title: '   ', author: 'Author Name' })
        .expect(400);
      assert(res2.body.error);
    });

    it('should return 400 if author is missing or empty', async () => {
      const res1 = await request(app)
        .post('/books')
        .send({ title: 'Book Title' })
        .expect(400);
      assert(res1.body.error);

      const res2 = await request(app)
        .post('/books')
        .send({ title: 'Book Title', author: '   ' })
        .expect(400);
      assert(res2.body.error);
    });

    it('should return 400 if rating is outside 1-5 or invalid type', async () => {
      await request(app)
        .post('/books')
        .send({ title: 'Title', author: 'Author', rating: 0 })
        .expect(400);

      await request(app)
        .post('/books')
        .send({ title: 'Title', author: 'Author', rating: 6 })
        .expect(400);

      await request(app)
        .post('/books')
        .send({ title: 'Title', author: 'Author', rating: 'five' })
        .expect(400);

      await request(app)
        .post('/books')
        .send({ title: 'Title', author: 'Author', rating: true })
        .expect(400);
    });

    it('should return 400 if status is invalid', async () => {
      const res = await request(app)
        .post('/books')
        .send({ title: 'Title', author: 'Author', status: 'FINISHED' })
        .expect(400);

      assert(res.body.error);
    });
  });

  describe('GET /books', () => {
    beforeEach(() => {
      store.create({ title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', status: 'READING', rating: 5 });
      store.create({ title: 'Foundation', author: 'Isaac Asimov', genre: 'Sci-Fi', status: 'COMPLETED', rating: 4 });
      store.create({ title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', status: 'WISHLIST', rating: 5 });
    });

    it('should list all books', async () => {
      const res = await request(app)
        .get('/books')
        .expect(200);

      assert.strictEqual(Array.isArray(res.body), true);
      assert.strictEqual(res.body.length, 3);
    });

    it('should filter books by genre (case-insensitive)', async () => {
      const res = await request(app)
        .get('/books?genre=sci-fi')
        .expect(200);

      assert.strictEqual(res.body.length, 2);
      assert(res.body.every(b => b.genre.toLowerCase() === 'sci-fi'));
    });

    it('should filter books by status (case-insensitive)', async () => {
      const res = await request(app)
        .get('/books?status=completed')
        .expect(200);

      assert.strictEqual(res.body.length, 1);
      assert.strictEqual(res.body[0].title, 'Foundation');
    });

    it('should filter books by both genre and status', async () => {
      const res = await request(app)
        .get('/books?genre=sci-fi&status=READING')
        .expect(200);

      assert.strictEqual(res.body.length, 1);
      assert.strictEqual(res.body[0].title, 'Dune');
    });
  });

  describe('GET /books/search?q={query}', () => {
    beforeEach(() => {
      store.create({ title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help' });
      store.create({ title: 'Deep Work', author: 'Cal Newport', genre: 'Productivity' });
      store.create({ title: 'Clear Thinking', author: 'Shane Parrish', genre: 'Philosophy' });
    });

    it('should search books matching title case-insensitively', async () => {
      const res = await request(app)
        .get('/books/search?q=habits')
        .expect(200);

      assert.strictEqual(res.body.length, 1);
      assert.strictEqual(res.body[0].title, 'Atomic Habits');
    });

    it('should search books matching author case-insensitively', async () => {
      const res = await request(app)
        .get('/books/search?q=clear')
        .expect(200);

      // Matches "Atomic Habits" (author: James Clear) and "Clear Thinking" (title: Clear Thinking)
      assert.strictEqual(res.body.length, 2);
    });

    it('should return empty array if no match found', async () => {
      const res = await request(app)
        .get('/books/search?q=nonexistent')
        .expect(200);

      assert.strictEqual(res.body.length, 0);
    });

    it('should return 400 if search query parameter q is missing or empty', async () => {
      await request(app)
        .get('/books/search')
        .expect(400);

      await request(app)
        .get('/books/search?q=')
        .expect(400);

      await request(app)
        .get('/books/search?q=%20%20')
        .expect(400);
    });
  });

  describe('GET /books/stats', () => {
    it('should return zeroed statistics when no books exist', async () => {
      const res = await request(app)
        .get('/books/stats')
        .expect(200);

      assert.strictEqual(res.body.totalBooks, 0);
      assert.strictEqual(res.body.averageRating, 0);
      assert.strictEqual(res.body.byStatus.READING, 0);
      assert.strictEqual(res.body.byStatus.COMPLETED, 0);
      assert.strictEqual(res.body.byStatus.WISHLIST, 0);
    });

    it('should calculate accurate statistics for populated books', async () => {
      store.create({ title: 'Book 1', author: 'Author 1', status: 'READING', rating: 4, genre: 'Fiction' });
      store.create({ title: 'Book 2', author: 'Author 2', status: 'READING', rating: 5, genre: 'Fiction' });
      store.create({ title: 'Book 3', author: 'Author 3', status: 'COMPLETED', rating: 3, genre: 'Non-Fiction' });
      store.create({ title: 'Book 4', author: 'Author 4', status: 'WISHLIST' }); // unrated

      const res = await request(app)
        .get('/books/stats')
        .expect(200);

      assert.strictEqual(res.body.totalBooks, 4);
      assert.strictEqual(res.body.byStatus.READING, 2);
      assert.strictEqual(res.body.byStatus.COMPLETED, 1);
      assert.strictEqual(res.body.byStatus.WISHLIST, 1);
      assert.strictEqual(res.body.ratedBooksCount, 3);
      assert.strictEqual(res.body.averageRating, 4); // (4+5+3)/3 = 4.0
      assert.strictEqual(res.body.byGenre['Fiction'], 2);
      assert.strictEqual(res.body.byGenre['Non-Fiction'], 1);
    });
  });

  describe('GET /books/:id', () => {
    it('should return book by id', async () => {
      const created = store.create({ title: '1984', author: 'George Orwell' });

      const res = await request(app)
        .get(`/books/${created.id}`)
        .expect(200);

      assert.strictEqual(res.body.id, created.id);
      assert.strictEqual(res.body.title, '1984');
      assert.strictEqual(res.body.author, 'George Orwell');
    });

    it('should return 404 if book is not found', async () => {
      const res = await request(app)
        .get('/books/9999')
        .expect(404);

      assert.strictEqual(res.body.error, 'Book not found');
    });
  });

  describe('PUT /books/:id', () => {
    it('should update an existing book', async () => {
      const created = store.create({
        title: 'Original Title',
        author: 'Original Author',
        status: 'WISHLIST'
      });

      const res = await request(app)
        .put(`/books/${created.id}`)
        .send({
          title: 'Updated Title',
          status: 'READING',
          rating: 4
        })
        .expect(200);

      assert.strictEqual(res.body.id, created.id);
      assert.strictEqual(res.body.title, 'Updated Title');
      assert.strictEqual(res.body.author, 'Original Author');
      assert.strictEqual(res.body.status, 'READING');
      assert.strictEqual(res.body.rating, 4);
    });

    it('should return 404 when updating non-existent book', async () => {
      const res = await request(app)
        .put('/books/9999')
        .send({ title: 'New Title' })
        .expect(404);

      assert.strictEqual(res.body.error, 'Book not found');
    });

    it('should return 400 when updating with empty body', async () => {
      const created = store.create({ title: 'Title', author: 'Author' });

      await request(app)
        .put(`/books/${created.id}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when updating with invalid title or rating or status', async () => {
      const created = store.create({ title: 'Title', author: 'Author' });

      await request(app)
        .put(`/books/${created.id}`)
        .send({ title: '   ' })
        .expect(400);

      await request(app)
        .put(`/books/${created.id}`)
        .send({ rating: 10 })
        .expect(400);

      await request(app)
        .put(`/books/${created.id}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete an existing book', async () => {
      const created = store.create({ title: 'To Delete', author: 'Author' });

      const res = await request(app)
        .delete(`/books/${created.id}`)
        .expect(200);

      assert.strictEqual(res.body.message, 'Book deleted successfully');
      assert.strictEqual(res.body.book.id, created.id);

      // Verify book no longer exists
      await request(app)
        .get(`/books/${created.id}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent book', async () => {
      const res = await request(app)
        .delete('/books/9999')
        .expect(404);

      assert.strictEqual(res.body.error, 'Book not found');
    });
  });
});
