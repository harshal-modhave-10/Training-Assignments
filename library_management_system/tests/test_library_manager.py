"""Unit tests for LibraryManager and its search functionality."""

import sys
from pathlib import Path
from typing import List
import unittest

# Ensure 'src' directory is in Python path for test execution
SRC_PATH = Path(__file__).resolve().parent.parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from models.book import Book
from services.library_manager import LibraryManager


class TestLibraryManagerSearch(unittest.TestCase):
    """Test suite for LibraryManager.search_books_by_author."""

    def setUp(self) -> None:
        """Set up test fixtures before each test."""
        self.library = LibraryManager()

    def test_search_books_by_author_exact_match(self) -> None:
        """Test searching for books with exact author name match."""
        book1 = Book(title="1984", author="George Orwell", year_published=1949)
        book2 = Book(title="Dune", author="Frank Herbert", year_published=1965)
        self.library.add_book(book1)
        self.library.add_book(book2)

        results: List[Book] = self.library.search_books_by_author("George Orwell")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].title, "1984")
        self.assertEqual(results[0].author, "George Orwell")

    def test_search_books_by_author_case_insensitive(self) -> None:
        """Test searching for books with case-insensitive matching."""
        book = Book(title="Dune", author="Frank Herbert", year_published=1965)
        self.library.add_book(book)

        results_lower: List[Book] = self.library.search_books_by_author("frank herbert")
        results_upper: List[Book] = self.library.search_books_by_author("FRANK HERBERT")
        results_mixed: List[Book] = self.library.search_books_by_author("fRaNk HeRbErT")

        self.assertEqual(len(results_lower), 1)
        self.assertEqual(len(results_upper), 1)
        self.assertEqual(len(results_mixed), 1)
        self.assertEqual(results_lower[0].title, "Dune")

    def test_search_books_by_author_partial_match(self) -> None:
        """Test searching for books by partial author name substring."""
        book1 = Book(title="Harry Potter and the Sorcerer's Stone", author="J.K. Rowling", year_published=1997)
        book2 = Book(title="Animal Farm", author="George Orwell", year_published=1945)
        self.library.add_book(book1)
        self.library.add_book(book2)

        results: List[Book] = self.library.search_books_by_author("Rowling")
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].title, "Harry Potter and the Sorcerer's Stone")

    def test_search_books_by_author_multiple_matches(self) -> None:
        """Test searching for author with multiple books in the library."""
        book1 = Book(title="1984", author="George Orwell", year_published=1949)
        book2 = Book(title="Animal Farm", author="George Orwell", year_published=1945)
        book3 = Book(title="Dune", author="Frank Herbert", year_published=1965)
        self.library.add_book(book1)
        self.library.add_book(book2)
        self.library.add_book(book3)

        results: List[Book] = self.library.search_books_by_author("Orwell")
        self.assertEqual(len(results), 2)
        titles = [b.title for b in results]
        self.assertIn("1984", titles)
        self.assertIn("Animal Farm", titles)

    def test_search_books_by_author_no_match(self) -> None:
        """Test searching for an author not present in the library."""
        book = Book(title="1984", author="George Orwell", year_published=1949)
        self.library.add_book(book)

        results: List[Book] = self.library.search_books_by_author("Isaac Asimov")
        self.assertEqual(results, [])

    def test_search_books_by_author_empty_inventory(self) -> None:
        """Test searching when library has no books."""
        results: List[Book] = self.library.search_books_by_author("Any Author")
        self.assertEqual(results, [])


if __name__ == "__main__":
    unittest.main()

