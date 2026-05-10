import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '0px',
              border: '1px solid rgba(26,26,26,0.1)',
              background: 'rgba(255,255,255,0.96)',
              color: '#1a1a1a',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
