"""Report validation helper module."""

from typing import Any, List, Optional, Sequence, TypeVar

T = TypeVar("T")


class ReportGenerationError(Exception):
    """Exception raised for errors during report validation and generation.

    Attributes:
        message: Explanation of why the report generation failed.
    """

    def __init__(self, message: str) -> None:
        """Initializes ReportGenerationError with an error message.

        Args:
            message: Explanation of why report generation or validation failed.
        """
        super().__init__(message)
        self.message: str = message


def validate_report_data(
    data: Optional[Sequence[T]], report_name: str = "Report"
) -> Sequence[T]:
    """Validates that a dataset for report generation is not missing or empty.

    Checks that the provided data sequence is not None, is a valid sequence,
    and contains at least one non-None record.

    Args:
        data: The sequence of data records (e.g., books, members) to validate.
        report_name: The name of the report for meaningful error messages.
            Defaults to "Report".

    Returns:
        The validated sequence of data items.

    Raises:
        ReportGenerationError: If `data` is None, not a sequence, empty, or contains
            only null/None elements.
    """
    if data is None:
        raise ReportGenerationError(
            f"Validation Error: '{report_name}' data cannot be None."
        )

    if not isinstance(data, (list, tuple, set)):
        raise ReportGenerationError(
            f"Validation Error: '{report_name}' data must be a sequence (e.g., list or tuple), got {type(data).__name__}."
        )

    if len(data) == 0:
        raise ReportGenerationError(
            f"Validation Error: '{report_name}' data is empty. Cannot generate report from empty data."
        )

    if all(item is None for item in data):
        raise ReportGenerationError(
            f"Validation Error: '{report_name}' contains only null/None records."
        )

    return data


def validate_record_attributes(
    record: Any, required_attributes: List[str], record_name: str = "Record"
) -> None:
    """Validates that a report record has all required attributes populated.

    Supports both object instances with attributes and dictionary mappings.

    Args:
        record: The record object or dictionary to check.
        required_attributes: A list of attribute or key names that must be
            present and non-empty.
        record_name: A descriptive label for the record in error messages.
            Defaults to "Record".

    Returns:
        None

    Raises:
        ReportGenerationError: If `record` is None, missing any required
            attribute, or if any required attribute value is None or an empty string.
    """
    if record is None:
        raise ReportGenerationError(
            f"Validation Error: '{record_name}' cannot be None."
        )

    missing_attrs: List[str] = []
    empty_attrs: List[str] = []

    for attr in required_attributes:
        if isinstance(record, dict):
            if attr not in record:
                missing_attrs.append(attr)
                continue
            val = record[attr]
        else:
            if not hasattr(record, attr):
                missing_attrs.append(attr)
                continue
            val = getattr(record, attr)

        if val is None:
            empty_attrs.append(attr)
        elif isinstance(val, str) and not val.strip():
            empty_attrs.append(attr)

    if missing_attrs:
        raise ReportGenerationError(
            f"Validation Error: {record_name} is missing required attribute(s): {', '.join(missing_attrs)}."
        )

    if empty_attrs:
        raise ReportGenerationError(
            f"Validation Error: {record_name} has empty required attribute(s): {', '.join(empty_attrs)}."
        )
