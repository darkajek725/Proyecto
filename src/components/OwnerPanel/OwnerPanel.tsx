import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  PlusCircle,
  Users,
  CreditCard,
} from 'lucide-react';
import { MyVehiclesTab } from './MyVehiclesTab';
import { RegisterVehicleTab } from './RegisterVehicleTab';
import { MyDriversTab } from './MyDriversTab';
import { BillingSubscriptionTab } from '../BillingSubscriptionTab';

export const OwnerPanel: React.FC = () => {
  const { currentSession, vehicles } = useApp();
  const [activeTab, setActiveTab] = useState<'mis_vehiculos' | 'registrar' | 'conductores' | 'suscripcion'>('mis_vehiculos');

  const myVehiclesCount = vehicles.filter((v) => v.ownerId === currentSession?.userId).length;

  return (
    <div className="space-y-6">
      {/* Owner Header Banner */}
      <div className="bg-[#1e3a5f] text-white rounded-2xl p-6 shadow-sm border border-[#142842] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
            <Car className="w-7 h-7 text-[#1e3a5f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Panel de Propietario de Flota Especial
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-slate-300">Usuario: {currentSession?.identifier}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              {currentSession?.name}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('registrar')}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#1e3a5f]" />
          <span>+ Registrar Vehículo</span>
        </button>
      </div>

      {/* Modern Minimalist Horizontal Segmented Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* TAB 1: MIS VEHÍCULOS */}
        <button
          type="button"
          onClick={() => setActiveTab('mis_vehiculos')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'mis_vehiculos'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className={`w-4 h-4 ${activeTab === 'mis_vehiculos' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>Mis Vehículos</span>
          {myVehiclesCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold leading-tight ${
                activeTab === 'mis_vehiculos'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {myVehiclesCount}
            </span>
          )}
        </button>

        {/* TAB 2: REGISTRAR VEHÍCULO */}
        <button
          type="button"
          onClick={() => setActiveTab('registrar')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'registrar'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className={`w-4 h-4 ${activeTab === 'registrar' ? 'text-amber-400' : 'text-emerald-600'}`} />
          <span>Registrar Vehículo</span>
        </button>

        {/* TAB 3: MIS CONDUCTORES */}
        <button
          type="button"
          onClick={() => setActiveTab('conductores')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'conductores'
              ? 'bg-[#1e3a5f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === 'conductores' ? 'text-amber-400' : 'text-blue-500'}`} />
          <span>Mis Conductores</span>
        </button>

        {/* TAB 4: SUSCRIPCIÓN (MONETIZACIÓN) */}
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
        {activeTab === 'mis_vehiculos' && (
          <MyVehiclesTab onRegisterClick={() => setActiveTab('registrar')} />
        )}
        {activeTab === 'registrar' && (
          <RegisterVehicleTab onSuccess={() => setActiveTab('mis_vehiculos')} />
        )}
        {activeTab === 'conductores' && <MyDriversTab />}
        {activeTab === 'suscripcion' && <BillingSubscriptionTab />}
      </div>
    </div>
  );
};

