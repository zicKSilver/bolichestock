import { memo, lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import FullPageSkeleton from './components/ui/FullPageSkeleton'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CierreCaja = lazy(() => import('./pages/CierreCaja'))
const Reportes = lazy(() => import('./pages/Reportes'))
const Cierres = lazy(() => import('./pages/Cierres'))
const Productos = lazy(() => import('./pages/Productos'))
const Usuarios = lazy(() => import('./pages/Usuarios'))

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}

const AppLayout = memo(function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
})

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <Suspense fallback={<FullPageSkeleton />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatedPage><Dashboard /></AnimatedPage>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cierre/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatedPage><CierreCaja /></AnimatedPage>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatedPage><Reportes /></AnimatedPage>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cierres"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatedPage><Cierres /></AnimatedPage>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatedPage><Productos /></AnimatedPage>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatedPage><Usuarios /></AnimatedPage>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
