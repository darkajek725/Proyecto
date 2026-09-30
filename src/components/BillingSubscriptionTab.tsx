import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CreditCard,
  CheckCircle,
  Calendar,
  Sparkles,
  Plus,
  Minus,
  DollarSign,
  AlertCircle,
  Lock,
  Users,
  Check,
  Building2,
  ShieldCheck,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import { SubscriptionInfo, BillingHistoryItem } from '../types';

export const BillingSubscriptionTab: React.FC = () => {
  const { currentSession, updateSubscription, companies, owners } = useApp();

  const isCompany = currentSession?.role === 'empresa';
  const currentEntity = isCompany
    ? companies.find((c) => c.id === currentSession?.userId)
    : owners.find((o) => o.id === currentSession?.userId);

  // Fallback default subscription values
  const defaultUserCount = isCompany ? 3 : 1;
  const sub: SubscriptionInfo = currentEntity?.subscription || {
    isActive: false,
    tier: 'free',
    pricePerUser: 11900,
    userCount: defaultUserCount,
    totalMonthlyAmount: defaultUserCount * 11900,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billingHistory: [
      {
        id: 'INV-2026-001',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: defaultUserCount * 11900,
        status: 'pagado',
        invoiceUrl: '#',
      }
    ],
  };

  const [userSeats, setUserSeats] = useState<number>(sub.userCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Helper to detect card brand
  const getCardBrand = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNum)) return 'MasterCard';
    if (/^3[47]/.test(cleanNum)) return 'Amex';
    return 'CreditCard';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    // Limit to 16 digits
    value = value.slice(0, 16);
    // Format in groups of 4
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = value.length; i < len; i += 4) {
      parts.push(value.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
  };

  const handleIncrementSeats = () => {
    const newVal = userSeats + 1;
    setUserSeats(newVal);
    if (sub.isActive && currentSession) {
      updateSubscription(isCompany ? 'empresa' : 'propietario', currentSession.userId, {
        userCount: newVal,
      });
    }
  };

  const handleDecrementSeats = () => {
    if (userSeats <= 1) return;
    const newVal = userSeats - 1;
    setUserSeats(newVal);
    if (sub.isActive && currentSession) {
      updateSubscription(isCompany ? 'empresa' : 'propietario', currentSession.userId, {
        userCount: newVal,
      });
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 13) {
      setFormError('Por favor ingresa un número de tarjeta válido.');
      return;
    }
    if (cardExpiry.length < 5) {
      setFormError('Por favor ingresa la fecha de vencimiento (MM/AA).');
      return;
    }
    if (cardCvc.length < 3) {
      setFormError('Por favor ingresa el código CVC de seguridad.');
      return;
    }
    if (cardName.trim().length < 3) {
      setFormError('Por favor ingresa el nombre titular tal como aparece en la tarjeta.');
      return;
    }

    setIsSubmitting(true);

    // Simulate Payment Gateway Authorization Delay
    setTimeout(() => {
      setIsSubmitting(false);
      setCheckoutSuccess(true);
      if (currentSession) {
        const newInvoice: BillingHistoryItem = {
          id: `INV-2026-0${sub.billingHistory.length + 1}`,
          date: new Date().toISOString().split('T')[0],
          amount: userSeats * 11900,
          status: 'pagado',
          invoiceUrl: '#',
        };

        updateSubscription(isCompany ? 'empresa' : 'propietario', currentSession.userId, {
          isActive: true,
          tier: 'premium',
          userCount: userSeats,
          pricePerUser: 11900,
          paymentMethod: {
            brand: getCardBrand(cleanCard),
            last4: cleanCard.slice(-4),
          },
          billingHistory: [newInvoice, ...sub.billingHistory],
        });
      }
    }, 2000);
  };

  const handleCancelSubscription = () => {
    if (window.confirm('¿Estás seguro de que deseas cancelar tu suscripción premium? Volverás al plan básico.') && currentSession) {
      updateSubscription(isCompany ? 'empresa' : 'propietario', currentSession.userId, {
        isActive: false,
        tier: 'free',
      });
      setUserSeats(defaultUserCount);
      setCheckoutSuccess(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Información del Plan y Control de Licencias */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Banner de Estado de Suscripción */}
        <div className={`rounded-2xl p-6 border transition-all ${
          sub.isActive 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
            : 'bg-[#1e3a5f]/5 border-[#1e3a5f]/15 text-[#1e3a5f]'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  sub.isActive ? 'bg-emerald-600 text-white' : 'bg-[#1e3a5f] text-white'
                }`}>
                  {sub.isActive ? 'Plan Premium Activo' : 'Plan Básico Gratuito'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  TransPortal Club
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {sub.isActive ? 'Tu suscripción está al día' : 'Potencia tu operación de transporte'}
              </h2>
              <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
                {sub.isActive 
                  ? `Estás disfrutando de todos los beneficios corporativos de TransPortal Premium. Tu próximo cobro automático se realizará el ${sub.nextBillingDate}.`
                  : 'Desbloquea el acceso ilimitado a dossiers de conductores, firmas de convenios digitales de inmediato, monitoreo satelital en tiempo real, y soporte preferencial por solo un cobro mensual por usuario activo.'
                }
              </p>
            </div>
            <div className="shrink-0 p-3 bg-white rounded-xl shadow-xs border border-slate-100 hidden sm:block">
              {sub.isActive ? (
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              ) : (
                <Sparkles className="w-8 h-8 text-amber-500" />
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tarifa Mensual</span>
              <span className="text-lg font-black text-slate-900">{formatCOP(11900)} <span className="text-xs font-normal text-slate-500">/ usuario</span></span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Usuarios Contratados</span>
              <span className="text-lg font-black text-slate-900">{userSeats} {userSeats === 1 ? 'Usuario' : 'Usuarios'}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Inversión Mensual</span>
              <span className="text-lg font-black text-[#1e3a5f]">{formatCOP(userSeats * 11900)}</span>
            </div>
          </div>
        </div>

        {/* Sección: Beneficios de la Monetización / Suscripción */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            ¿Qué incluye la suscripción TransPortal Premium?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-1.5 bg-blue-50 text-[#1e3a5f] rounded-lg shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950">Dossiers y Contacto Ilimitado</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Visualiza números de teléfonos directos, hojas de vida y documentos de vehículos sin marcas de agua ni bloqueos de seguridad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-1.5 bg-blue-50 text-[#1e3a5f] rounded-lg shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950">Firma Digital de Convenios</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Ejecuta y legaliza acuerdos de colaboración de transporte especial con firma de validez legal de inmediato desde la plataforma.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-1.5 bg-blue-50 text-[#1e3a5f] rounded-lg shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950">Monitoreo y Alertas Satelitales</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Sistema de rastreo integrado con alertas automáticas de desviación de ruta y tiempos de espera para coordinadores de empresa.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-1.5 bg-blue-50 text-[#1e3a5f] rounded-lg shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950">Soporte Técnico Especializado 24/7</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Línea de soporte telefónica prioritaria para resolver contratiempos operacionales en rutas escolares, empresariales o de turismo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla: Historial de Facturación */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Historial de Facturación
          </h3>
          
          {sub.billingHistory.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No se registran transacciones previas en tu cuenta.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2">Factura</th>
                    <th className="py-2">Fecha</th>
                    <th className="py-2">Monto</th>
                    <th className="py-2">Estado</th>
                    <th className="py-2 text-right">Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {sub.billingHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-900">{item.id}</td>
                      <td className="py-3">{item.date}</td>
                      <td className="py-3 font-semibold">{formatCOP(item.amount)}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Visualizando recibo de transacción de TransPortal para la factura ${item.id} por valor de ${formatCOP(item.amount)}`)}
                          className="text-[#1e3a5f] hover:underline font-bold text-[11px] cursor-pointer"
                        >
                          Descargar PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Columna Derecha: Formulario de Suscripción (Checkout) */}
      <div className="space-y-6">
        
        {/* Gestor de Licencias de Usuarios Activos (Asientos) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#1e3a5f]" />
            Configurar Licencias
          </h3>
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            {isCompany 
              ? 'Elige cuántos usuarios o coordinadores autorizados de tu empresa operarán simultáneamente en TransPortal.'
              : 'Elige cuántos conductores o administradores de vehículos formarán parte de tu flota en TransPortal.'
            }
          </p>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-xs font-black text-slate-800">Licencias</span>
              <span className="block text-[10px] text-slate-500">Cobro mensual por usuario</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-xs">
              <button
                type="button"
                onClick={handleDecrementSeats}
                disabled={userSeats <= 1}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md disabled:opacity-45 disabled:hover:bg-transparent cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-extrabold text-sm text-slate-900">{userSeats}</span>
              <button
                type="button"
                onClick={handleIncrementSeats}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Subtotal Mensual:</span>
            <span className="font-extrabold text-slate-900">{formatCOP(userSeats * 11900)} COP</span>
          </div>
        </div>

        {/* Estado Actual / Formulario de Pago */}
        {sub.isActive ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Tu Plan Premium está Activo</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Suscrito con tarjeta {sub.paymentMethod?.brand} terminada en **{sub.paymentMethod?.last4}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Próximo cobro:</span>
                <span className="font-bold text-slate-800">{sub.nextBillingDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Monto a cobrar:</span>
                <span className="font-bold text-[#1e3a5f]">{formatCOP(sub.totalMonthlyAmount)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelSubscription}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
            >
              Cancelar Suscripción
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-500" />
                Pasarela de Pago Segura
              </h3>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                Ingresa los datos de tu tarjeta de crédito para iniciar la facturación recurrente de $11.900 al mes por usuario.
              </p>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-[11px] text-rose-800 leading-normal">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Titular *</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ej. RAÚL VELASCO COELLO"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Número de Tarjeta *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4000 1234 5678 9010"
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono text-sm tracking-widest"
                  />
                  <div className="absolute right-3 top-2 text-slate-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vence (MM/AA) *</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="12/29"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">CVC / CVV *</label>
                  <input
                    type="password"
                    required
                    value={cardCvc}
                    onChange={handleCvcChange}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono text-sm tracking-wider"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-200" />
                  {isSubmitting ? 'Procesando Transacción...' : `Pagar ${formatCOP(userSeats * 11900)} / Mes`}
                </button>
              </div>

              <div className="text-center pt-1 text-[9px] text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Encriptación segura SSL 256 bits</span>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
