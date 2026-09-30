import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Car,
  Bus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import { TransPortalLogo } from './TransPortalLogo';

export const RoleSelector: React.FC = () => {
  const { openAuthModal, quickSwitchUser } = useApp();

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Badge, TransPortal Logo & Title */}
        <div className="space-y-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1e3a5f] text-xs font-semibold border border-blue-100 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#f09033] animate-pulse"></span>
            <span>Tablero de Contratación Oficial de Transporte Especial</span>
          </div>

          <TransPortalLogo size="lg" lightBackground={true} className="py-2" />

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1e3a5f] tracking-tight">
            Solicitudes de Servicio de Transporte
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal">
            Conectamos a empresas que requieren contratar transporte especial de pasajeros (buses, busetas, vans y camionetas) con propietarios y conductores habilitados.
          </p>
        </div>

        {/* The Three Main Prominent Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 max-w-6xl mx-auto">
          {/* Card 1: Soy Empresa */}
          <div className="group relative bg-white rounded-2xl p-7 border-2 border-slate-200 hover:border-[#1e3a5f] shadow-md hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center mb-5 shadow-sm group-hover:bg-[#142842] transition-colors">
                <Building2 className="w-7 h-7 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Contratante Oficial
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-[#1e3a5f] transition-colors">
                Soy Empresa
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Publica necesidades de transporte con origen, destino, cupo y tarifa. Revisa contraofertas en tiempo real, contrata vehículos habilitados y autoriza coordinadores de zona.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Publicación cronológica sin costo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Negociación y contraofertas directas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Habilita coordinadores de transporte</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => openAuthModal('empresa', 'login')}
                className="w-full py-2.5 px-3 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ingresar con NIT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('empresa', 'register')}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-[#1e3a5f] font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center justify-center cursor-pointer"
              >
                <span>Registrar Nueva Empresa</span>
              </button>
            </div>
          </div>

          {/* Card 2: Soy Coordinador (Nuevo Rol Principal) */}
          <div className="group relative bg-white rounded-2xl p-7 border-2 border-indigo-200 hover:border-indigo-600 shadow-md hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center mb-5 shadow-sm group-hover:bg-indigo-950 transition-colors">
                <UserCheck className="w-7 h-7 text-amber-300" />
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Operaciones y Rutas
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-900 transition-colors">
                Soy Coordinador
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Gestiona y publica rutas fijas escolares y empresariales o servicios ocasionales en representación oficial de la empresa de transporte asignada.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Publicación de rutas fijas y expresos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gestión de contraofertas recibidas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contacto directo con flota disponible</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => openAuthModal('coordinador', 'login')}
                className="w-full py-2.5 px-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Ingresar como Coordinador</span>
                <ArrowRight className="w-4 h-4 text-indigo-300" />
              </button>
              <div className="p-2 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-snug">
                <span className="font-semibold">Nota:</span> El rol y credenciales de coordinador son creados y asignados únicamente por cada empresa habilitada desde su panel.
              </div>
            </div>
          </div>

          {/* Card 3: Soy Propietario y/o Conductor */}
          <div className="group relative bg-white rounded-2xl p-7 border-2 border-slate-200 hover:border-amber-500 shadow-md hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-5 shadow-sm group-hover:bg-amber-400 transition-colors">
                <Car className="w-7 h-7 text-[#1e3a5f]" />
              </div>
              <span className="text-xs font-bold text-[#1e3a5f] uppercase tracking-wider block mb-1">
                Prestador de Flota
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                Propietario / Conductor
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Registra tus vehículos especiales (buses, busetas, vans), administra tus conductores o conduce tú mismo. Postúlate a solicitudes y propón tarifas directas.
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Alertas de servicios en tiempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Marcador Disponible / En ruta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Opción de "Conducir yo mismo"</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => openAuthModal('propietario_conductor', 'login')}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ingresar a mi Cuenta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('propietario_conductor', 'register')}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-slate-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center cursor-pointer"
              >
                <span>Crear Cuenta Propietario</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="pt-8 border-t border-slate-200/80 max-w-2xl mx-auto">
          <div className="bg-slate-100/90 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Acceso de Demostración Inmediato (1 Clic para Probar)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => quickSwitchUser('empresa')}
                className="px-3 py-2 bg-white hover:bg-blue-50 text-[#1e3a5f] rounded-lg border border-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Empresa</span>
              </button>
              <button
                type="button"
                onClick={() => quickSwitchUser('coordinador')}
                className="px-3 py-2 bg-white hover:bg-indigo-50 text-[#1e3a5f] rounded-lg border border-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Coordinador</span>
              </button>
              <button
                type="button"
                onClick={() => quickSwitchUser('propietario')}
                className="px-3 py-2 bg-white hover:bg-amber-50 text-slate-800 rounded-lg border border-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Bus className="w-3.5 h-3.5 text-amber-600" />
                <span>Propietario</span>
              </button>
              <button
                type="button"
                onClick={() => quickSwitchUser('conductor')}
                className="px-3 py-2 bg-white hover:bg-emerald-50 text-slate-800 rounded-lg border border-slate-200 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>Conductor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Regulatory note reminder */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Válido para vehículos de servicio especial con Tarjeta de Operación en Colombia</span>
        </div>
      </div>
    </div>
  );
};
