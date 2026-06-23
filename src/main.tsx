import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StudyProvider } from './contexts/StudyContext'
import { initTheme } from './components/ThemeToggle'
import App from './App'
import '@fontsource/dm-sans/700.css'
import '@fontsource/dm-sans/800.css'
import './styles.css'
initTheme()
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><AuthProvider><StudyProvider><App/></StudyProvider></AuthProvider></BrowserRouter></React.StrictMode>)
