"""Unit tests for validation helpers in src/services/validator.py."""

import sys
from pathlib import Path
from typing import Any, Dict, List
import unittest

# Ensure 'src' directory is in Python path for test execution
SRC_PATH = Path(__file__).resolve().parent.parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from services.validator import validate_missing_fields, validate_required_data


class TestValidateRequiredData(unittest.TestCase):
    """Test suite for validate_required_data function."""

    def test_valid_string(self) -> None:
        """Test that valid non-empty string passes and is returned."""
        result = validate_required_data("George Orwell", "author")
        self.assertEqual(result, "George Orwell")

    def test_valid_numeric_and_bool_values(self) -> None:
        """Test that valid numbers and boolean values pass."""
        self.assertEqual(validate_required_data(0, "count"), 0)
        self.assertEqual(validate_required_data(1984, "year"), 1984)
        self.assertEqual(validate_required_data(False, "flag"), False)

    def test_valid_non_empty_collections(self) -> None:
        """Test that non-empty collections pass validation."""
        self.assertEqual(validate_required_data([1, 2, 3], "items"), [1, 2, 3])
        self.assertEqual(validate_required_data({"key": "val"}, "mapping"), {"key": "val"})

    def test_none_value_raises_value_error(self) -> None:
        """Test that None raises ValueError with appropriate message."""
        with self.assertRaises(ValueError) as ctx:
            validate_required_data(None, "book_id")
        self.assertIn("'book_id' cannot be None", str(ctx.exception))

    def test_empty_string_raises_value_error(self) -> None:
        """Test that an empty string raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_required_data("", "title")
        self.assertIn("'title' cannot be empty or whitespace", str(ctx.exception))

    def test_whitespace_string_raises_value_error(self) -> None:
        """Test that whitespace-only string raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_required_data("   \t\n", "title")
        self.assertIn("'title' cannot be empty or whitespace", str(ctx.exception))

    def test_empty_collection_raises_value_error(self) -> None:
        """Test that empty list, dict, set, or tuple raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_required_data([], "tags")
        self.assertIn("'tags' cannot be an empty collection", str(ctx.exception))

        with self.assertRaises(ValueError) as ctx:
            validate_required_data({}, "metadata")
        self.assertIn("'metadata' cannot be an empty collection", str(ctx.exception))


class TestValidateMissingFields(unittest.TestCase):
    """Test suite for validate_missing_fields function."""

    def test_all_required_fields_present_and_valid(self) -> None:
        """Test that dictionary with all required populated fields passes without error."""
        data: Dict[str, Any] = {
            "title": "1984",
            "author": "George Orwell",
            "year_published": 1949,
        }
        # Should not raise any exception
        validate_missing_fields(data, ["title", "author", "year_published"])

    def test_non_dict_data_raises_value_error(self) -> None:
        """Test that non-dictionary data raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            validate_missing_fields(None, ["title"])  # type: ignore[arg-type]
        self.assertIn("must be a valid non-None dictionary", str(ctx.exception))

    def test_missing_key_raises_value_error(self) -> None:
        """Test that missing dictionary keys raise ValueError mentioning the missing keys."""
        data: Dict[str, Any] = {"title": "1984"}
        with self.assertRaises(ValueError) as ctx:
            validate_missing_fields(data, ["title", "author", "isbn"])
        self.assertIn("Missing required field(s): author, isbn", str(ctx.exception))

    def test_none_field_value_raises_value_error(self) -> None:
        """Test that field containing None raises ValueError."""
        data: Dict[str, Any] = {"title": "1984", "author": None}
        with self.assertRaises(ValueError) as ctx:
            validate_missing_fields(data, ["title", "author"])
        self.assertIn("field(s) cannot be empty: author", str(ctx.exception))

    def test_empty_string_field_value_raises_value_error(self) -> None:
        """Test that field containing empty string raises ValueError."""
        data: Dict[str, Any] = {"title": "   ", "author": "George Orwell"}
        with self.assertRaises(ValueError) as ctx:
            validate_missing_fields(data, ["title", "author"])
        self.assertIn("field(s) cannot be empty: title", str(ctx.exception))

    def test_empty_collection_field_value_raises_value_error(self) -> None:
        """Test that field containing empty collection raises ValueError."""
        data: Dict[str, Any] = {"title": "1984", "genres": []}
        with self.assertRaises(ValueError) as ctx:
            validate_missing_fields(data, ["title", "genres"])
        self.assertIn("field(s) cannot be empty: genres", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()

