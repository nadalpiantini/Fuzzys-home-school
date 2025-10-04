'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  UserPlus,
  BookOpen,
  Gamepad2,
  Bell,
  Mail,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalTeachers: 45,
    totalStudents: 1202,
    systemHealth: 'excellent',
    storageUsed: '2.3 GB',
    lastBackup: '2024-11-15 14:30',
    pendingApprovals: 3,
    systemAlerts: 0,
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'user_registration',
      user: 'María González',
      action: 'Nuevo usuario registrado',
      timestamp: '2024-11-15 15:30',
      status: 'success',
    },
    {
      id: 2,
      type: 'content_upload',
      user: 'Prof. Juan Pérez',
      action: 'Subió nuevo contenido educativo',
      timestamp: '2024-11-15 14:45',
      status: 'success',
    },
    {
      id: 3,
      type: 'system_alert',
      user: 'Sistema',
      action: 'Backup automático completado',
      timestamp: '2024-11-15 14:30',
      status: 'info',
    },
    {
      id: 4,
      type: 'user_login',
      user: 'Carlos Rodríguez',
      action: 'Inició sesión',
      timestamp: '2024-11-15 14:15',
      status: 'success',
    },
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Espacio de almacenamiento',
      message: 'El 85% del espacio de almacenamiento está en uso',
      timestamp: '2024-11-15 10:00',
    },
    {
      id: 2,
      type: 'info',
      title: 'Actualización disponible',
      message: 'Nueva versión del sistema disponible',
      timestamp: '2024-11-14 16:00',
    },
  ]);

  const handleUserManagement = () => {
    router.push('/admin/users');
  };

  const handleSystemSettings = () => {
    router.push('/admin/settings');
  };

  const handleAnalytics = () => {
    router.push('/admin/analytics');
  };

  const handleContentManagement = () => {
    router.push('/admin/content');
  };

  const handleBackup = () => {
    toast.info(
      language === 'es' ? 'Iniciando respaldo...' : 'Starting backup...',
    );
    // TODO: Implement backup functionality
  };

  const handleSystemHealth = () => {
    router.push('/admin/health');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return language === 'es' ? 'Éxito' : 'Success';
      case 'warning':
        return language === 'es' ? 'Advertencia' : 'Warning';
      case 'error':
        return language === 'es' ? 'Error' : 'Error';
      case 'info':
        return language === 'es' ? 'Info' : 'Info';
      default:
        return status;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es'
                  ? 'Panel de Administración'
                  : 'Admin Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBackup}>
                <Download className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Respaldo' : 'Backup'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Actualizar' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Usuarios Totales' : 'Total Users'}
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-fuzzy-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Usuarios Activos' : 'Active Users'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeUsers.toLocaleString()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Profesores' : 'Teachers'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalTeachers}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {language === 'es' ? 'Estudiantes' : 'Students'}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalStudents}
                  </p>
                </div>
                <Gamepad2 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Status */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-fuzzy-purple" />
                  {language === 'es' ? 'Estado del Sistema' : 'System Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'es'
                          ? 'Salud del Sistema'
                          : 'System Health'}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {language === 'es' ? 'Excelente' : 'Excellent'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'es' ? 'Almacenamiento' : 'Storage'}
                      </span>
                      <span className="text-sm font-medium">
                        {stats.storageUsed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'es' ? 'Último Respaldo' : 'Last Backup'}
                      </span>
                      <span className="text-sm font-medium">
                        {stats.lastBackup}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'es'
                          ? 'Aprobaciones Pendientes'
                          : 'Pending Approvals'}
                      </span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {stats.pendingApprovals}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {language === 'es'
                          ? 'Alertas del Sistema'
                          : 'System Alerts'}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        {stats.systemAlerts}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-fuzzy-purple" />
                  {language === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-fuzzy-purple rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.user} • {activity.timestamp}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-fuzzy-purple" />
                  {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleUserManagement}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {language === 'es'
                    ? 'Gestión de Usuarios'
                    : 'User Management'}
                </Button>
                <Button
                  onClick={handleSystemSettings}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Configuración' : 'Settings'}
                </Button>
                <Button
                  onClick={handleAnalytics}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Analíticas' : 'Analytics'}
                </Button>
                <Button
                  onClick={handleContentManagement}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Contenido' : 'Content'}
                </Button>
                <Button
                  onClick={handleSystemHealth}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Salud del Sistema' : 'System Health'}
                </Button>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-fuzzy-purple" />
                  {language === 'es' ? 'Alertas del Sistema' : 'System Alerts'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {alert.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
