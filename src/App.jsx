// src/App.jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { TripProvider } from './context/TripContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import { Spinner } from './components/ui'

// Lazy-loaded pages for code splitting
const LoginPage      = lazy(() => import('./pages/LoginPage'))
const SignupPage     = lazy(() => import('./pages/SignupPage'))
const DashboardPage  = lazy(() => import('./pages/DashboardPage'))
const ItineraryPage  = lazy(() => import('./pages/ItineraryPage'))
const BudgetPage     = lazy(() => import('./pages/BudgetPage'))
const PackingPage    = lazy(() => import('./pages/PackingPage'))
const DocumentsPage  = lazy(() => import('./pages/DocumentsPage'))
const AIPlannerPage  = lazy(() => import('./pages/AIPlannerPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" />
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                borderRadius: '12px',
                border: '1px solid #f3d9a8',
                boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)',
              },
              success: { iconTheme: { primary: '#339f58', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected routes inside layout */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index           element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"  element={<DashboardPage />} />
                <Route path="itinerary"  element={<ItineraryPage />} />
                <Route path="budget"     element={<BudgetPage />} />
                <Route path="packing"    element={<PackingPage />} />
                <Route path="documents"  element={<DocumentsPage />} />
                <Route path="ai-planner" element={<AIPlannerPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
