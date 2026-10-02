import { useState } from 'react'
import './App.css'

export interface Todo {
  id: string
  title: string
  isCompleted: boolean
}

function App() {
  const [value, setValue] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])

  function handleAdd() {
    const title = value.trim()
    if (!title) return

    const todo: Todo = {
      id: `${Date.now()}`,
      title,
      isCompleted: false,
    }
    setTodos((prev) => [...prev, todo])
    setValue('')
  }

  function handleRemove(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <main className="page">
      <section className="card">
        <header className="header">
          <p className="eyebrow">Today</p>
          <h1>Tasks</h1>
          <p className="subtitle">
            {todos.length === 0
              ? 'Nothing on the list yet'
              : `${todos.length} ${todos.length === 1 ? 'task' : 'tasks'}`}
          </p>
        </header>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault()
            handleAdd()
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="text"
            placeholder="What needs to get done?"
            aria-label="New task"
          />
          <button type="submit" disabled={!value.trim()}>
            Add
          </button>
        </form>

        {todos.length === 0 ? (
          <p className="empty">Add a task to get started.</p>
        ) : (
          <ul className="list">
            {todos.map((todo) => (
              <li key={todo.id} className="item">
                <span className="title">{todo.title}</span>
                <button
                  type="button"
                  className="remove"
                  onClick={() => handleRemove(todo.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App