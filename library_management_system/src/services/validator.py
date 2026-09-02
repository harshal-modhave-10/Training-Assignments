"""Validation helper module for library services."""

from typing import Any, Dict, List, Optional, TypeVar

T = TypeVar("T")


def validate_required_data(value: Optional[T], field_name: str = "field") -> T:
    """Validates that a data value is present and not empty.

    Checks that the provided value is not None, not an empty or whitespace-only
    string, and not an empty collection (list, dict, set, tuple).

    Args:
        value: The data value to validate.
        field_name: The name or label of the field being validated, used in the
            error message. Defaults to "field".

    Returns:
        The validated value if it is not missing or empty.

    Raises:
        ValueError: If `value` is None, an empty or whitespace-only string, or an
            empty collection.
    """
    if value is None:
        raise ValueError(f"Validation Error: '{field_name}' cannot be None.")

    if isinstance(value, str) and not value.strip():
        raise ValueError(f"Validation Error: '{field_name}' cannot be empty or whitespace.")

    if isinstance(value, (list, dict, set, tuple)) and len(value) == 0:
        raise ValueError(f"Validation Error: '{field_name}' cannot be an empty collection.")

    return value


def validate_missing_fields(data: Dict[str, Any], required_fields: List[str]) -> None:
    """Validates that all required fields exist and are non-empty in a dictionary.

    Args:
        data: The dictionary containing fields to check.
        required_fields: A list of required key names that must exist in `data`
            with non-empty values.

    Returns:
        None

    Raises:
        ValueError: If `data` is None, not a dictionary, is missing any required
            key, or if any required field contains None or empty data.
    """
    if data is None or not isinstance(data, dict):
        raise ValueError("Validation Error: 'data' must be a valid non-None dictionary.")

    missing_keys = [field for field in required_fields if field not in data]
    if missing_keys:
        raise ValueError(
            f"Validation Error: Missing required field(s): {', '.join(missing_keys)}."
        )

    empty_keys: List[str] = []
    for field in required_fields:
        val = data[field]
        if val is None:
            empty_keys.append(field)
        elif isinstance(val, str) and not val.strip():
            empty_keys.append(field)
        elif isinstance(val, (list, dict, set, tuple)) and len(val) == 0:
            empty_keys.append(field)

    if empty_keys:
        raise ValueError(
            f"Validation Error: The following field(s) cannot be empty: {', '.join(empty_keys)}."
        )

