import '../styles/globals.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../lib/auth'
// import { Toaster } from './components/components/ui/sonner'

import DashboardPage from './pages/pages/dashboard/page.tsx'
import OnboardingPage from './pages/pages/onboarding/page.tsx'
import OnboardingDetailsPage from './pages/pages/onboarding/[id]/page.tsx'
import SettingsPage from './pages/pages/admin/settings/page.tsx'
import ApplicationAdminPage from './pages/pages/application-admin/page.tsx'
import ApplicationAdminDetailsPage from './pages/pages/application-admin/[id]/page.tsx'
import FNOAdminPage from './pages/pages/fno/page.tsx'
import FnoCreatePage from './pages/pages/fno/create/page.tsx'
import Customers from './pages/pages/customers/page.tsx'
import Orders from './pages/pages/orders/page.tsx'
import ReportsPage from './pages/pages/reports/page.tsx'
import UsersPage from './pages/pages/admin/users/page.tsx'
import LoginPage from './pages/pages/login/page.tsx'
import Escalations from './pages/pages/escalations/page.tsx'
import OrderCreate from './pages/pages/orders/create/page.tsx'
import OrderDetailsPage from './pages/pages/orders/[id]/page.tsx'
import CustomerCreate from './pages/pages/customers/create/page'
import CustomerDetailsPage from './pages/pages/customers/[id]/page.tsx'
import EditCustomerPage from './pages/pages/customers/[id]/edit/page.tsx'
import PaymentSuccessPage from './pages/pages/payment/success/page.tsx'
import PaymentCancelledPage from './pages/pages/payment/cancelled/page.tsx'
import TrialAnalyticsPage from './pages/pages/trial-analytics/page.tsx'
import { Toaster } from './components/components/ui/sonner'
import PaymentPage from './pages/pages/payment/page.tsx'
import { AuthGuard } from './components/AuthGuard'
import ServiceCheckerPage from './pages/pages/service-checker/page.tsx'

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          {/* Root route redirect */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          
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
          <Route path="/onboarding/:id" element={
            <AuthGuard>
              <OnboardingDetailsPage />
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
          <Route path="/application-admin/:id" element={
            <AuthGuard>
              <ApplicationAdminDetailsPage />
            </AuthGuard>
          } />
          <Route path="/fno" element={
            <AuthGuard>
              <FNOAdminPage />
            </AuthGuard>
          } />
          <Route path="/fno/:id" element={
            <AuthGuard>
              <FNOAdminPage />
            </AuthGuard>
          } />
          <Route path="/fno/create" element={
            <AuthGuard>
              <FnoCreatePage />
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
          <Route path="/orders/create" element={
            <AuthGuard>
              <OrderCreate/>
            </AuthGuard>
          } />
          <Route path="/orders/:id" element={
            <AuthGuard>
              <OrderDetailsPage />
            </AuthGuard>
          } />
          <Route path='/customers/create' element={
            <AuthGuard>
              <CustomerCreate/>
            </AuthGuard>
          } />
          <Route path='/customers/:id' element={
            <AuthGuard>
              <CustomerDetailsPage/>
            </AuthGuard>
          } />
          <Route path='/customers/:id/edit' element={
            <AuthGuard>
              <EditCustomerPage/>
            </AuthGuard>
          } />
          <Route path='/payment/success' element={
            <PaymentSuccessPage />
          } />
          <Route path='/payment/cancelled' element={
            <PaymentCancelledPage />
          } />
          <Route path='/trial-analytics' element={
            <AuthGuard>
              <TrialAnalyticsPage />
            </AuthGuard>
          } />
          <Route path='/service-checker' element={
            <AuthGuard>
              <ServiceCheckerPage />
            </AuthGuard>
          } />
          {/* Public routes */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/payment' element={<PaymentPage />} />
          <Route path='/payment/success' element={<PaymentSuccessPage />} />
          <Route path='/payment/cancelled' element={<PaymentCancelledPage />} />
          <Route path='/service-checker' element={<ServiceCheckerPage />} />
          {/* Protected routes (wrapped per-route with AuthGuard) */}
          <Route path='/dashboard' element={<AuthGuard><DashboardPage /></AuthGuard>} />
          <Route path='/onboarding' element={<AuthGuard><OnboardingPage /></AuthGuard>} />
          <Route path='/onboarding/:id' element={<AuthGuard><OnboardingDetailsPage /></AuthGuard>} />
          <Route path='/admin/settings' element={<AuthGuard><SettingsPage /></AuthGuard>} />
          <Route path='/application-admin' element={<AuthGuard><ApplicationAdminPage /></AuthGuard>} />
          <Route path='/application-admin/:id' element={<AuthGuard><ApplicationAdminDetailsPage /></AuthGuard>} />
          <Route path='/fno' element={<AuthGuard><FNOAdminPage /></AuthGuard>} />
          <Route path='/fno/create' element={<AuthGuard><FnoCreatePage /></AuthGuard>} />
          <Route path='/customers' element={<AuthGuard><Customers /></AuthGuard>} />
          <Route path='/customers/create' element={<AuthGuard><CustomerCreate /></AuthGuard>} />
          <Route path='/customers/:id' element={<AuthGuard><CustomerDetailsPage /></AuthGuard>} />
          <Route path='/customers/:id/edit' element={<AuthGuard><EditCustomerPage /></AuthGuard>} />
          <Route path='/orders' element={<AuthGuard><Orders /></AuthGuard>} />
          <Route path='/orders/create' element={<AuthGuard><OrderCreate /></AuthGuard>} />
          <Route path='/orders/:id' element={<AuthGuard><OrderDetailsPage /></AuthGuard>} />
          <Route path='/reports' element={<AuthGuard><ReportsPage /></AuthGuard>} />
          <Route path='/users' element={<AuthGuard><UsersPage /></AuthGuard>} />
          <Route path='/escalations' element={<AuthGuard><Escalations /></AuthGuard>} />
          <Route path='/settings' element={<AuthGuard><SettingsPage /></AuthGuard>} />
        </Routes>
        
        <Toaster />
      </AuthProvider>
    </>
  )
}

export default App