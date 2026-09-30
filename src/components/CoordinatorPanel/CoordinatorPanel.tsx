import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  PlusCircle,
  FileText,
  Car,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Repeat,
  Compass,
} from 'lucide-react';
import { PublishRequestForm } from '../CompanyPanel/PublishRequestForm';
import { CompanyRequestsTab } from '../CompanyPanel/CompanyRequestsTab';
import { AvailableVehiclesFeed } from '../CompanyPanel/AvailableVehiclesFeed';

export const CoordinatorPanel: React.FC = () => {
  const { currentSession, companies, requests } = useApp();
  const [activeTab, setActiveTab] = useState<'publicar' | 'solicitudes' | 'vehiculos'>('solicitudes');

  const assignedCompany = companies.find(
    (c) => c.id === currentSession?.companyId || c.name === currentSession?.companyName
  ) || companies[0];

  const myCompanyRequests = requests.filter(
    (r) =>
      r.companyId === assignedCompany?.id ||
      r.createdByCoordinatorId === currentSession?.userId ||
      (currentSession?.name && r.coordinatorName.toLowerCase().includes(currentSession.name.toLowerCase()))
  );

  const activeCount = myCompanyRequests.filter(
    (r) => r.status === 'disponible' || r.status === 'aceptada'
  ).length;

  return (
    <div className="space-y-6">
      {/* Coordinator Identity Banner */}
      <div className="bg-gradient-to-r from-[#1e3a5f] via-[#162d4c] to-[#0f1d32] text-white rounded-2xl p-6 shadow-sm border border-[#142842] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xl shrink-0 shadow-md">
            <UserCheck className="w-8 h-8 text-[#1e3a5f]" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Coordinador Autorizado</span>
              </span>
              <span className="text-xs text-slate-300">
                Zona: {currentSession?.coordinatorZone || 'Operaciones Generales'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentSession?.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-0.5">
              <span className="flex items-center gap-1 font-semibold text-amber-200">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>En representación oficial de: {assignedCompany?.name}</span>
              </span>
              <span>•</span>
              <span>NIT: {assignedCompany?.nit}</span>
              {currentSession?.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{currentSession.phone}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('publicar')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#1e3a5f]" />
            <span>+ Publicar Ruta o Servicio</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* Tab: Mis Rutas y Solicitudes */}
        <button
          type="button"
          onClick={() => setActiveTab('solicitudes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'solicitudes'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'solicitudes' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Rutas de la Empresa</span>
          {activeCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                activeTab === 'solicitudes'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {activeCount}
            </span>
          )}
        </button>

        {/* Tab: Publicar Ruta (Fija o Ocasional) */}
        <button
          type="button"
          onClick={() => setActiveTab('publicar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'publicar'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className={`w-4 h-4 ${activeTab === 'publicar' ? 'text-amber-400' : 'text-amber-600'}`} />
          <span>Publicar Ruta Fija / Ocasional</span>
        </button>

        {/* Tab: Directorio de Vehículos Disponibles */}
        <button
          type="button"
          onClick={() => setActiveTab('vehiculos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'vehiculos'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className={`w-4 h-4 ${activeTab === 'vehiculos' ? 'text-amber-400' : 'text-emerald-600'}`} />
          <span>Vehículos y Flota Disponible</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-1">
        {activeTab === 'publicar' && (
          <PublishRequestForm onSuccessNavigate={() => setActiveTab('solicitudes')} />
        )}
        {activeTab === 'solicitudes' && <CompanyRequestsTab />}
        {activeTab === 'vehiculos' && <AvailableVehiclesFeed />}
      </div>
    </div>
  );
};
