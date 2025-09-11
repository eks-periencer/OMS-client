import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './toolkit/store'

// Import pages
import DashboardPage from './pages/pages/dashboard/page.tsx'
import OnboardingPage from './pages/pages/onboarding/page.tsx'
import OnboardingDetailsPage from './pages/pages/onboarding/[id]/page.tsx'
import SettingsPage from './pages/pages/admin/settings/page.tsx'
import ApplicationAdminPage from './pages/pages/application-admin/page.tsx'
import ApplicationDetailsPage from './pages/pages/application-admin/[id]/page.tsx'
import FNOAdminPage from './pages/pages/fno/page.tsx'
import FNODetailsPage from './pages/pages/fno/[id]/page.tsx'
import Customers from './pages/pages/customers/page.tsx'
import CustomerDetailsPage from './pages/pages/customers/[id]/page.tsx'
import EditCustomerPage from './pages/pages/customers/[id]/edit/page.tsx'
import Orders from './pages/pages/orders/page.tsx'
import OrderDetailsPage from './pages/pages/orders/[id]/page.tsx'
import ReportsPage from './pages/pages/reports/page.tsx'
import UsersPage from './pages/pages/admin/users/page.tsx'
import LoginPage from './pages/pages/login/page.tsx'
import Escalations from './pages/pages/escalations/page.tsx'
import OrderCreate from './pages/pages/orders/create/page.tsx'
import CustomerCreate from './pages/pages/customers/create/page.tsx'

// Import components
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthLoadingSpinner } from './components/LoadingSpinner'
import { UnauthorizedPage } from './components/UnauthorizedPage'
import { RouteTest } from './components/RouteTest'
import { Sidebar } from './components/components/layout/sidebar'

// Import styles
import '../styles/globals.css'

function App() {
  const { loading } = useSelector((state: RootState) => state.authentication);

  // Show loading spinner while checking authentication
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Protected routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Orders */}
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/create" element={<OrderCreate />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />
                
                {/* Customers */}
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/create" element={<CustomerCreate />} />
                <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
                
                {/* Application Admin */}
                <Route path="/application-admin" element={<ApplicationAdminPage />} />
                <Route path="/application-admin/:id" element={<ApplicationDetailsPage />} />
                
                {/* Escalations */}
                <Route path="/escalations" element={<Escalations />} />
                
                {/* Customer Onboarding */}
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/onboarding/:id" element={<OnboardingDetailsPage />} />
                
                {/* FNO Management */}
                <Route path="/fno" element={<FNOAdminPage />} />
                <Route path="/fno/:id" element={<FNODetailsPage />} />
                
                {/* Reports */}
                <Route path="/reports" element={<ReportsPage />} />
                
                {/* Test route for development */}
                <Route path="/test-routes" element={<RouteTest />} />
                
                {/* Admin routes with permissions */}
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute requiredPermissions={['admin:manage_users']}>
                      <UsersPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <ProtectedRoute requiredPermissions={['admin:system_config']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App