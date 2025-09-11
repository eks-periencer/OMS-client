import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import type { RootState } from '../toolkit/store';

export function RouteTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.authentication);

  const testRoutes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/orders', name: 'Orders' },
    { path: '/customers', name: 'Customers' },
    { path: '/fno', name: 'FNO Management' },
    { path: '/escalations', name: 'Escalations' },
    { path: '/reports', name: 'Reports' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Route Protection Test</CardTitle>
        <CardDescription>
          Test the protected routing implementation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Auth Status</h3>
            <p className="text-sm text-muted-foreground">
              Loading: {loading ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-muted-foreground">
              Authenticated: {isAuthenticated ? 'Yes' : 'No'}
            </p>
            <p className="text-sm text-muted-foreground">
              User: {user ? `${user.firstName} ${user.lastName}` : 'None'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Current Route</h3>
            <p className="text-sm text-muted-foreground">
              Path: {location.pathname}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Test Navigation</h3>
          <div className="grid grid-cols-2 gap-2">
            {testRoutes.map((route) => (
              <Button
                key={route.path}
                variant="outline"
                size="sm"
                onClick={() => navigate(route.path)}
                disabled={loading}
              >
                {route.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Go to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
