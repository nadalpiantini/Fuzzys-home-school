'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Settings,
  Save,
  Database,
  Shield,
  Mail,
  Bell,
  Globe,
  Key,
  Server,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    // System Settings
    systemName: "Fuzzy's Home School",
    systemVersion: '1.2.3',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerification: true,

    // Security Settings
    passwordMinLength: 8,
    sessionTimeout: 30,
    twoFactorAuth: false,
    ipWhitelist: '',

    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@fuzzyshomeschool.com',
    fromName: "Fuzzy's Home School",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    maintenanceAlerts: true,

    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupLocation: '/backups',

    // API Settings
    apiRateLimit: 1000,
    apiTimeout: 30,
    corsOrigins: '*',

    // Feature Flags
    enableAnalytics: true,
    enableGamification: true,
    enableAI: true,
    enableH5P: true,
    enableExternalGames: true,
  });

  const handleBack = () => {
    router.push('/admin');
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Simulate save operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        language === 'es' ? 'Configuración guardada' : 'Settings saved',
      );
    } catch (error) {
      toast.error(
        language === 'es'
          ? 'Error al guardar la configuración'
          : 'Error saving settings',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        language === 'es'
          ? '¿Estás seguro de resetear la configuración?'
          : 'Are you sure you want to reset settings?',
      )
    ) {
      toast.info(
        language === 'es' ? 'Configuración reseteada' : 'Settings reset',
      );
      // TODO: Implement reset functionality
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es'
                  ? 'Configuración del Sistema'
                  : 'System Settings'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleReset}>
                {language === 'es' ? 'Resetear' : 'Reset'}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {language === 'es' ? 'Guardando...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'es' ? 'Guardar' : 'Save'}
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Volver' : 'Back'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-fuzzy-purple" />
                {language === 'es'
                  ? 'Configuración del Sistema'
                  : 'System Configuration'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Configuración general del sistema'
                  : 'General system configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="systemName">
                    {language === 'es' ? 'Nombre del Sistema' : 'System Name'}
                  </Label>
                  <Input
                    id="systemName"
                    value={settings.systemName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        systemName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="systemVersion">
                    {language === 'es' ? 'Versión' : 'Version'}
                  </Label>
                  <Input
                    id="systemVersion"
                    value={settings.systemVersion}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">
                      {language === 'es'
                        ? 'Modo de Mantenimiento'
                        : 'Maintenance Mode'}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Desactiva el acceso público al sistema'
                        : 'Disable public access to the system'}
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        maintenanceMode: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registrationEnabled">
                      {language === 'es'
                        ? 'Registro Habilitado'
                        : 'Registration Enabled'}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Permite el registro de nuevos usuarios'
                        : 'Allow new user registration'}
                    </p>
                  </div>
                  <Switch
                    id="registrationEnabled"
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        registrationEnabled: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-fuzzy-purple" />
                {language === 'es'
                  ? 'Configuración de Seguridad'
                  : 'Security Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Configuración de seguridad y autenticación'
                  : 'Security and authentication settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="passwordMinLength">
                    {language === 'es'
                      ? 'Longitud Mínima de Contraseña'
                      : 'Minimum Password Length'}
                  </Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        passwordMinLength: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">
                    {language === 'es'
                      ? 'Timeout de Sesión (minutos)'
                      : 'Session Timeout (minutes)'}
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">
                      {language === 'es'
                        ? 'Autenticación de Dos Factores'
                        : 'Two-Factor Authentication'}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Requiere 2FA para todos los usuarios'
                        : 'Require 2FA for all users'}
                    </p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        twoFactorAuth: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-fuzzy-purple" />
                {language === 'es'
                  ? 'Configuración de Email'
                  : 'Email Settings'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Configuración del servidor de correo'
                  : 'Email server configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpHost">
                    {language === 'es' ? 'Servidor SMTP' : 'SMTP Host'}
                  </Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        smtpHost: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">
                    {language === 'es' ? 'Puerto SMTP' : 'SMTP Port'}
                  </Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        smtpPort: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpUser">
                    {language === 'es' ? 'Usuario SMTP' : 'SMTP User'}
                  </Label>
                  <Input
                    id="smtpUser"
                    type="email"
                    value={settings.smtpUser}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        smtpUser: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">
                    {language === 'es' ? 'Contraseña SMTP' : 'SMTP Password'}
                  </Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        smtpPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fromEmail">
                    {language === 'es' ? 'Email de Envío' : 'From Email'}
                  </Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        fromEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">
                    {language === 'es' ? 'Nombre de Envío' : 'From Name'}
                  </Label>
                  <Input
                    id="fromName"
                    value={settings.fromName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        fromName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-fuzzy-purple" />
                {language === 'es'
                  ? 'Características del Sistema'
                  : 'System Features'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Habilitar o deshabilitar características del sistema'
                  : 'Enable or disable system features'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAnalytics">
                      {language === 'es' ? 'Analíticas' : 'Analytics'}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Seguimiento de uso y estadísticas'
                        : 'Usage tracking and statistics'}
                    </p>
                  </div>
                  <Switch
                    id="enableAnalytics"
                    checked={settings.enableAnalytics}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        enableAnalytics: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableGamification">
                      {language === 'es' ? 'Gamificación' : 'Gamification'}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Puntos, logros y recompensas'
                        : 'Points, achievements and rewards'}
                    </p>
                  </div>
                  <Switch
                    id="enableGamification"
                    checked={settings.enableGamification}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        enableGamification: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAI">
                      {language === 'es'
                        ? 'Inteligencia Artificial'
                        : 'Artificial Intelligence'}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Tutor AI y recomendaciones'
                        : 'AI Tutor and recommendations'}
                    </p>
                  </div>
                  <Switch
                    id="enableAI"
                    checked={settings.enableAI}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, enableAI: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableH5P">
                      {language === 'es' ? 'Contenido H5P' : 'H5P Content'}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === 'es'
                        ? 'Contenido interactivo H5P'
                        : 'Interactive H5P content'}
                    </p>
                  </div>
                  <Switch
                    id="enableH5P"
                    checked={settings.enableH5P}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, enableH5P: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
