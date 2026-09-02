"""Unit tests for report validation helpers and custom ReportGenerationError in src/reports/validator.py."""

import sys
from pathlib import Path
from typing import Any, Dict, List
import unittest

# Ensure 'src' directory is in Python path for test execution
SRC_PATH = Path(__file__).resolve().parent.parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from models.book import Book
from reports.validator import (
    ReportGenerationError,
    validate_record_attributes,
    validate_report_data,
)


class TestValidateReportData(unittest.TestCase):
    """Test suite for validate_report_data function and ReportGenerationError."""

    def test_valid_data_list(self) -> None:
        """Test that valid non-empty list passes and is returned."""
        books = [Book("1984", "George Orwell", 1949)]
        result = validate_report_data(books, "Inventory Report")
        self.assertEqual(result, books)

    def test_none_data_raises_report_generation_error(self) -> None:
        """Test that None data raises ReportGenerationError."""
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_report_data(None, "Inventory Report")
        self.assertIn("'Inventory Report' data cannot be None", str(ctx.exception))

    def test_invalid_type_raises_report_generation_error(self) -> None:
        """Test that non-sequence data raises ReportGenerationError."""
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_report_data(12345, "Inventory Report")  # type: ignore[arg-type]
        self.assertIn("data must be a sequence", str(ctx.exception))

    def test_empty_sequence_raises_report_generation_error(self) -> None:
        """Test that empty list raises ReportGenerationError."""
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_report_data([], "Financial Report")
        self.assertIn("data is empty", str(ctx.exception))

    def test_only_none_elements_raises_report_generation_error(self) -> None:
        """Test that sequence with only None items raises ReportGenerationError."""
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_report_data([None, None], "Inventory Report")
        self.assertIn("contains only null/None records", str(ctx.exception))


class TestValidateRecordAttributes(unittest.TestCase):
    """Test suite for validate_record_attributes function."""

    def test_valid_object_attributes(self) -> None:
        """Test that object with required non-empty attributes passes."""
        book = Book("1984", "George Orwell", 1949)
        validate_record_attributes(book, ["title", "author", "year_published"], "Book")

    def test_valid_dict_attributes(self) -> None:
        """Test that dict with required non-empty keys passes."""
        data: Dict[str, Any] = {"name": "Alice", "email": "alice@example.com"}
        validate_record_attributes(data, ["name", "email"], "Member")

    def test_none_record_raises_report_generation_error(self) -> None:
        """Test that None record raises ReportGenerationError."""
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_record_attributes(None, ["title"], "Book")
        self.assertIn("'Book' cannot be None", str(ctx.exception))

    def test_missing_attribute_on_object_raises_report_generation_error(self) -> None:
        """Test that missing attribute on object raises ReportGenerationError."""
        book = Book("1984", "George Orwell", 1949)
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_record_attributes(book, ["title", "isbn"], "Book")
        self.assertIn("missing required attribute(s): isbn", str(ctx.exception))

    def test_missing_key_in_dict_raises_report_generation_error(self) -> None:
        """Test that missing key in dictionary raises ReportGenerationError."""
        data: Dict[str, Any] = {"name": "Alice"}
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_record_attributes(data, ["name", "email"], "Member")
        self.assertIn("missing required attribute(s): email", str(ctx.exception))

    def test_empty_string_attribute_raises_report_generation_error(self) -> None:
        """Test that empty string attribute value raises ReportGenerationError."""
        book = Book("   ", "George Orwell", 1949)
        with self.assertRaises(ReportGenerationError) as ctx:
            validate_record_attributes(book, ["title", "author"], "Book")
        self.assertIn("empty required attribute(s): title", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
