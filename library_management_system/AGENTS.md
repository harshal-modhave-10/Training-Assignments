# Antigravity Global Project Standards

## Mandatory Rules
1. **Type Annotations**: All function signatures must include strict Python type hints for arguments and return types (e.g., `def get_book(book_id: str) -> Optional[Book]:`).
2. **Docstring Standard**: Every public function and class must include a Google-style docstring containing `Args:`, `Returns:`, and `Raises:` sections where applicable.
3. **Unit Tests**: Whenever a new module or function is created, automatically generate a corresponding unit test file under the `tests/` directory using `pytest`.