from typing import List
from models.book import Book
from models.member import Member

def generate_inventory_report(books: List[Book]) -> str:
    """Generates a formatted text report of current book inventory.

    Args:
        books: A list of Book instances to include in the report.

    Returns:
        A formatted string representation of the library inventory report.
    """
    lines = ["Library Inventory Report", "=" * 24]
    
    for book in books:
        status = "Borrowed" if book.is_borrowed else "Available"
        lines.append(f"[{status}] {book.title} by {book.author} ({book.year_published})")
        if book.is_borrowed:
            lines.append(f"    -> Due: {book.due_date[:10]}")
            
    return "\n".join(lines)

def generate_financial_report(members: List[Member]) -> str:
    """Generates a formatted text report of members' outstanding fines.

    Args:
        members: A list of Member instances to include in the report.

    Returns:
        A formatted string representation of outstanding fines.
    """
    lines = ["Outstanding Fines Report", "=" * 24]
    total_fines = 0.0
    
    for member in members:
        if member.accumulated_fines > 0:
            lines.append(f"{member.name} ({member.email}): ₹{member.accumulated_fines:.2f}")
            total_fines += member.accumulated_fines
            
    lines.append("-" * 24)
    lines.append(f"Total Outstanding: ₹{total_fines:.2f}")
    return "\n".join(lines)
