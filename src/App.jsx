import { useState, useEffect, useRef } from "react";
import "./App.css";

const FILTERS = ["All", "Active", "Completed"];
const STORAGE_KEY = "taskflow-tasks";

const DEFAULT_TASKS = [
  { id: 1, text: "Set up GitHub repository", done: true,  due: "" },
  { id: 2, text: "Build something amazing",  done: false, due: "" },
  { id: 3, text: "Push to GitHub 🚀",        done: false, due: "" },
];

function formatDue(dateStr) {
  if (!dateStr) return null;
  const due   = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  due.setHours(0,0,0,0);
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  if (diff < 0)   return { label: "Overdue",        cls: "overdue" };
  if (diff === 0) return { label: "Today",           cls: "today"   };
  if (diff === 1) return { label: "Tomorrow",        cls: "soon"    };
  if (diff <= 3)  return { label: `In ${diff} days`, cls: "soon"    };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cls: "",
  };
}

export default function App() {
  // ── State ──────────────────────────────────────────
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch { return DEFAULT_TASKS; }
  });

  const [input,    setInput]    = useState("");
  const [due,      setDue]      = useState("");
  const [filter,   setFilter]   = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editText,  setEditText]  = useState("");

  // Drag state
  const dragItem    = useRef(null);
  const dragOverItem = useRef(null);

  // ── Persist to localStorage ────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ── Task actions ───────────────────────────────────
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

  // ── Edit actions ───────────────────────────────────
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      setTasks(tasks.map((t) => t.id === editingId ? { ...t, text: trimmed } : t));
    }
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // ── Drag handlers ──────────────────────────────────
  const onDragStart = (e, index) => {
    dragItem.current = index;
    e.currentTarget.classList.add("dragging");
  };

  const onDragEnter = (e, index) => {
    dragOverItem.current = index;
    e.currentTarget.classList.add("drag-over");
  };

  const onDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const onDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
    document.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));

    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const reordered = [...tasks];
    const draggedTask = reordered.splice(dragItem.current, 1)[0];
    reordered.splice(dragOverItem.current, 0, draggedTask);
    dragItem.current    = null;
    dragOverItem.current = null;
    setTasks(reordered);
  };

  const onDragOver = (e) => e.preventDefault();

  // ── Derived ────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    if (filter === "Active")    return !t.done;
    if (filter === "Completed") return t.done;
    return true;
  });

  const remaining      = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;
  const progress       = tasks.length
    ? Math.round((completedCount / tasks.length) * 100) : 0;

  // ── Render ─────────────────────────────────────────
  return (
    <div className="app">
      <div className="dot-grid" />

      <div className="card">
        {/* Header */}
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

        {/* Input */}
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

        {/* Filters */}
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>

        {/* Task list */}
        <ul className="task-list">
          {filtered.length === 0 && (
            <li className="empty-state">
              <span className="empty-glyph">∅</span>
              <span className="empty-text">Nothing here</span>
            </li>
          )}

          {filtered.map((task, i) => {
            const dueInfo   = formatDue(task.due);
            const isEditing = editingId === task.id;

            return (
              <li
                key={task.id}
                className={`task-item ${task.done ? "done" : ""} ${isEditing ? "editing" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                draggable={!isEditing}
                onDragStart={(e) => onDragStart(e, i)}
                onDragEnter={(e) => onDragEnter(e, i)}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
              >
                {/* Drag handle */}
                <span className="drag-handle" title="Drag to reorder">
                  <svg viewBox="0 0 8 14" fill="none">
                    <circle cx="2" cy="2"  r="1" fill="currentColor"/>
                    <circle cx="6" cy="2"  r="1" fill="currentColor"/>
                    <circle cx="2" cy="7"  r="1" fill="currentColor"/>
                    <circle cx="6" cy="7"  r="1" fill="currentColor"/>
                    <circle cx="2" cy="12" r="1" fill="currentColor"/>
                    <circle cx="6" cy="12" r="1" fill="currentColor"/>
                  </svg>
                </span>

                {/* Checkbox */}
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

                {/* Content — edit mode or normal */}
                {isEditing ? (
                  <div className="edit-wrap">
                    <input
                      className="edit-input"
                      value={editText}
                      autoFocus
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")  saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <button className="edit-save-btn"  onClick={saveEdit}>Save</button>
                    <button className="edit-cancel-btn" onClick={cancelEdit}>✕</button>
                  </div>
                ) : (
                  <div className="task-content" onDoubleClick={() => !task.done && startEdit(task)}>
                    <span className="task-text">{task.text}</span>
                    {dueInfo && (
                      <div className={`task-due ${dueInfo.cls}`}>
                        <span className="due-dot" />
                        {dueInfo.label}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons — only when not editing */}
                {!isEditing && (
                  <div className="task-actions">
                    {!task.done && (
                      <button className="edit-btn" onClick={() => startEdit(task)} title="Edit">
                        <svg viewBox="0 0 14 14" fill="none">
                          <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    <button className="delete-btn" onClick={() => deleteTask(task.id)} title="Delete">
                      <svg viewBox="0 0 12 12" fill="none">
                        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Footer */}
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