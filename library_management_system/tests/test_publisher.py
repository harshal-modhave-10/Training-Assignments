"""Unit tests for the Publisher domain model."""

import sys
from pathlib import Path
from typing import Any, Dict
import unittest

# Ensure 'src' directory is in Python path for test execution
SRC_PATH = Path(__file__).resolve().parent.parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

try:
    from pydantic import ValidationError
    from models.publisher import Publisher
    PYDANTIC_AVAILABLE = True
except ImportError:
    PYDANTIC_AVAILABLE = False


@unittest.skipUnless(PYDANTIC_AVAILABLE, "pydantic is not installed in the environment")
class TestPublisherModel(unittest.TestCase):
    """Test suite for the Publisher domain model."""

    def test_publisher_instantiation_valid(self) -> None:
        """Test creating a Publisher with valid fields."""
        publisher = Publisher(
            id="pub-001",
            name="O'Reilly Media",
            address="1005 Gravenstein Highway North, Sebastopol, CA",
        )
        self.assertEqual(publisher.id, "pub-001")
        self.assertEqual(publisher.name, "O'Reilly Media")
        self.assertEqual(
            publisher.address, "1005 Gravenstein Highway North, Sebastopol, CA"
        )

    def test_publisher_to_dict(self) -> None:
        """Test the .to_dict() method of Publisher."""
        publisher = Publisher(
            id="pub-002",
            name="Penguin Random House",
            address="1745 Broadway, New York, NY",
        )
        pub_dict: Dict[str, Any] = publisher.to_dict()
        self.assertEqual(
            pub_dict,
            {
                "id": "pub-002",
                "name": "Penguin Random House",
                "address": "1745 Broadway, New York, NY",
            },
        )

    def test_publisher_missing_fields_raises_validation_error(self) -> None:
        """Test that missing required fields raise ValidationError."""
        with self.assertRaises(ValidationError):
            Publisher(id="pub-003", name="Incomplete Publisher")  # type: ignore[call-arg]

        with self.assertRaises(ValidationError):
            Publisher()  # type: ignore[call-arg]

    def test_publisher_invalid_data_types(self) -> None:
        """Test that invalid non-coercible data types raise ValidationError."""
        with self.assertRaises((ValidationError, TypeError, ValueError)):
            Publisher(id=None, name="Valid Name", address="Valid Address")  # type: ignore[arg-type]


if __name__ == "__main__":
    unittest.main()

