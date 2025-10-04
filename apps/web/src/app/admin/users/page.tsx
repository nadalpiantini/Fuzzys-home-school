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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export default function UserManagementPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const users = [
    {
      id: 1,
      name: 'María González',
      email: 'maria.gonzalez@email.com',
      role: 'teacher',
      status: 'active',
      lastLogin: '2024-11-15 14:30',
      joinDate: '2024-09-15',
      avatar: '/avatars/maria.jpg',
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      role: 'student',
      status: 'active',
      lastLogin: '2024-11-15 13:45',
      joinDate: '2024-10-01',
      avatar: '/avatars/carlos.jpg',
    },
    {
      id: 3,
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-11-15 15:00',
      joinDate: '2024-08-20',
      avatar: '/avatars/ana.jpg',
    },
    {
      id: 4,
      name: 'Luis Fernández',
      email: 'luis.fernandez@email.com',
      role: 'student',
      status: 'inactive',
      lastLogin: '2024-11-10 09:15',
      joinDate: '2024-09-30',
      avatar: '/avatars/luis.jpg',
    },
    {
      id: 5,
      name: 'Sofia López',
      email: 'sofia.lopez@email.com',
      role: 'teacher',
      status: 'pending',
      lastLogin: null,
      joinDate: '2024-11-14',
      avatar: '/avatars/sofia.jpg',
    },
  ];

  const handleBack = () => {
    router.push('/admin');
  };

  const handleAddUser = () => {
    toast.info(
      language === 'es'
        ? 'Abriendo formulario de nuevo usuario...'
        : 'Opening new user form...',
    );
    // TODO: Implement add user functionality
  };

  const handleEditUser = (userId: number) => {
    toast.info(language === 'es' ? 'Editando usuario...' : 'Editing user...');
    // TODO: Implement edit user functionality
  };

  const handleDeleteUser = (userId: number) => {
    if (
      confirm(
        language === 'es'
          ? '¿Estás seguro de eliminar este usuario?'
          : 'Are you sure you want to delete this user?',
      )
    ) {
      toast.success(language === 'es' ? 'Usuario eliminado' : 'User deleted');
      // TODO: Implement delete user functionality
    }
  };

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(
      language === 'es'
        ? `Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}`
        : `User ${newStatus}`,
    );
    // TODO: Implement status toggle functionality
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return language === 'es' ? 'Administrador' : 'Admin';
      case 'teacher':
        return language === 'es' ? 'Profesor' : 'Teacher';
      case 'student':
        return language === 'es' ? 'Estudiante' : 'Student';
      default:
        return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return language === 'es' ? 'Activo' : 'Active';
      case 'inactive':
        return language === 'es' ? 'Inactivo' : 'Inactive';
      case 'pending':
        return language === 'es' ? 'Pendiente' : 'Pending';
      default:
        return status;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-fuzzy-purple" />
              <h1 className="text-2xl font-bold">
                {language === 'es' ? 'Gestión de Usuarios' : 'User Management'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleAddUser}>
                <UserPlus className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Nuevo Usuario' : 'New User'}
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
        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={
                  language === 'es' ? 'Buscar usuarios...' : 'Search users...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuzzy-purple focus:border-transparent"
            >
              <option value="all">
                {language === 'es' ? 'Todos los roles' : 'All Roles'}
              </option>
              <option value="admin">
                {language === 'es' ? 'Administradores' : 'Admins'}
              </option>
              <option value="teacher">
                {language === 'es' ? 'Profesores' : 'Teachers'}
              </option>
              <option value="student">
                {language === 'es' ? 'Estudiantes' : 'Students'}
              </option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuzzy-purple focus:border-transparent"
            >
              <option value="all">
                {language === 'es' ? 'Todos los estados' : 'All Status'}
              </option>
              <option value="active">
                {language === 'es' ? 'Activos' : 'Active'}
              </option>
              <option value="inactive">
                {language === 'es' ? 'Inactivos' : 'Inactive'}
              </option>
              <option value="pending">
                {language === 'es' ? 'Pendientes' : 'Pending'}
              </option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-fuzzy-purple rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleText(user.role)}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {getStatusText(user.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-600">
                    <p>
                      {language === 'es' ? 'Último acceso:' : 'Last login:'}{' '}
                      {user.lastLogin || 'Nunca'}
                    </p>
                    <p>
                      {language === 'es' ? 'Se unió:' : 'Joined:'}{' '}
                      {user.joinDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(user.id, user.status)}
                    >
                      {user.status === 'active' ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {language === 'es'
                ? 'No se encontraron usuarios'
                : 'No users found'}
            </h3>
            <p className="text-gray-500">
              {language === 'es'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Try adjusting your search filters'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
