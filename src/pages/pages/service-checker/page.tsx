import { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/components/layout/sidebar';        
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/components/ui/card';
import { Button } from '../../../components/components/ui/button';
import { Badge } from '../../../components/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/components/ui/table';
import { ArrowLeft, RefreshCw, Monitor, Wifi, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiClient } from '../../../../lib/api/client';

interface ActiveService {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  address: string;
  activatedAt: string;
  lastChecked?: string;
  healthStatus: 'healthy' | 'warning' | 'error';
}

export default function ServiceCheckerPage() {
  const [services, setServices] = useState<ActiveService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/orders/active-services');
      const data = response.data;
      
      if (data.success && data.data) {
        setServices(data.data);
      } else {
        console.error('Failed to load services:', data.error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to load active services',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Error loading services:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to connect to service checker',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshServices = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'trial':
        return <Badge variant="secondary" className="bg-yellow-500">Trial</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    return serviceType.toLowerCase().includes('trial') ? <Monitor className="h-4 w-4" /> : <Wifi className="h-4 w-4" />;
  };

  const getServiceTypeBadgeColor = (serviceType: string) => {
    switch (serviceType?.toLowerCase()) {
      case 'fiber':
        return 'bg-blue-100 text-blue-800';
      case 'wireless':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalServices = services.length;
  const activeServices = services.filter(s => s.status === 'active').length;
  const trialServices = services.filter(s => s.status === 'trial').length;
  const problemServices = services.filter(s => s.healthStatus === 'error' || s.healthStatus === 'warning').length;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Checker</h1>
                <p className="text-sm text-gray-600">Monitor and manage active customer services</p>
              </div>
            </div>
            <Button
              onClick={refreshServices}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalServices}</div>
                <p className="text-xs text-muted-foreground">All active connections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <Wifi className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeServices}</div>
                <p className="text-xs text-muted-foreground">Paid subscriptions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Services</CardTitle>
                <Monitor className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{trialServices}</div>
                <p className="text-xs text-muted-foreground">Free trial periods</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Detected</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{problemServices}</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
              <CardDescription>
                Real-time status of all customer services and connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading services...</span>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Services</h3>
                  <p className="text-gray-500">No services are currently active in the system.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Activated</TableHead>
                      <TableHead>Last Checked</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getServiceTypeIcon(service.serviceType)}
                            <span className="font-medium">{service.serviceType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getServiceTypeBadgeColor(service.serviceType)}>
                            {service.serviceType === 'wireless' ? 'Wireless' : 
                             service.serviceType === 'fiber' ? 'Fiber' : 
                             service.serviceType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{service.customerName}</div>
                            <div className="text-sm text-gray-500">Order: {service.orderId.slice(0, 8)}...</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(service.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getHealthIcon(service.healthStatus)}
                            <span className="capitalize">{service.healthStatus}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {service.address}
                        </TableCell>
                        <TableCell>
                          {new Date(service.activatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {service.lastChecked ? 
                            new Date(service.lastChecked).toLocaleString() : 
                            'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/orders/${service.orderId}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

