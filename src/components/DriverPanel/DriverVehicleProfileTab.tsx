import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleType } from '../../types';
import {
  Car,
  Camera,
  CheckCircle2,
  Users,
  AlertCircle,
  Building2,
  FileCheck2,
  FileText,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { readFileAsDataUrl, formatPlateDisplay } from '../../utils/formatters';
import { EditEquipmentModal } from '../EditEquipmentModal';

export const DriverVehicleProfileTab: React.FC = () => {
  const { currentSession, vehicles, updateVehicle, openVehicleModal } = useApp();

  // Find vehicle for this driver
  const currentVehicle =
    vehicles.find((v) => v.id === currentSession?.assignedVehicleId) ||
    vehicles.find((v) => v.plate === currentSession?.assignedPlate) ||
    vehicles[0];

  const [isEditingEquipment, setIsEditingEquipment] = useState(false);
  const [brand, setBrand] = useState(currentVehicle?.brand || '');
  const [modelYear, setModelYear] = useState<number | ''>(currentVehicle?.modelYear || 2023);
  const [type, setType] = useState<VehicleType>(currentVehicle?.type || 'Buseta');
  const [capacity, setCapacity] = useState<number | ''>(currentVehicle?.capacity || 24);

  const [coverImage, setCoverImage] = useState<string>(
    currentVehicle?.coverImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80'
  );
  const [profileImage, setProfileImage] = useState<string>(
    currentVehicle?.profileImage || 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=300&q=80'
  );

  const [coverLoading, setCoverLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverLoading(true);
    try {
      const url = await readFileAsDataUrl(file);
      setCoverImage(url);
    } catch (err) {
      console.warn(err);
    } finally {
      setCoverLoading(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileLoading(true);
    try {
      const url = await readFileAsDataUrl(file);
      setProfileImage(url);
    } catch (err) {
      console.warn(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) return;

    updateVehicle(currentVehicle.id, {
      brand: brand.trim(),
      modelYear: Number(modelYear) || 2023,
      type,
      capacity: Number(capacity) || 16,
      coverImage,
      profileImage,
    });

    setSuccessMsg('¡Perfil del vehículo actualizado correctamente!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Perfil del Vehículo Asignado</h2>
          <p className="text-xs text-slate-500">
            Actualiza las fotografías y características técnicas del vehículo con el que prestas servicio.
          </p>
        </div>

        {currentVehicle && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingEquipment(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Editar equipamiento de seguridad y confort"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>Editar Equipamiento</span>
            </button>

            <button
              type="button"
              onClick={() => openVehicleModal(currentVehicle.id)}
              className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Ver Ficha Técnica y Dossier</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Banner with Circular Avatar Upload */}
        <div className="relative h-48 w-full bg-slate-800">
          <img
            src={coverImage}
            alt="Portada del vehículo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />

          {/* Change Cover Button */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>{coverLoading ? 'Cargando...' : 'Cambiar Portada'}</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />

          {/* Avatar circular superpuesto */}
          <div className="absolute -bottom-4 left-6 flex items-center gap-3">
            <div className="relative">
              <img
                src={profileImage}
                alt="Avatar de vehículo"
                className="w-18 h-18 rounded-full object-cover border-4 border-white shadow-xl"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-amber-500 hover:bg-amber-400 rounded-full text-slate-950 flex items-center justify-center shadow-md transition-colors cursor-pointer"
                title="Cambiar avatar de perfil"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                className="hidden"
              />
            </div>

            <div className="mb-4">
              <span className="bg-amber-400 text-slate-950 font-mono font-extrabold text-sm px-2.5 py-0.5 rounded shadow-xs">
                {formatPlateDisplay(currentVehicle?.plate || 'WEO-412')}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-10 p-6 sm:p-8 space-y-6">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Affiliation info (read-only verification) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Empresa Afiliada Habilitada
              </span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#1e3a5f]" />
                {currentVehicle?.affiliatedCompany || 'Transportes y Turismo Nacional S.A.S.'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Tarjeta de Operación Mintransporte
              </span>
              <span className="font-mono font-bold text-amber-700 flex items-center gap-1.5 mt-0.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                {currentVehicle?.operatingCardNumber || 'TO-2024-88491-BG'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Marca y Línea *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej. Chevrolet NPR / Hino / Master"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modelo / Año *
                </label>
                <input
                  type="number"
                  min="2000"
                  max={new Date().getFullYear() + 2}
                  required
                  value={modelYear}
                  onChange={(e) => setModelYear(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2023"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Vehículo *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as VehicleType)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white font-medium"
                >
                  <option value="Buseta">Buseta</option>
                  <option value="Microbús">Microbús</option>
                  <option value="Bus">Bus</option>
                  <option value="Van">Van</option>
                  <option value="Camioneta">Camioneta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capacidad de Pasajeros *
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    max="65"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="24"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Guardar Cambios del Perfil</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Edit Equipment Modal */}
      {isEditingEquipment && currentVehicle && (
        <EditEquipmentModal
          vehicle={currentVehicle}
          onClose={() => setIsEditingEquipment(false)}
        />
      )}
    </div>
  );
};
