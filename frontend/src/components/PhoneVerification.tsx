import React, { useState } from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PhoneVerificationProps {
  onBack: () => void;
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({ onBack }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { user, verifyPhone, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 4) {
      setError('El código debe tener 4 dígitos');
      return;
    }

    const success = await verifyPhone(code);
    if (!success) {
      setError('Código incorrecto. Intenta nuevamente.');
    }
  };

  const handleResendCode = () => {
    // Simulate resending code
    alert('Código reenviado a ' + user?.phone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center relative">
          <button
            onClick={onBack}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-white text-2xl font-bold mb-2">Quiklii</div>
          <p className="text-orange-100">Verificación de teléfono</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verifica tu teléfono
            </h2>
            <p className="text-gray-600">
              Enviamos un código de 4 dígitos a<br />
              <span className="font-semibold">{user?.phone}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Código de 4 dígitos"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 4}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">¿No recibiste el código?</p>
            <button
              onClick={handleResendCode}
              className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
            >
              Reenviar código
            </button>
          </div>

          {/* Demo Info */}
          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Demo:</strong> Usa el código <span className="font-mono font-bold">1234</span> para verificar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification;