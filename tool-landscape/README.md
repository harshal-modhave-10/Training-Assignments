# Book Tracking API

A Node.js Express REST API with in-memory storage for managing a book collection and reading list.

---

## Features

- **CRUD Operations**: Create, Read, Update, and Delete books.
- **Filtering**: Filter books by `?genre` and `?status`.
- **Search**: Case-insensitive substring search on `title` and `author` via `/books/search?q={query}`.
- **Statistics**: Aggregated stats via `/books/stats` including total books, status counts, average rating, and genre breakdown.
- **Validation**: Strict validation with `400 Bad Request` for invalid inputs and `404 Not Found` for missing resources.

---

## Getting Started

### Prerequisites
- Node.js (v10+)
- npm

### Installation
```bash
npm install
```

### Running the Server
```bash
npm start
```
The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

### Running Tests
```bash
npm test
```

---

## API Endpoints

### 1. Create a Book
- **Endpoint**: `POST /books`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "genre": "Software Engineering",
    "rating": 5,
    "status": "COMPLETED"
  }
  ```
- **Validation**:
  - `title` (required, non-empty string)
  - `author` (required, non-empty string)
  - `genre` (optional, string)
  - `rating` (optional, number between 1 and 5)
  - `status` (optional, must be `READING`, `COMPLETED`, or `WISHLIST`; defaults to `WISHLIST`)
- **Response**: `201 Created`
  ```json
  {
    "id": "1",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "genre": "Software Engineering",
    "rating": 5,
    "status": "COMPLETED",
    "createdAt": "2026-08-26T11:15:00.000Z",
    "updatedAt": "2026-08-26T11:15:00.000Z"
  }
  ```

---

### 2. List Books
- **Endpoint**: `GET /books`
- **Query Parameters**:
  - `genre` (optional): Filter books by genre (case-insensitive)
  - `status` (optional): Filter books by status (`READING`, `COMPLETED`, `WISHLIST`, case-insensitive)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "1",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "genre": "Software Engineering",
      "rating": 5,
      "status": "COMPLETED",
      "createdAt": "2026-08-26T11:15:00.000Z",
      "updatedAt": "2026-08-26T11:15:00.000Z"
    }
  ]
  ```

---

### 3. Search Books
- **Endpoint**: `GET /books/search?q={query}`
- **Query Parameters**:
  - `q` (required): Search query matching substring in `title` or `author` (case-insensitive)
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "1",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "genre": "Software Engineering",
      "rating": 5,
      "status": "COMPLETED",
      "createdAt": "2026-08-26T11:15:00.000Z",
      "updatedAt": "2026-08-26T11:15:00.000Z"
    }
  ]
  ```

---

### 4. Reading & Collection Statistics
- **Endpoint**: `GET /books/stats`
- **Response**: `200 OK`
  ```json
  {
    "totalBooks": 3,
    "byStatus": {
      "READING": 1,
      "COMPLETED": 1,
      "WISHLIST": 1
    },
    "averageRating": 4.5,
    "ratedBooksCount": 2,
    "byGenre": {
      "Software Engineering": 1,
      "Sci-Fi": 1
    }
  }
  ```

---

### 5. Get Book by ID
- **Endpoint**: `GET /books/:id`
- **Response**:
  - `200 OK` with book object if found.
  - `404 Not Found` (`{"error": "Book not found"}`) if not found.

---

### 6. Update Book by ID
- **Endpoint**: `PUT /books/:id`
- **Headers**: `Content-Type: application/json`
- **Body**: Any field to update (`title`, `author`, `genre`, `rating`, `status`).
- **Response**:
  - `200 OK` with updated book object.
  - `400 Bad Request` if payload is invalid.
  - `404 Not Found` if book does not exist.

---

### 7. Delete Book by ID
- **Endpoint**: `DELETE /books/:id`
- **Response**:
  - `200 OK` with `{ "message": "Book deleted successfully", "book": { ... } }`
  - `404 Not Found` if book does not exist.

---

## Project Structure

```
├── src/
│   ├── app.js            # Express application configuration and middleware
│   ├── server.js         # HTTP server entry point
│   ├── routes/
│   │   └── books.js      # Book route definitions
│   ├── controllers/
│   │   └── books.js      # Controller logic for endpoints
│   ├── models/
│   │   └── store.js      # In-memory store and data access methods
│   └── middleware/
│       └── validation.js # Input validation middlewares
├── tests/
│   └── books.test.js     # Test suite covering all endpoints and edge cases
├── package.json
└── README.md
```
