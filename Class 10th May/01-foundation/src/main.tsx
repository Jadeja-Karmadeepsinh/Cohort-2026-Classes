import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const element = document.getElementById("new-root");

createRoot(element!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
