'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, Clock, Settings, Save } from 'lucide-react';
import { EmailService, EmailPreferences } from '@/services/email/emailService';
import { toast } from 'sonner';

interface NotificationPreferencesProps {
  userId: string;
  onSave?: (preferences: EmailPreferences) => void;
}

export function NotificationPreferences({
  userId,
  onSave,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await EmailService.getUserPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Error al cargar preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await EmailService.updateUserPreferences(userId, preferences);
      toast.success('Preferencias guardadas exitosamente');
      onSave?.(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: string, value: any) => {
    if (!preferences) return;

    setPreferences((prev) => ({
      ...prev!,
      [key]: value,
    }));
  };

  const updateCategoryPreference = (category: string, enabled: boolean) => {
    if (!preferences) return;

    setPreferences((prev) => ({
      ...prev!,
      categories: {
        ...prev!.categories,
        [category]: enabled,
      },
    }));
  };

  const updateQuietHours = (key: string, value: string) => {
    if (!preferences) return;

    setPreferences((prev) => ({
      ...prev!,
      quietHours: {
        ...prev!.quietHours,
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuzzy-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando preferencias...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No se pudieron cargar las preferencias</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configuración de Notificaciones
          </CardTitle>
          <CardDescription>
            Personaliza cómo y cuándo recibes notificaciones sobre el progreso
            de tus estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuración General</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Notificaciones por Email</p>
                  <p className="text-sm text-gray-600">
                    Recibe actualizaciones por correo electrónico
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) =>
                  updatePreference('emailNotifications', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Notificaciones Push</p>
                  <p className="text-sm text-gray-600">
                    Recibe notificaciones en el navegador
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) =>
                  updatePreference('pushNotifications', checked)
                }
              />
            </div>
          </div>

          {/* Category Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipos de Notificaciones</h3>

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Progreso y Logros</p>
                  <p className="text-sm text-gray-600">
                    Actualizaciones de puntuaciones y logros
                  </p>
                </div>
                <Switch
                  checked={preferences.categories.progress}
                  onCheckedChange={(checked) =>
                    updateCategoryPreference('progress', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Insignias y Reconocimientos</p>
                  <p className="text-sm text-gray-600">
                    Nuevas insignias y logros especiales
                  </p>
                </div>
                <Switch
                  checked={preferences.categories.achievements}
                  onCheckedChange={(checked) =>
                    updateCategoryPreference('achievements', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de Apoyo</p>
                  <p className="text-sm text-gray-600">
                    Notificaciones cuando un estudiante necesita ayuda
                  </p>
                </div>
                <Switch
                  checked={preferences.categories.alerts}
                  onCheckedChange={(checked) =>
                    updateCategoryPreference('alerts', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reportes Semanales</p>
                  <p className="text-sm text-gray-600">
                    Resúmenes de progreso semanal
                  </p>
                </div>
                <Switch
                  checked={preferences.categories.reports}
                  onCheckedChange={(checked) =>
                    updateCategoryPreference('reports', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Engagement y Motivación</p>
                  <p className="text-sm text-gray-600">
                    Consejos y motivación para el aprendizaje
                  </p>
                </div>
                <Switch
                  checked={preferences.categories.engagement}
                  onCheckedChange={(checked) =>
                    updateCategoryPreference('engagement', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Frequency Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Frecuencia de Notificaciones
            </h3>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Frecuencia:</label>
              <Select
                value={preferences.frequency}
                onValueChange={(value) => updatePreference('frequency', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Inmediato</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Horas Silenciosas</h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activar Horas Silenciosas</p>
                <p className="text-sm text-gray-600">
                  No recibir notificaciones durante ciertas horas
                </p>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) =>
                  updatePreference('quietHours', {
                    ...preferences.quietHours,
                    enabled: checked,
                  })
                }
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Desde:</label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuzzy-purple"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hasta:</label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuzzy-purple"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Preferencias'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Estado Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-fuzzy-purple">
                {preferences.emailNotifications ? 'Activo' : 'Inactivo'}
              </div>
              <p className="text-sm text-gray-600">Notificaciones Email</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-fuzzy-green">
                {preferences.frequency}
              </div>
              <p className="text-sm text-gray-600">Frecuencia</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Categorías Activas:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(preferences.categories).map(
                ([category, enabled]) => (
                  <Badge
                    key={category}
                    variant={enabled ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {category}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
