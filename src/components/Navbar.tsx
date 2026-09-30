import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bus,
  Building2,
  Car,
  User,
  LogOut,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Bell,
  UserCheck,
} from 'lucide-react';
import { TransPortalLogo } from './TransPortalLogo';

interface NavbarProps {
  onNotificationClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNotificationClick }) => {
  const {
    currentSession,
    requests,
    logout,
    returnToOwnerPanel,
    quickSwitchUser,
    isRoleSelectorOpen,
    setIsRoleSelectorOpen,
    getUnreadNotificationsCount,
    resetDataToSeed,
    goToFollowedServicesFeed,
    driverActiveTab,
    driverFeedFilter,
    isFollowingCompany,
  } = useApp();

  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const unreadCount = currentSession
    ? getUnreadNotificationsCount(currentSession.userId)
    : 0;

  const followedRequestsCount = requests.filter(
    (r) =>
      r.status === 'disponible' &&
      isFollowingCompany(r.companyId) &&
      (!currentSession || !r.ignoredByDriverIds?.includes(currentSession.userId))
  ).length;

  const isHomeActive =
    !isRoleSelectorOpen &&
    currentSession?.role === 'conductor' &&
    driverActiveTab === 'disponibles' &&
    driverFeedFilter === 'seguidos';

  return (
    <header className="sticky top-0 z-40 bg-white/95 text-slate-800 shadow-xs border-b border-slate-200 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand logo & title using TransPortal format */}
          <button
            onClick={() => setIsRoleSelectorOpen(true)}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer select-none"
            title="Ir a la pantalla principal / selector de roles"
          >
            <TransPortalLogo size="sm" lightBackground={true} />
          </button>

          {/* Action Links and Navigation Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Home / Feed button */}
            <button
              type="button"
              onClick={goToFollowedServicesFeed}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs border cursor-pointer ${
                isHomeActive
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Ver solicitudes de empresas que sigues"
            >
              <Car className={`w-3.5 h-3.5 ${isHomeActive ? 'text-amber-400' : 'text-[#f09033]'}`} />
              <span className="hidden sm:inline">Inicio</span>
              {followedRequestsCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black leading-tight ${
                    isHomeActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-[#1e3a5f] text-white'
                  }`}
                >
                  {followedRequestsCount}
                </span>
              )}
            </button>

            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all cursor-pointer"
                title="Cambiar rápidamente de rol de prueba"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="hidden md:inline">Simular Rol</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${showDemoMenu ? 'rotate-180' : ''}`} />
              </button>

              {showDemoMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDemoMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Cambio Rápido de Rol</span>
                      <span className="text-amber-600 font-bold">Demo</span>
                    </div>

                    <div className="space-y-0.5 pt-1">
                      <button
                        onClick={() => {
                          quickSwitchUser('empresa');
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left p-2 hover:bg-blue-50/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs leading-tight">Empresa Contratante</div>
                          <div className="text-[11px] text-slate-500">Altiplano S.A.S.</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          quickSwitchUser('coordinador');
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left p-2 hover:bg-indigo-50/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs leading-tight">Coordinador de Rutas</div>
                          <div className="text-[11px] text-slate-500">Ing. Mauricio Gómez (Altiplano)</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          quickSwitchUser('propietario');
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left p-2 hover:bg-amber-50/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs leading-tight">Propietario de Flota</div>
                          <div className="text-[11px] text-slate-500">Don Carlos Rodríguez</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          quickSwitchUser('conductor');
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left p-2 hover:bg-emerald-50/80 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs leading-tight">Conductor Asignado</div>
                          <div className="text-[11px] text-slate-500">Julián Pérez (WEO-412)</div>
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          if (confirm('¿Restablecer todos los datos de prueba a los valores iniciales?')) {
                            resetDataToSeed();
                            setShowDemoMenu(false);
                          }
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restablecer datos demo</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {currentSession ? (
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Mode: Owner acting as driver button */}
                {currentSession.isOwnerActingAsDriver && (
                  <button
                    onClick={returnToOwnerPanel}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
                    title="Volver a tu panel de propietario"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Panel Propietario</span>
                  </button>
                )}

                 {/* Notification Bell */}
                {onNotificationClick && (
                  <button
                    type="button"
                    onClick={onNotificationClick}
                    className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Notificaciones del sistema"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {/* User Session Pill */}
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentSession.role === 'coordinador' ? 'bg-indigo-600 text-white' : 'bg-[#1e3a5f] text-white'
                  }`}>
                    {currentSession.role === 'empresa' ? (
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    ) : currentSession.role === 'coordinador' ? (
                      <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                    ) : currentSession.role === 'propietario' ? (
                      <User className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                      {currentSession.name}
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold tracking-wider uppercase leading-none truncate max-w-[130px] mt-0.5">
                      {currentSession.role === 'empresa'
                        ? 'Empresa'
                        : currentSession.role === 'coordinador'
                        ? `Coordinador (${currentSession.companyName ? currentSession.companyName.split(' ')[0] : 'Empresa'})`
                        : currentSession.role === 'propietario'
                        ? 'Propietario'
                        : `Conductor ${currentSession.assignedPlate ? `(${currentSession.assignedPlate})` : ''}`}
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsRoleSelectorOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#1e3a5f] hover:bg-[#142842] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Ingresar / Roles
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

