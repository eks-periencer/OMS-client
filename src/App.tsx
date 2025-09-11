// import { useState } from 'react'
// import  Sidebar  from './pages/pages/admin/settings/page.tsx'
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
// import RegisterPage from './pages/pages/register/page.tsx'
// import ForgotPasswordPage from './pages/pages/forgot-password/page.tsx'
// import ResetPasswordPage from './pages/pages/reset-password/page.tsx'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/components/ProtectedRoute'

function App() {
	// const [count, setCount] = useState(0)

	return (
		<>
			{/* <Sidebar /> */}
			<AuthProvider>
				<Routes>
					<Route path="/login" element={<LoginPage />} />

					<Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
					<Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
					<Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
					<Route path="/application-admin" element={<ProtectedRoute><ApplicationAdminPage /></ProtectedRoute>} />
					<Route path="/fno" element={<ProtectedRoute><FNOAdminPage /></ProtectedRoute>} />
					<Route path="/escalations" element={<ProtectedRoute><Escalations/></ProtectedRoute>} />
					<Route path="/customers" element={<ProtectedRoute><Customers/></ProtectedRoute>} />
					<Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>} />
					<Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} /> 
					<Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
					<Route path='/orders/create' element={<ProtectedRoute><OrderCreate/></ProtectedRoute>} />
					<Route path='/customers/create' element={<ProtectedRoute><CustomerCreate/></ProtectedRoute>} />
					{/* <Route path="/register" element={<RegisterPage />} /> */}
					{/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
					{/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
				</Routes>
			</AuthProvider>
		</>
	)
}

export default App