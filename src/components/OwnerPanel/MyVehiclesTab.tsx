import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import {
  Car,
  Bus,
  Users,
  Building2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  User,
  PlusCircle,
  ShieldCheck,
  FileText,
  Trash2,
  AlertTriangle,
  X,
  AlertCircle,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { formatPlateDisplay } from '../../utils/formatters';
import { EditEquipmentModal } from '../EditEquipmentModal';
import { AssignDriversModal } from './AssignDriversModal';

interface MyVehiclesTabProps {
  onRegisterClick?: () => void;
}

export const MyVehiclesTab: React.FC<MyVehiclesTabProps> = ({ onRegisterClick }) => {
  const {
    currentSession,
    vehicles,
    drivers,
    toggleVehicleAvailability,
    startDrivingAsOwner,
    openVehicleModal,
    openDriverModal,
    deleteVehicle,
  } = useApp();

  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [editingEquipmentVehicle, setEditingEquipmentVehicle] = useState<Vehicle | null>(null);
  const [assigningDriversVehicle, setAssigningDriversVehicle] = useState<Vehicle | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter vehicles belonging to this owner
  const myVehicles = vehicles.filter((v) => v.ownerId === currentSession?.userId);

  const handleConfirmDelete = () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    const res = deleteVehicle(vehicleToDelete.id);
    setIsDeleting(false);
    if (res.success) {
      setDeleteNotice({
        message: res.message || `Vehículo ${vehicleToDelete.plate} eliminado correctamente.`,
        type: 'success',
      });
      setVehicleToDelete(null);
      setTimeout(() => setDeleteNotice(null), 4000);
    } else {
      setDeleteNotice({
        message: res.message || 'Error al eliminar el vehículo.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mis Vehículos Registrados</h2>
          <p className="text-xs text-slate-500">
            Control de disponibilidad en tiempo real, asignación de conductores, descarga de fichas y gestión de flota.
          </p>
        </div>

        {onRegisterClick && (
          <button
            type="button"
            onClick={onRegisterClick}
            className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>+ Registrar Nuevo Vehículo</span>
          </button>
        )}
      </div>

      {deleteNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
            deleteNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {deleteNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{deleteNotice.message}</span>
        </div>
      )}

      {myVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Car className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No tienes vehículos registrados</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Da de alta tu primer bus, buseta, van o camioneta con su tarjeta de operación para empezar a postularte a servicios.
          </p>
          {onRegisterClick && (
            <button
              type="button"
              onClick={onRegisterClick}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Registrar Vehículo Ahora
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myVehicles.map((vehicle) => {
            const isAvailable = vehicle.isAvailable;

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Banner image + circular avatar */}
                  <div
                    onClick={() => openVehicleModal(vehicle.id)}
                    className="relative h-44 w-full bg-slate-800 cursor-pointer"
                    title="Clic para ver perfil completo y descargar ficha técnica"
                  >
                    <img
                      src={vehicle.coverImage}
                      alt={`Vehículo ${vehicle.plate}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    {/* Top availability pill & Delete action */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5 ${
                          isAvailable
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isAvailable ? 'bg-white animate-pulse' : 'bg-white'
                          }`}
                        ></span>
                        <span>{isAvailable ? 'Disponible' : 'No disponible'}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          {vehicle.type}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVehicleToDelete(vehicle);
                          }}
                          className="w-7 h-7 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar este vehículo de mi flota"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-300 hover:text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Avatar circular */}
                    <div className="absolute -bottom-4 left-4 z-10">
                      <img
                        src={vehicle.profileImage}
                        alt="Avatar vehículo"
                        className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md hover:ring-2 hover:ring-amber-400 transition-all"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Plate */}
                    <div className="absolute bottom-2.5 right-3 text-right">
                      <div className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded font-mono font-extrabold text-sm shadow-sm tracking-wider inline-block transition-colors">
                        {formatPlateDisplay(vehicle.plate)}
                      </div>
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="pt-6 px-5 pb-4 space-y-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => openVehicleModal(vehicle.id)}
                        className="text-left font-bold text-slate-900 text-base leading-tight hover:text-[#1e3a5f] hover:underline cursor-pointer flex items-center gap-1.5 group/v"
                      >
                        <span>{vehicle.brand}</span>
                        <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/v:text-[#1e3a5f] transition-colors" />
                      </button>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Año {vehicle.modelYear}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-[#1e3a5f]" />
                          {vehicle.capacity} pasajeros
                        </span>
                      </div>
                    </div>

                    {/* Regulatory Mandatory Info */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-[#1e3a5f] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Empresa Afiliada
                          </span>
                          <span className="font-semibold text-slate-900">
                            {vehicle.affiliatedCompany}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-slate-700">
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Tarjeta de Operación
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-800">
                            {vehicle.operatingCardNumber}
                          </span>
                        </div>
                      </div>

                      {/* Assigned Drivers (Principal y Relevo) */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-100 text-xs">
                        {/* Principal */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              Principal:{' '}
                              <span className="font-semibold text-slate-900">
                                {vehicle.assignedDriverName || 'Sin asignar'}
                              </span>
                            </span>
                          </div>
                          {vehicle.assignedDriverId && (
                            <button
                              type="button"
                              onClick={() => openDriverModal(vehicle.assignedDriverId!)}
                              className="text-[10px] font-bold text-[#1e3a5f] hover:underline flex items-center gap-0.5 shrink-0"
                              title="Ver Ficha Técnica del Conductor Principal"
                            >
                              <FileText className="w-3 h-3 text-amber-500" />
                              <span>Ficha</span>
                            </button>
                          )}
                        </div>

                        {/* Relevo */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <UserPlus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">
                              Relevo:{' '}
                              <span className="font-semibold text-slate-800">
                                {vehicle.secondaryDriverName || 'Sin asignar'}
                              </span>
                            </span>
                          </div>
                          {vehicle.secondaryDriverId && (
                            <button
                              type="button"
                              onClick={() => openDriverModal(vehicle.secondaryDriverId!)}
                              className="text-[10px] font-bold text-[#1e3a5f] hover:underline flex items-center gap-0.5 shrink-0"
                              title="Ver Ficha Técnica del Conductor de Relevo"
                            >
                              <FileText className="w-3 h-3 text-amber-500" />
                              <span>Ficha</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons: Dossier, Equipment & Assign Drivers */}
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openVehicleModal(vehicle.id)}
                          className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Ver ficha técnica completa del vehículo"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#1e3a5f] shrink-0" />
                          <span className="truncate">Ficha Vehículo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingEquipmentVehicle(vehicle)}
                          className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Editar equipamiento de seguridad y confort"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Equipamiento</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAssigningDriversVehicle(vehicle)}
                        className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Asignar Conductores (1 o 2)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleVehicleAvailability(vehicle.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAvailable
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Marcar No Disp.</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marcar Disponible</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => startDrivingAsOwner(vehicle.id)}
                      className="py-2 px-3 bg-[#1e3a5f] hover:bg-[#142842] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Entrar al panel de conductor para este vehículo"
                    >
                      <span>Conducir yo mismo</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setVehicleToDelete(vehicle)}
                    className="w-full py-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Vehículo de la Plataforma</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE VEHÍCULO */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ¿Eliminar vehículo de tu flota?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Esta acción no se puede deshacer. Se eliminarán los datos del vehículo y su ficha técnica asociada.
                  </p>
                </div>
              </div>

              {/* Vehicle card summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <img
                  src={vehicleToDelete.profileImage || vehicleToDelete.coverImage}
                  alt={vehicleToDelete.plate}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                      {formatPlateDisplay(vehicleToDelete.plate)}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {vehicleToDelete.brand}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>{vehicleToDelete.type}</span>
                    <span>•</span>
                    <span>{vehicleToDelete.capacity} Pasajeros</span>
                    <span>•</span>
                    <span>Mod. {vehicleToDelete.modelYear}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Si este vehículo tenía un conductor asignado, quedará liberado automáticamente para que puedas asignarle otro móvil.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVehicleToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar vehículo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Equipment Modal */}
      {editingEquipmentVehicle && (
        <EditEquipmentModal
          vehicle={editingEquipmentVehicle}
          onClose={() => setEditingEquipmentVehicle(null)}
        />
      )}

      {/* Assign Drivers Modal */}
      {assigningDriversVehicle && (
        <AssignDriversModal
          vehicle={assigningDriversVehicle}
          onClose={() => setAssigningDriversVehicle(null)}
        />
      )}
    </div>
  );
};
