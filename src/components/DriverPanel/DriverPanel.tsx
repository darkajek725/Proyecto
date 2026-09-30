import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  CheckCircle2,
  History,
  Heart,
  Bell,
  ArrowLeft,
  Settings,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { AvailableServicesTab } from './AvailableServicesTab';
import { AcceptedServicesTab } from './AcceptedServicesTab';
import { DriverHistoryTab } from './DriverHistoryTab';
import { DriverVehicleProfileTab } from './DriverVehicleProfileTab';
import { DriverProfileTab } from './DriverProfileTab';
import { FollowedCompaniesTab } from './FollowedCompaniesTab';
import { DriverNotificationsTab } from './DriverNotificationsTab';
import { formatPlateDisplay } from '../../utils/formatters';
import { User } from 'lucide-react';

export const DriverPanel: React.FC = () => {
  const {
    currentSession,
    requests,
    getUnreadNotificationsCount,
    returnToOwnerPanel,
    driverActiveTab,
    setDriverActiveTab,
    driverFeedFilter,
    setDriverFeedFilter,
    isFollowingCompany,
  } = useApp();

  const selectTab = (tab: typeof driverActiveTab, filter?: 'todos' | 'seguidos') => {
    setDriverActiveTab(tab);
    if (filter) {
      setDriverFeedFilter(filter);
    }
  };

  const unreadNotifs = currentSession
    ? getUnreadNotificationsCount(currentSession.userId)
    : 0;

  const isOwnerActing = currentSession?.isOwnerActingAsDriver;

  // Counts for badges
  const availableCount = requests.filter(
    (r) =>
      r.status === 'disponible' &&
      (!currentSession || !r.ignoredByDriverIds?.includes(currentSession.userId))
  ).length;

  const followedCount = requests.filter(
    (r) =>
      r.status === 'disponible' &&
      isFollowingCompany(r.companyId) &&
      (!currentSession || !r.ignoredByDriverIds?.includes(currentSession.userId))
  ).length;

  const acceptedCount = requests.filter(
    (r) =>
      r.status === 'aceptada' &&
      r.acceptedBy &&
      (r.acceptedBy.driverId === currentSession?.userId ||
        r.acceptedBy.driverName === currentSession?.name)
  ).length;

  const isHomeActive = driverActiveTab === 'disponibles' && driverFeedFilter === 'seguidos';
  const isAllActive = driverActiveTab === 'disponibles' && driverFeedFilter === 'todos';

  return (
    <div className="space-y-6">
      {/* Return to Owner Panel bar if owner is driving */}
      {isOwnerActing && (
        <div className="bg-amber-400 text-slate-950 px-5 py-3 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
            <span className="font-extrabold text-xs uppercase tracking-wide">
              Modo Conducción Activo (Propietario al volante)
            </span>
            <span className="text-xs font-semibold">
              — Placa asignada: {currentSession.assignedPlate}
            </span>
          </div>

          <button
            type="button"
            onClick={returnToOwnerPanel}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Volver a panel de Propietario</span>
          </button>
        </div>
      )}

      {/* Driver Header Banner */}
      <div className="bg-[#1e3a5f] text-white rounded-2xl p-6 shadow-sm border border-[#142842] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            <Car className="w-7 h-7 text-[#1e3a5f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Panel del Conductor de Servicio Especial
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {currentSession?.assignedPlate && (
                <span className="bg-amber-400 text-slate-950 font-mono font-extrabold text-[11px] px-2 py-0.5 rounded shadow-xs">
                  Placa: {formatPlateDisplay(currentSession.assignedPlate)}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              {currentSession?.name}
            </h1>
          </div>
        </div>

        {/* Quick plate badge or info */}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl text-slate-200 border border-white/10 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentSession?.assignedVehicleType || 'Servicio Especial'}</span>
          </span>
        </div>
      </div>

      {/* Modern Minimalist Horizontal Segmented Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* TAB 1: INICIO (EMPRESAS SEGUIDAS) */}
        <button
          type="button"
          onClick={() => selectTab('disponibles', 'seguidos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            isHomeActive
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Solicitudes de empresas que sigues"
        >
          <Car className={`w-4 h-4 ${isHomeActive ? 'text-amber-400' : 'text-amber-600'}`} />
          <span>Inicio (Seguidas)</span>
          {followedCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                isHomeActive ? 'bg-amber-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {followedCount}
            </span>
          )}
        </button>

        {/* TAB 2: TODAS LAS SOLICITUDES */}
        <button
          type="button"
          onClick={() => selectTab('disponibles', 'todos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            isAllActive
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className={`w-4 h-4 ${isAllActive ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Todas las Solicitudes</span>
          {availableCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                isAllActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {availableCount}
            </span>
          )}
        </button>

        {/* TAB 3: SERVICIOS ACEPTADOS */}
        <button
          type="button"
          onClick={() => selectTab('aceptados')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            driverActiveTab === 'aceptados'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${driverActiveTab === 'aceptados' ? 'text-amber-400' : 'text-emerald-600'}`} />
          <span>Aceptados</span>
          {acceptedCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                driverActiveTab === 'aceptados' ? 'bg-amber-400 text-slate-950' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {acceptedCount}
            </span>
          )}
        </button>

        {/* TAB 4: HISTORIAL */}
        <button
          type="button"
          onClick={() => selectTab('historial')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            driverActiveTab === 'historial'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className={`w-4 h-4 ${driverActiveTab === 'historial' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Historial</span>
        </button>

        {/* TAB 5: MI PERFIL Y FICHA TÉCNICA */}
        <button
          type="button"
          onClick={() => selectTab('perfil')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            driverActiveTab === 'perfil'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className={`w-4 h-4 ${driverActiveTab === 'perfil' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Mi Perfil & Ficha</span>
        </button>

        {/* TAB 6: MI VEHÍCULO */}
        <button
          type="button"
          onClick={() => selectTab('vehiculo')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            driverActiveTab === 'vehiculo'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className={`w-4 h-4 ${driverActiveTab === 'vehiculo' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Mi Vehículo</span>
        </button>

        {/* TAB 7: EMPRESAS QUE SIGO */}
        <button
          type="button"
          onClick={() => selectTab('siguiendo')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            driverActiveTab === 'siguiendo'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${driverActiveTab === 'siguiendo' ? 'text-amber-400' : 'text-rose-500'}`} />
          <span>Empresas que Sigo</span>
        </button>

        {/* TAB 8: NOTIFICACIONES */}
        <button
          type="button"
          onClick={() => selectTab('notificaciones')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            driverActiveTab === 'notificaciones'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className={`w-4 h-4 ${driverActiveTab === 'notificaciones' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Notificaciones</span>
          {unreadNotifs > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black leading-tight animate-pulse">
              {unreadNotifs}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-1">
        {driverActiveTab === 'disponibles' && <AvailableServicesTab />}
        {driverActiveTab === 'aceptados' && <AcceptedServicesTab />}
        {driverActiveTab === 'historial' && <DriverHistoryTab />}
        {driverActiveTab === 'perfil' && <DriverProfileTab />}
        {driverActiveTab === 'vehiculo' && <DriverVehicleProfileTab />}
        {driverActiveTab === 'siguiendo' && <FollowedCompaniesTab />}
        {driverActiveTab === 'notificaciones' && (
          <DriverNotificationsTab
            onViewServices={() => {
              setDriverActiveTab('disponibles');
              setDriverFeedFilter('seguidos');
            }}
          />
        )}
      </div>
    </div>
  );
};

