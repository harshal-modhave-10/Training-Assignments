# GitHub Repository Tracker

A lightweight web application built with asynchronous JavaScript that tracks GitHub user profiles and public repositories in real time.

## Features
- **Fetch Profile & Repositories**: Uses GitHub REST API with `async/await`.
- **Auto-Refresh**: Automatically re-fetches data every 60 seconds using `setInterval()`.
- **Error Handling**: Graceful feedback for non-existent users, zero public repos, and network errors.

## Tech Stack
- HTML5
- CSS3
- JavaScript (ES6+ Async/Await, Fetch API)