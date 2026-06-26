import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error('Falta VITE_API_URL en el archivo .env')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

window.addEventListener('error', (e) => {
  console.error('Global error:', e.error ?? e.message)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#262626',
              color: '#fff',
              border: '1px solid #333333',
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
