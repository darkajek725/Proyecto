import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PlusCircle,
  FileText,
  Car,
  History,
  Bell,
  Building2,
  Star,
  Edit3,
  CreditCard,
} from 'lucide-react';
import { PublishRequestForm } from './PublishRequestForm';
import { CompanyRequestsTab } from './CompanyRequestsTab';
import { AvailableVehiclesFeed } from './AvailableVehiclesFeed';
import { CompanyHistoryTab } from './CompanyHistoryTab';
import { CompanyNotificationsTab } from './CompanyNotificationsTab';
import { CoordinatorsTab } from './CoordinatorsTab';
import { UserCheck } from 'lucide-react';
import { BillingSubscriptionTab } from '../BillingSubscriptionTab';

export const CompanyPanel: React.FC = () => {
  const { currentSession, companies, coordinators, requests, getUnreadNotificationsCount, openCompanyModal, getCompanyRating } = useApp();
  const [activeTab, setActiveTab] = useState<'publicar' | 'solicitudes' | 'coordinadores' | 'vehiculos' | 'historial' | 'notificaciones' | 'suscripcion'>('solicitudes');

  const currentCompany = companies.find((c) => c.id === currentSession?.userId);
  const companyRating = currentSession ? getCompanyRating(currentSession.userId) : { average: 5, count: 0 };
  const companyCoordinatorsCount = coordinators.filter(c => c.companyId === currentSession?.userId).length;

  const unreadNotifs = currentSession
    ? getUnreadNotificationsCount(currentSession.userId)
    : 0;

  const myActiveRequestsCount = requests.filter(
    (r) => r.companyId === currentSession?.userId && (r.status === 'disponible' || r.status === 'aceptada')
  ).length;

  return (
    <div className="space-y-6">
      {/* Company Header Banner */}
      <div className="bg-[#1e3a5f] text-white rounded-2xl p-6 shadow-sm border border-[#142842] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-white/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {currentCompany?.logo ? (
              <img
                src={currentCompany.logo}
                alt={currentCompany.name}
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Building2 className="w-7 h-7 text-[#1e3a5f]" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Panel de Empresa Contratante
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-slate-300">NIT: {currentSession?.identifier}</span>
              
              {/* Star Rating Badge */}
              <button
                type="button"
                onClick={() => currentSession && openCompanyModal(currentSession.userId)}
                className="inline-flex items-center gap-1 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-bold transition-colors cursor-pointer"
                title="Ver opiniones de conductores"
              >
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>{companyRating.average}</span>
                <span className="text-[10px] text-amber-200/80 font-normal">
                  ({companyRating.count} {companyRating.count === 1 ? 'opinión' : 'opiniones'})
                </span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              {currentSession?.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => currentSession && openCompanyModal(currentSession.userId)}
            className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-600/60 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-400" />
            <span>Perfil & Opiniones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('publicar')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#1e3a5f]" />
            <span>+ Publicar Solicitud</span>
          </button>
        </div>
      </div>

      {/* Modern Minimalist Horizontal Segmented Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* TAB 1: MIS SOLICITUDES */}
        <button
          type="button"
          onClick={() => setActiveTab('solicitudes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'solicitudes'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'solicitudes' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Mis Solicitudes</span>
          {myActiveRequestsCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                activeTab === 'solicitudes'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {myActiveRequestsCount}
            </span>
          )}
        </button>

        {/* TAB 2: PUBLICAR SOLICITUD */}
        <button
          type="button"
          onClick={() => setActiveTab('publicar')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'publicar'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className={`w-4 h-4 ${activeTab === 'publicar' ? 'text-amber-400' : 'text-amber-600'}`} />
          <span>Publicar Solicitud</span>
        </button>

        {/* TAB 3: COORDINADORES AUTORIZADOS */}
        <button
          type="button"
          onClick={() => setActiveTab('coordinadores')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'coordinadores'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className={`w-4 h-4 ${activeTab === 'coordinadores' ? 'text-amber-400' : 'text-blue-600'}`} />
          <span>Coordinadores</span>
          {companyCoordinatorsCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                activeTab === 'coordinadores'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {companyCoordinatorsCount}
            </span>
          )}
        </button>

        {/* TAB 4: VEHÍCULOS DISPONIBLES (FEED) */}
        <button
          type="button"
          onClick={() => setActiveTab('vehiculos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'vehiculos'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className={`w-4 h-4 ${activeTab === 'vehiculos' ? 'text-amber-400' : 'text-emerald-600'}`} />
          <span>Vehículos Disponibles</span>
        </button>

        {/* TAB 4: HISTORIAL */}
        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className={`w-4 h-4 ${activeTab === 'historial' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Historial</span>
        </button>

        {/* TAB 5: NOTIFICACIONES */}
        <button
          type="button"
          onClick={() => setActiveTab('notificaciones')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'notificaciones'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className={`w-4 h-4 ${activeTab === 'notificaciones' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Notificaciones</span>
          {unreadNotifs > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black leading-tight animate-pulse">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* TAB 6: SUSCRIPCIÓN (MONETIZACIÓN) */}
        <button
          type="button"
          onClick={() => setActiveTab('suscripcion')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'suscripcion'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/40'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeTab === 'suscripcion' ? 'text-[#1e3a5f]' : 'text-amber-600'}`} />
          <span className="flex items-center gap-1">
            Planes
            <span className="text-[9px] bg-red-500 text-white px-1 py-0.2 rounded font-black uppercase tracking-wider animate-pulse">COP</span>
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-1">
        {activeTab === 'publicar' && (
          <PublishRequestForm onSuccessNavigate={() => setActiveTab('solicitudes')} />
        )}
        {activeTab === 'solicitudes' && <CompanyRequestsTab />}
        {activeTab === 'coordinadores' && <CoordinatorsTab />}
        {activeTab === 'vehiculos' && <AvailableVehiclesFeed />}
        {activeTab === 'historial' && <CompanyHistoryTab />}
        {activeTab === 'notificaciones' && (
          <CompanyNotificationsTab onViewRequest={() => setActiveTab('solicitudes')} />
        )}
        {activeTab === 'suscripcion' && <BillingSubscriptionTab />}
      </div>
    </div>
  );
};
