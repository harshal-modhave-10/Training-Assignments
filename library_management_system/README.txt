# Library Inventory System - AI Artifacts Playground

This is a lightweight Python project built entirely with the Python standard library. No virtual environments or external dependencies (like `pip install ...`) are required. 

This repository serves as a sandbox for practicing how to manage AI coding assistants (like GitHub Copilot, Cursor, Windsurf, or Claude Code). 
You will use this codebase to test project-wide instructions, folder-scoped rules, and reusable AI skills without getting bogged down in complex application logic.

## Project Structure

The codebase is intentionally separated into distinct architectural layers to help you test directory-specific AI rules:

*   `src/models/`: Contains the data structures (`Book` and `Member`).
*   `src/services/`: Contains the business logic and state management (`LibraryManager`).
*   `src/reports/`: Contains functions for formatting output strings.
*   `src/main.py`: The interactive command-line interface.
*   `tests/`: An empty directory waiting for your AI-generated unit tests.

## How to Run

Navigate to the root directory of the project in your terminal and execute the main script using Python:

```bash
python src/main.py