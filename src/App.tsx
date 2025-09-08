import { useState } from 'react'
import  Sidebar  from './pages/pages/admin/settings/page.tsx'
import '../styles/globals.css'
import DashboardPage from './pages/pages/dashboard/page.tsx'
import { AuthProvider } from '../lib/auth'
import OnboardingPage from './pages/pages/onboarding/page.tsx'
import SettingsPage from './pages/pages/admin/settings/page.tsx'
import ApplicationAdminPage from './pages/pages/application-admin/page.tsx'
import FNOAdminPage from './pages/pages/fno/page.tsx'
// import ReportsPage from './pages/pages/reports/page.tsx'
import UsersPage from './pages/pages/admin/users/page.tsx'
import LoginPage from './pages/pages/login/page.tsx'
// import RegisterPage from './pages/pages/register/page.tsx'
// import ForgotPasswordPage from './pages/pages/forgot-password/page.tsx'
// import ResetPasswordPage from './pages/pages/reset-password/page.tsx'
import { Routes, Route } from 'react-router-dom'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      {/* <Sidebar /> */}
      <AuthProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/application-admin" element={<ApplicationAdminPage />} />
          <Route path="/fno-admin" element={<FNOAdminPage />} />
          {/* <Route path="/reports" element={<ReportsPage />} /> */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
          {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
        </Routes>
      </AuthProvider>
    </>
  )
}

export default App