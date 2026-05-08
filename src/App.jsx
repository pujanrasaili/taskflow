import { useState } from "react";
import "./App.css";

const FILTERS = ["All", "Active", "Completed"];

function formatDue(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  if (diff < 0) return { label: "Overdue", cls: "overdue" };
  if (diff === 0) return { label: "Today", cls: "today" };
  if (diff === 1) return { label: "Tomorrow", cls: "" };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cls: "",
  };
}

export default function App() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Set up GitHub repository", done: true,  due: "" },
    { id: 2, text: "Build something amazing",  done: false, due: "" },
    { id: 3, text: "Push to GitHub 🚀",        done: false, due: "" },
  ]);
  const [input, setInput]   = useState("");
  const [due, setDue]       = useState("");
  const [filter, setFilter] = useState("All");

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks([...tasks, { id: Date.now(), text: trimmed, done: false, due }]);
    setInput("");
    setDue("");
  };

  const toggleTask = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask   = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const clearCompleted = () => setTasks(tasks.filter((t) => !t.done));

  const filtered = tasks.filter((t) => {
    if (filter === "Active")    return !t.done;
    if (filter === "Completed") return t.done;
    return true;
  });

  const remaining      = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;
  const progress       = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="app">
      {/* Side columns */}
      <div className="side-left">
        <span className="side-label">TaskFlow — v2</span>
      </div>

      {/* Main panel */}
      <main className="panel">
        {/* Header */}
        <header className="header">
          <div className="header-top">
            <div className="brand">
              <span className="logo-mark">TaskFlow</span>
              <h1 className="title">Your <em>Tasks</em></h1>
            </div>
            <div className="header-stats">
              <span className="stat-number">{remaining}</span>
              <span className="stat-label">remaining</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-pct">{progress}%</span>
          </div>
        </header>

        {/* Input */}
        <div className="input-section">
          <div className="input-row">
            <input
              className="task-input"
              type="text"
              placeholder="What needs to be done?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <input
              className="task-input"
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              style={{ width: 140, borderLeft: "1px solid var(--border)", flexShrink: 0, colorScheme: "dark" }}
            />
            <button className="add-btn" onClick={addTask}>Add</button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-section">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>

        {/* Tasks */}
        <ul className="task-list">
          {filtered.length === 0 && (
            <li className="empty">
              <span className="empty-icon">∅</span>
              <span className="empty-text">Nothing here</span>
            </li>
          )}
          {filtered.map((task, i) => {
            const dueInfo = formatDue(task.due);
            return (
              <li
                key={task.id}
                className={`task-item ${task.done ? "done" : ""}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <button
                  className={`check-btn ${task.done ? "checked" : ""}`}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.done && (
                    <svg viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                <div className="task-body">
                  <span className="task-text">{task.text}</span>
                  {dueInfo && (
                    <span className={`task-due ${dueInfo.cls}`}>
                      ◈ {dueInfo.label}
                    </span>
                  )}
                </div>

                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <footer className="footer">
          <span className="footer-count">
            {remaining} item{remaining !== 1 ? "s" : ""} left
          </span>
          {tasks.some((t) => t.done) && (
            <button className="clear-btn" onClick={clearCompleted}>
              Clear completed
            </button>
          )}
        </footer>
      </main>

      {/* Side right */}
      <div className="side-right">
        <span className="side-label">{completedCount} done</span>
      </div>
    </div>
  );
}