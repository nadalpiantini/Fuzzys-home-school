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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  ArrowLeft,
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    name: 'Profesor Juan Pérez',
    email: 'juan.perez@escuela.edu',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisible: true,
      analyticsEnabled: true,
      dataSharing: false,
    },
    preferences: {
      theme: 'light',
      timezone: 'America/Santo_Domingo',
      dateFormat: 'DD/MM/YYYY',
    },
  });

  const handleBack = () => {
    router.push('/teacher');
  };

  const handleSave = () => {
    toast.success(
      language === 'es' ? 'Configuración guardada' : 'Settings saved',
    );
    // TODO: Implement settings save
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSettings((prev) => ({ ...prev, language: newLanguage }));
    toast.info(language === 'es' ? 'Idioma cambiado' : 'Language changed');
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [type]: value },
    }));
  };

  const handlePrivacyChange = (type: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [type]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Volver' : 'Back'}
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Configuración' : 'Settings'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === 'es' ? 'Perfil' : 'Profile'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Gestiona tu información personal'
                  : 'Manage your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                  </Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'es' ? 'Correo Electrónico' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {language === 'es' ? 'Contraseña' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={
                      language === 'es' ? 'Nueva contraseña' : 'New password'
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {language === 'es' ? 'Idioma y Región' : 'Language & Region'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Configura tu idioma y zona horaria'
                  : 'Set your language and timezone'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">
                    {language === 'es' ? 'Idioma' : 'Language'}
                  </Label>
                  <Select
                    value={settings.language}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">
                    {language === 'es' ? 'Zona Horaria' : 'Timezone'}
                  </Label>
                  <Select value={settings.preferences.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Santo_Domingo">
                        Santo Domingo (GMT-4)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        New York (GMT-5)
                      </SelectItem>
                      <SelectItem value="Europe/Madrid">
                        Madrid (GMT+1)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {language === 'es' ? 'Notificaciones' : 'Notifications'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Configura cómo recibes notificaciones'
                  : 'Configure how you receive notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">
                    {language === 'es'
                      ? 'Notificaciones por Email'
                      : 'Email Notifications'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Recibe actualizaciones por correo electrónico'
                      : 'Receive updates via email'}
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(value: boolean) =>
                    handleNotificationChange('email', value)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">
                    {language === 'es'
                      ? 'Notificaciones Push'
                      : 'Push Notifications'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Recibe notificaciones en el navegador'
                      : 'Receive notifications in browser'}
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(value: boolean) =>
                    handleNotificationChange('push', value)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">
                    {language === 'es'
                      ? 'Notificaciones SMS'
                      : 'SMS Notifications'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Recibe notificaciones por mensaje de texto'
                      : 'Receive notifications via text message'}
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(value: boolean) =>
                    handleNotificationChange('sms', value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {language === 'es'
                  ? 'Privacidad y Seguridad'
                  : 'Privacy & Security'}
              </CardTitle>
              <CardDescription>
                {language === 'es'
                  ? 'Controla tu privacidad y datos'
                  : 'Control your privacy and data'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-visible">
                    {language === 'es' ? 'Perfil Visible' : 'Profile Visible'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Permite que otros usuarios vean tu perfil'
                      : 'Allow other users to see your profile'}
                  </p>
                </div>
                <Switch
                  id="profile-visible"
                  checked={settings.privacy.profileVisible}
                  onCheckedChange={(value: boolean) =>
                    handlePrivacyChange('profileVisible', value)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics-enabled">
                    {language === 'es'
                      ? 'Analíticas Habilitadas'
                      : 'Analytics Enabled'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Permite el seguimiento de uso para mejorar la experiencia'
                      : 'Allow usage tracking to improve experience'}
                  </p>
                </div>
                <Switch
                  id="analytics-enabled"
                  checked={settings.privacy.analyticsEnabled}
                  onCheckedChange={(value: boolean) =>
                    handlePrivacyChange('analyticsEnabled', value)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-sharing">
                    {language === 'es' ? 'Compartir Datos' : 'Data Sharing'}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {language === 'es'
                      ? 'Permite compartir datos anónimos para investigación'
                      : 'Allow sharing anonymous data for research'}
                  </p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(value: boolean) =>
                    handlePrivacyChange('dataSharing', value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              className="bg-fuzzy-green hover:bg-fuzzy-green/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
