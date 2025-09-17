import React, { useState } from "react";
import {
  ArrowLeft,
  Building,
  Users,
  Clock,
} from "lucide-react";
import { NavigationProps } from '../types/props';

type RestaurantSubscriptionPageProps = NavigationProps;

const RestaurantSubscriptionPage: React.FC<RestaurantSubscriptionPageProps> = ({
  onNavigate,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    offersDelivery: false,
    preferredContactTime: "",
    acceptTerms: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setFormData({ ...formData, [name]: e.target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      alert(
        "Debes aceptar los términos y condiciones para enviar la solicitud."
      );
      return;
    }
    // Here you would typically send the data to your backend
    console.log("Restaurant Subscription Data:", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Gracias por tu interés!
          </h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu información. Nuestro equipo se pondrá en contacto
            contigo pronto.
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate("home")}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Inscribe tu Restaurante
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Name */}
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                placeholder="Nombre del Restaurante"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Contact Name */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="contactName"
                placeholder="Nombre del Contacto"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Offers Delivery Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="offersDelivery"
                checked={formData.offersDelivery}
                onChange={handleChange}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label
                htmlFor="offersDelivery"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Ofrece servicio a domicilio
              </label>
            </div>

            {/* Preferred Contact Time */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="preferredContactTime"
                value={formData.preferredContactTime}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">
                  Horario de su elección para ser contactado por un agente de
                  Quiklii
                </option>
                <option value="morning">Mañana (9 AM - 12 PM)</option>
                <option value="afternoon">Tarde (1 PM - 5 PM)</option>
                <option value="evening">Noche (6 PM - 9 PM)</option>
              </select>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label
                htmlFor="acceptTerms"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Acepto los{" "}
                <a href="#" className="text-orange-500 hover:underline">
                  términos y condiciones
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Enviar Solicitud
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSubscriptionPage;
