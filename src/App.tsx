import { useEffect } from 'react'
import  Sidebar  from './pages/pages/admin/settings/page.tsx'
import '../styles/globals.css'
import DashboardPage from './pages/pages/dashboard/page.tsx'
import { AuthProvider } from '../lib/auth'
import OnboardingPage from './pages/pages/onboarding/page.tsx'
import SettingsPage from './pages/pages/admin/settings/page.tsx'
import ApplicationAdminPage from './pages/pages/application-admin/page.tsx'
import FNOAdminPage from './pages/pages/fno/page.tsx'
import Customers from './pages/pages/customers/page.tsx'
import Orders from './pages/pages/orders/page.tsx'
import ReportsPage from './pages/pages/reports/page.tsx'
import UsersPage from './pages/pages/admin/users/page.tsx'
import LoginPage from './pages/pages/login/page.tsx'
import Escalations from './pages/pages/escalations/page.tsx'
import OrderCreate from './pages/pages/orders/create/page.tsx'
import CustomerCreate from './pages/pages/customers/create/page.tsx'
import { Toaster } from './components/components/ui/sonner'
import { AuthGuard } from './components/AuthGuard'
// import RegisterPage from './pages/pages/register/page.tsx'
// import ForgotPasswordPage from './pages/pages/forgot-password/page.tsx'
// import ResetPasswordPage from './pages/pages/reset-password/page.tsx'
import { Routes, Route } from 'react-router-dom'

function App() {

  // Authentication is now handled by AuthGuard component and Redux state

  // const [count, setCount] = useState(0)

  return (
    <>
      {/* <Sidebar /> */}
      <AuthProvider>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
          {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
          
          {/* Protected routes - authentication required */}
          <Route path="/" element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } />
          <Route path="/dashboard" element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } />
          <Route path="/onboarding" element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          } />
          <Route path="/application-admin" element={
            <AuthGuard>
              <ApplicationAdminPage />
            </AuthGuard>
          } />
          <Route path="/fno" element={
            <AuthGuard>
              <FNOAdminPage />
            </AuthGuard>
          } />
          <Route path="/escalations" element={
            <AuthGuard>
              <Escalations/>
            </AuthGuard>
          } />
          <Route path="/customers" element={
            <AuthGuard>
              <Customers/>
            </AuthGuard>
          } />
          <Route path="/orders" element={
            <AuthGuard>
              <Orders/>
            </AuthGuard>
          } />
          <Route path="/reports" element={
            <AuthGuard>
              <ReportsPage />
            </AuthGuard>
          } /> 
          <Route path="/users" element={
            <AuthGuard>
              <UsersPage />
            </AuthGuard>
          } />
          <Route path='/orders/create' element={
            <AuthGuard>
              <OrderCreate/>
            </AuthGuard>
          } />
          <Route path='/customers/create' element={
            <AuthGuard>
              <CustomerCreate/>
            </AuthGuard>
          } />
        </Routes>
        <Toaster />
      </AuthProvider>
    </>
  )
}

export default App