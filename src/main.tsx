import React from 'react'
import { createRoot } from 'react-dom/client'
import Shell from './shell/Shell'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Shell />
    </ErrorBoundary>
  </React.StrictMode>
)
