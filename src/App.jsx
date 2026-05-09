import { useState } from "react";
import "./App.css";

const FILTERS = ["All", "Active", "Completed"];

function formatDue(dateStr) {
  if (!dateStr) return null;
  const due  = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  due.setHours(0,0,0,0);
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  if (diff < 0)  return { label: "Overdue",   cls: "overdue" };
  if (diff === 0) return { label: "Today",    cls: "today"   };
  if (diff === 1) return { label: "Tomorrow", cls: "soon"    };
  if (diff <= 3)  return { label: `In ${diff} days`, cls: "soon" };
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
  const [due,   setDue]     = useState("");
  const [filter, setFilter] = useState("All");

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks([...tasks, { id: Date.now(), text: trimmed, done: false, due }]);
    setInput("");
    setDue("");
  };

  const toggleTask     = (id) => setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask     = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const clearCompleted = ()   => setTasks(tasks.filter((t) => !t.done));

  const filtered = tasks.filter((t) => {
    if (filter === "Active")    return !t.done;
    if (filter === "Completed") return t.done;
    return true;
  });

  const remaining      = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;
  const progress       = tasks.length
    ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="app">
      <div className="dot-grid" />

      <div className="card">
        {/* ── Header ── */}
        <header className="header">
          <div className="header-row">
            <div className="brand-group">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                TaskFlow
              </div>
              <h1 className="title">Your <span>Tasks</span></h1>
            </div>
            <div className="counter-group">
              <span className="counter-num">{remaining}</span>
              <span className="counter-label">remaining</span>
            </div>
          </div>

          <div className="progress-row">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{progress}%</span>
          </div>
        </header>

        {/* ── Input ── */}
        <div className="input-area">
          <div className="input-wrap">
            <input
              className="task-input"
              type="text"
              placeholder="What needs to be done?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <input
              className="due-input"
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
            <button className="add-btn" onClick={addTask}>Add</button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>

        {/* ── Tasks ── */}
        <ul className="task-list">
          {filtered.length === 0 && (
            <li className="empty-state">
              <span className="empty-glyph">∅</span>
              <span className="empty-text">Nothing here</span>
            </li>
          )}
          {filtered.map((task, i) => {
            const dueInfo = formatDue(task.due);
            return (
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
                    <svg viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                <div className="task-content">
                  <span className="task-text">{task.text}</span>
                  {dueInfo && (
                    <div className={`task-due ${dueInfo.cls}`}>
                      <span className="due-dot" />
                      {dueInfo.label}
                    </div>
                  )}
                </div>

                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  <svg viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ── Footer ── */}
        <footer className="footer">
          <div className="footer-left">
            <span className="footer-count">{remaining} left</span>
            {completedCount > 0 && (
              <>
                <div className="footer-divider" />
                <span className="footer-done">{completedCount} done</span>
              </>
            )}
          </div>
          {tasks.some((t) => t.done) && (
            <button className="clear-btn" onClick={clearCompleted}>Clear done</button>
          )}
        </footer>
      </div>
    </div>
  );
}