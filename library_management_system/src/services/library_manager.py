from typing import Dict, List, Optional
from models.book import Book
from models.member import Member

class LibraryManager:
    def __init__(self):
        # In-memory "databases"
        self.books: Dict[str, Book] = {}
        self.members: Dict[str, Member] = {}
        self.daily_fine_rate: float = 50

    def add_book(self, book: Book) -> None:
        self.books[book.book_id] = book

    def register_member(self, member: Member) -> None:
        self.members[member.member_id] = member

    def checkout_book(self, member_id: str, book_id: str) -> None:
        member = self.members.get(member_id)
        book = self.books.get(book_id)

        if not member or not book:
            raise ValueError("Invalid member ID or book ID.")
        
        if member.accumulated_fines > 250:
            raise PermissionError("Cannot borrow books with outstanding fines over 250₹.")

        book.check_out()
        member.borrow_book(book_id)

    def process_return(self, member_id: str, book_id: str) -> None:
        member = self.members.get(member_id)
        book = self.books.get(book_id)

        if not member or not book:
            raise ValueError("Invalid member ID or book ID.")

        if book.is_overdue():
            # Flat fine for simplicity, but could be calculated by days overdue
            member.add_fine(self.daily_fine_rate * 5) 

        book.return_book()
        member.return_book(book_id)

    def search_books_by_author(self, author_name: str) -> List[Book]:
        return [book for book in self.books.values() if author_name.lower() in book.author.lower()]
