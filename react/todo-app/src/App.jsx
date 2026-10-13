import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn ReactJS basics', completed: true },
    { id: 2, text: 'Practice ReactJS', completed: false },
    { id: 3, text: 'Learn Redux', completed: false },
    { id: 4, text: 'Code portfolio in React', completed: false },
    { id: 5, text: 'Learn React Native', completed: false },
  ]);

  const [inputTask, setInputTask] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'DONE' | 'TODO'

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // 1. Add Todo (Adds as last item)
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!inputTask.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: inputTask,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInputTask('');
  };

  // 2. Toggle Complete
  const handleToggleComplete = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: true } : todo
      )
    );
  };

  // 3. Edit Todo Logic
  const handleStartEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleConfirmEdit = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: editText } : todo
      )
    );
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // 4. Delete Todo (with optional confirmation dialog)
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this task?'
    );
    if (confirmDelete) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  // 5. Sorting & Filtering
  // Requirement: Completed tasks shown first, followed by pending tasks
  const getSortedTodos = (todoList) => {
    return [...todoList].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? -1 : 1;
    });
  };

  const getFilteredTodos = () => {
    let filtered = todos;
    if (filter === 'DONE') {
      filtered = todos.filter((t) => t.completed);
    } else if (filter === 'TODO') {
      filtered = todos.filter((t) => !t.completed);
    }
    return getSortedTodos(filtered);
  };

  const displayedTodos = getFilteredTodos();

  return (
    <div className="app-container">
      {/* TodoInput Section */}
      <h2 className="section-title">TodoInput</h2>
      <div className="card input-card">
        <div className="input-group">
          <span className="input-icon">📋</span>
          <input
            type="text"
            placeholder="New Todo"
            value={inputTask}
            onChange={(e) => setInputTask(e.target.value)}
            className="todo-input-field"
          />
        </div>
        <button className="btn btn-primary" onClick={handleAddTodo}>
          Add new task
        </button>
      </div>

      {/* TodoList Section */}
      <h2 className="section-title">TodoList</h2>

      {/* Filter Buttons: Visible only when at least 1 todo item exists in state */}
      {todos.length > 0 && (
        <div className="filter-container">
          <button
            className={`btn btn-filter ${filter === 'ALL' ? 'active' : 'inactive'}`}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          <button
            className={`btn btn-filter ${filter === 'DONE' ? 'active' : 'inactive'}`}
            onClick={() => setFilter('DONE')}
          >
            Done
          </button>
          <button
            className={`btn btn-filter ${filter === 'TODO' ? 'active' : 'inactive'}`}
            onClick={() => setFilter('TODO')}
          >
            Todo
          </button>
        </div>
      )}

      {/* List / Empty Message Display */}
      {todos.length === 0 ? (
        <div className="empty-message">No todo is available</div>
      ) : (
        <div className="todo-list">
          {displayedTodos.map((todo) => (
            <div key={todo.id} className="todo-item card">
              {editingId === todo.id ? (
                /* Edit State View */
                <div className="edit-container">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-input-field"
                  />
                  <div className="action-buttons">
                    <button
                      className="btn btn-confirm"
                      onClick={() => handleConfirmEdit(todo.id)}
                    >
                      Confirm
                    </button>
                    <button
                      className="btn btn-cancel"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal State View */
                <div className="item-row">
                  <span
                    className={`todo-text ${
                      todo.completed ? 'completed-text' : ''
                    }`}
                  >
                    {todo.text}
                  </span>
                  <div className="action-buttons">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      disabled={todo.completed}
                      onChange={() => handleToggleComplete(todo.id)}
                      className="todo-checkbox"
                    />

                    {/* Edit button: Hidden/disabled if task is completed */}
                    {!todo.completed && (
                      <button
                        className="btn btn-edit"
                        onClick={() => handleStartEdit(todo)}
                      >
                        Edit
                      </button>
                    )}

                    {/* Delete button: Active only when task is completed */}
                    <button
                      className="btn btn-delete"
                      disabled={!todo.completed}
                      onClick={() => handleDelete(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
