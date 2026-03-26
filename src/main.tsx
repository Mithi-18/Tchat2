import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ChatApp from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatApp />
  </StrictMode>,
)
