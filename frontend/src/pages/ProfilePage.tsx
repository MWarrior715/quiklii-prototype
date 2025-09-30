import React from 'react';
import { User, MapPin, Phone, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { NavigationProps } from '../types/props';

type ProfilePageProps = NavigationProps;

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  console.log('🔍 [ProfilePage] User from auth:', user);
  console.log('🔍 [ProfilePage] User exists:', !!user);

  if (!user) {
    console.log('🔍 [ProfilePage] No user found, redirecting to login');
    onNavigate('login');
    return null;
  }

  console.log('🔍 [ProfilePage] Rendering profile for user:', `${user.firstName} ${user.lastName}`);

  const formatDate = (date: Date) => {
    console.log('🔍 [formatDate] Recibiendo fecha:', date, 'Tipo:', typeof date);
    if (!date || isNaN(date.getTime())) {
      console.error('❌ [formatDate] Fecha inválida:', date);
      return 'Fecha no disponible';
    }
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => onNavigate('home')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
          </div>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-orange-100 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>

                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Correo electrónico</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="text-gray-800">{user.phone || 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Miembro desde</p>
                    <p className="text-gray-800">
                      {(() => {
                        console.log('🔍 [ProfilePage] user.createdAt:', user.createdAt, 'Tipo:', typeof user.createdAt);
                        return formatDate(user.createdAt);
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dirección</h3>

                {user.address ? (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección de entrega</p>
                      <p className="text-gray-800">
                        {user.address.street}, {user.address.neighborhood}
                      </p>
                      <p className="text-gray-600">{user.address.city}</p>
                      {user.address.instructions && (
                        <p className="text-sm text-gray-500 mt-1">
                          Notas: {user.address.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-gray-600">No configurada</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${user.isPhoneVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium text-green-800">
                        {user.isPhoneVerified ? 'Teléfono Verificado' : 'Teléfono Sin Verificar'}
                      </p>
                      <p className="text-sm text-green-600">
                        {user.isPhoneVerified ? 'Tu cuenta está completamente segura' : 'Verifica tu teléfono para mayor seguridad'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">Tipo de Cuenta</p>
                      <p className="text-sm text-blue-600 capitalize">
                        {user.role === 'customer' ? 'Cliente' :
                         user.role === 'restaurant' ? 'Restaurante' :
                         user.role === 'admin' ? 'Administrador' : user.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;