import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import {
  Users,
  UserCheck,
  UserPlus,
  Car,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  ShieldCheck,
  User,
} from 'lucide-react';
import { formatPlateDisplay } from '../../utils/formatters';

interface AssignDriversModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const AssignDriversModal: React.FC<AssignDriversModalProps> = ({ vehicle, onClose }) => {
  const { drivers, currentSession, assignDriversToVehicle, openDriverModal } = useApp();

  // Drivers belonging to this owner
  const myDrivers = drivers.filter(
    (d) => d.ownerId === currentSession?.userId || d.ownerId === vehicle.ownerId
  );

  const [primaryDriverId, setPrimaryDriverId] = useState<string>(vehicle.assignedDriverId || '');
  const [secondaryDriverId, setSecondaryDriverId] = useState<string>(vehicle.secondaryDriverId || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation: cannot assign the same driver as both primary and secondary
    if (primaryDriverId && secondaryDriverId && primaryDriverId === secondaryDriverId) {
      setErrorMsg('No puedes asignar al mismo conductor como Principal y como Relevo al mismo tiempo.');
      return;
    }

    const res = assignDriversToVehicle(
      vehicle.id,
      primaryDriverId || undefined,
      secondaryDriverId || undefined
    );

    if (res.success) {
      setSuccessMsg('¡Conductores asignados exitosamente al vehículo!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message || 'Error al guardar asignación.');
    }
  };

  const selectedPrimary = drivers.find((d) => d.id === primaryDriverId);
  const selectedSecondary = drivers.find((d) => d.id === secondaryDriverId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Users className="w-4 h-4 text-[#1e3a5f]" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                Asignar Conductores (Principal y Relevo)
              </h3>
              <p className="text-[11px] text-slate-400">
                Vehículo Placa:{' '}
                <span className="text-amber-400 font-mono font-bold">
                  {formatPlateDisplay(vehicle.plate)}
                </span>{' '}
                • {vehicle.brand}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            Puedes vincular hasta <strong>dos conductores</strong> autorizados por vehículo (uno como <em>Conductor Principal</em> y otro como <em>Conductor de Relevo / Suplente</em> para viajes largos o dobles turnos).
          </p>

          {/* 1. Conductor Principal */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>1. Conductor Principal (Titular)</span>
              </label>
              {selectedPrimary && (
                <button
                  type="button"
                  onClick={() => openDriverModal(selectedPrimary.id)}
                  className="text-[11px] font-bold text-[#1e3a5f] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-amber-500" />
                  <span>Ver Ficha Técnica</span>
                </button>
              )}
            </div>

            <select
              value={primaryDriverId}
              onChange={(e) => setPrimaryDriverId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
            >
              <option value="">-- Sin Conductor Principal --</option>
              {myDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Tel: {d.phone} • Cat: {d.licenseCategory || 'C2'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Conductor de Relevo */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>2. Conductor de Relevo (Suplente / Segundo Turno)</span>
              </label>
              {selectedSecondary && (
                <button
                  type="button"
                  onClick={() => openDriverModal(selectedSecondary.id)}
                  className="text-[11px] font-bold text-[#1e3a5f] hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-amber-500" />
                  <span>Ver Ficha Técnica</span>
                </button>
              )}
            </div>

            <select
              value={secondaryDriverId}
              onChange={(e) => setSecondaryDriverId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">-- Sin Conductor de Relevo (Opcional) --</option>
              {myDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Tel: {d.phone} • Cat: {d.licenseCategory || 'C2'})
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Guardar Asignación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
