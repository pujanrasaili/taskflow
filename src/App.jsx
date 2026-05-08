import { useState } from "react";
import "./App.css";

const FILTERS = ["All", "Active", "Completed"];

export default function App() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Set up GitHub repository", done: true },
    { id: 2, text: "Build something amazing", done: false },
    { id: 3, text: "Push to GitHub 🚀", done: false },
  ]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("All");

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks([...tasks, { id: Date.now(), text: trimmed, done: false }]);
    setInput("");
  };

  const toggleTask = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const clearCompleted = () => setTasks(tasks.filter((t) => !t.done));

  const filtered = tasks.filter((t) => {
    if (filter === "Active") return !t.done;
    if (filter === "Completed") return t.done;
    return true;
  });

  const remaining = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="app">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="grain" />

      <div className="container">
        <header className="header">
          <div className="logo-mark">✦</div>
          <h1 className="title">TaskFlow</h1>
          <p className="subtitle">Get things done, beautifully.</p>
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{progress}% complete</span>
          </div>
        </header>

        <div className="input-row">
          <input
            className="task-input"
            type="text"
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button className="add-btn" onClick={addTask}>
            <span className="add-icon">+</span>
            <span>Add</span>
          </button>
        </div>

        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>

        <ul className="task-list">
          {filtered.length === 0 && (
            <li className="empty">
              <span className="empty-icon">✧</span>
              <span>No tasks here. Add one above!</span>
            </li>
          )}
          {filtered.map((task, i) => (
            <li
              key={task.id}
              className={`task-item ${task.done ? "done" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                className={`check-btn ${task.done ? "checked" : ""}`}
                onClick={() => toggleTask(task.id)}
              >
                {task.done && (
                  <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="task-text">{task.text}</span>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <footer className="footer">
          <span className="footer-count">
            {remaining} item{remaining !== 1 ? "s" : ""} left
          </span>
          {tasks.some((t) => t.done) && (
            <button className="clear-btn" onClick={clearCompleted}>Clear completed</button>
          )}
        </footer>
      </div>
    </div>
  );
}