# Organization Management System (TypeScript)

A robust, strongly-typed, object-oriented Organization Management system built using TypeScript for Node.js.

---

## 📌 Features

* **Object-Oriented Design (OOP)**: Utilizes abstract base classes, inheritance, encapsulation, and factory design patterns.
* **Strict Hierarchy Rules**: Enforces predefined reporting relationships across all designations.
* **CRUD Operations**: Full support for adding, updating, retrieving, and deleting employees.
* **Comprehensive Validations**:

  * Unique employee ID verification.
  * Single CEO constraint per organization.
  * Date of Birth format validation (`mm/dd/yyyy`).
  * Safe deletion preventing removal of employees who currently have active reportees.
  * Hierarchy validation preventing invalid reporting assignments.

---

## 🛠️ Project Setup & Installation

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher)
* `npm` (comes bundled with Node.js)

### Installation

1. Clone the repository and navigate to the project directory:

   ```bash
   git clone https://github.com/your-username/rsl-training-26-harshal-modhave.git
   cd rsl-training-26-harshal-modhave
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

---

## 🚀 Execution Commands

* **Run in Development Mode (Live Execution via ts-node)**:

  ```bash
  npm start
  ```

* **Build / Compile TypeScript**:

  ```bash
  npm run build
  ```

* **Run Compiled JavaScript (Dist Output)**:

  ```bash
  node dist/index.js
  ```

---

## 📁 Project Structure

```text
rsl-training-26-harshal-modhave/
├── src/
│   ├── organization.ts   # Data models, classes, hierarchy constraints, & CRUD logic
│   └── index.ts           # Mock execution script demonstrating features & edge cases
├── dist/                 # Compiled JavaScript output (generated after build)
├── package.json          # Project configuration & npm scripts
├── tsconfig.json         # TypeScript compiler options (strict mode)
└── README.md             # Project documentation
```

---

## 💡 Design Approach & Assumptions

### 1. Designation Hierarchy & Reporting Rules

The organization follows a strict top-down reporting hierarchy:

* **CEO**: Top-level executive. Reports to no one (`reportsTo` is null/undefined).
* **Director**: Reports directly to a **CEO**.
* **Manager**: Reports directly to a **Director**.
* **Lead**: Reports directly to a **Manager**.
* **Engineer**: Reports directly to a **Lead**. Has no reportees.

### 2. OOP Concepts Applied

* **Abstraction & Inheritance**: A base abstract `Employee` class contains shared properties (`id`, `name`, `dateOfBirth`, `designation`, `reportsTo`, `reportees`) and methods. Subclasses (`CEO`, `Director`, `Manager`, `Lead`, `Engineer`) implement designation-specific logic.

* **Factory Pattern**: An `EmployeeFactory` handles instantiation, enforcing designation-specific rules and optional/required parameter checks.

### 3. Edge Cases & Safety Logic

* **Single CEO Rule**: The system restricts creation to exactly one CEO at any given time.

* **Deletion Hierarchy Guard**: An employee cannot be deleted if they currently have active reportees assigned to them. Active reportees must be reassigned or deleted first.

* **Automated Relationship Syncing**: Assigning or reassigning an employee automatically updates the `reportees` list on the corresponding manager object.
