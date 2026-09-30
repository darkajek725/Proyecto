import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleType } from '../../types';
import {
  Car,
  Upload,
  Image as ImageIcon,
  Building2,
  FileCheck2,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
} from 'lucide-react';
import { readFileAsDataUrl, cleanPlate } from '../../utils/formatters';

interface RegisterVehicleTabProps {
  onSuccess?: () => void;
}

export const RegisterVehicleTab: React.FC<RegisterVehicleTabProps> = ({ onSuccess }) => {
  const { registerVehicle } = useApp();

  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [modelYear, setModelYear] = useState<number | ''>(2023);
  const [type, setType] = useState<VehicleType>('Buseta');
  const [capacity, setCapacity] = useState<number | ''>(24);
  const [affiliatedCompany, setAffiliatedCompany] = useState('');
  const [operatingCardNumber, setOperatingCardNumber] = useState('');

  // Photos
  const [coverImage, setCoverImage] = useState<string>(
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80'
  );
  const [profileImage, setProfileImage] = useState<string>(
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=300&q=80'
  );

  const [coverLoading, setCoverLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverLoading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCoverImage(dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la imagen de portada.');
    } finally {
      setCoverLoading(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileLoading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfileImage(dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la imagen de perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = cleanPlate(plate);
    if (!clean || clean.length < 5) {
      setErrorMsg('Ingresa una placa válida de servicio público (ej. WEO-412 o TGL-789).');
      return;
    }
    if (!brand.trim()) {
      setErrorMsg('Ingresa la marca y línea del vehículo.');
      return;
    }
    if (!affiliatedCompany.trim()) {
      setErrorMsg('La empresa de transporte afiliada es obligatoria según la ley colombiana.');
      return;
    }
    if (!operatingCardNumber.trim()) {
      setErrorMsg('El número de Tarjeta de Operación del Ministerio de Transporte es obligatorio.');
      return;
    }
    if (!capacity || capacity <= 0) {
      setErrorMsg('Ingresa la capacidad homologada de pasajeros.');
      return;
    }

    const res = registerVehicle({
      plate: clean,
      brand: brand.trim(),
      modelYear: Number(modelYear) || new Date().getFullYear(),
      type,
      capacity: Number(capacity),
      affiliatedCompany: affiliatedCompany.trim(),
      operatingCardNumber: operatingCardNumber.trim(),
      coverImage,
      profileImage,
    });

    if (!res.success) {
      setErrorMsg(res.message || 'Error al registrar vehículo.');
      return;
    }

    setSuccessMsg(`¡Vehículo con placa ${clean} registrado exitosamente!`);
    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1200);
  };

  // Preset helper for quick testing
  const loadPreset = (
    presetPlate: string,
    presetBrand: string,
    presetYear: number,
    presetType: VehicleType,
    presetCap: number,
    presetAffil: string,
    presetTO: string,
    coverUrl: string,
    profileUrl: string
  ) => {
    setPlate(presetPlate);
    setBrand(presetBrand);
    setModelYear(presetYear);
    setType(presetType);
    setCapacity(presetCap);
    setAffiliatedCompany(presetAffil);
    setOperatingCardNumber(presetTO);
    setCoverImage(coverUrl);
    setProfileImage(profileUrl);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quick Fill Bar for instant testing */}
      <div className="mb-6 bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Autocompletar Ejemplo Rápido:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              loadPreset(
                'WEO-520',
                'Chevrolet NPR Navitrans Buseta',
                2023,
                'Buseta',
                28,
                'Transportes y Turismo Nacional S.A.S.',
                'TO-2024-99881-BG',
                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=300&q=80'
              )
            }
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-md border border-amber-200 font-medium transition-colors"
          >
            Buseta NPR (28 pax)
          </button>
          <button
            type="button"
            onClick={() =>
              loadPreset(
                'TGL-340',
                'Mercedes-Benz Sprinter 516 VIP',
                2024,
                'Van',
                16,
                'Expreso Andino de Turismo S.A.S.',
                'TO-2024-44120-MD',
                'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80'
              )
            }
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-md border border-amber-200 font-medium transition-colors"
          >
            Van Sprinter VIP (16 pax)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#1e3a5f] text-white">
          <h2 className="text-xl font-bold">Registrar Nuevo Vehículo Especial</h2>
          <p className="text-xs text-amber-300 mt-0.5">
            Ingresa fotos reales desde tu dispositivo y los datos de habilitación de transporte especial.
          </p>
        </div>

        {errorMsg && (
          <div className="m-6 mb-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-6 mb-0 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* FOTOS: Banner + Avatar Circular */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Fotografías del Vehículo (Subidas desde tu dispositivo)
            </label>

            {/* Banner preview with overlapping avatar */}
            <div className="relative h-48 w-full bg-slate-800 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={coverImage}
                alt="Portada del vehículo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30" />

              {/* Botón para cambiar portada */}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>{coverLoading ? 'Cargando...' : 'Cambiar Foto de Portada'}</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {/* Avatar circular superpuesto */}
              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Foto de perfil del vehículo"
                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 hover:bg-amber-400 rounded-full text-slate-950 flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    title="Cambiar foto de perfil circular"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileUpload}
                    className="hidden"
                  />
                </div>

                <div className="text-white text-xs text-shadow-sm">
                  <span className="font-bold block">Foto de perfil / Avatar</span>
                  <span className="text-[11px] text-slate-200">
                    Se mostrará en miniatura en las ofertas
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Formatos soportados: JPG, PNG, WEBP desde tu celular o computadora.
            </p>
          </div>

          {/* DATOS TÉCNICOS */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Datos Técnicos del Vehículo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Placa del Vehículo *
                </label>
                <input
                  type="text"
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="Ej. WEO-412"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none uppercase"
                />
              </div>

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
                    placeholder="28"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
              </div>
            </div>

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
                  placeholder="Ej. Chevrolet NPR / Hino Dutro / Mercedes Sprinter"
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
          </div>

          {/* DATOS DE HABILITACIÓN COLOMBIA (OBLIGATORIOS) */}
          <div className="space-y-4 pt-4 border-t border-slate-100 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#1e3a5f]" />
                <span>Habilitación Transporte Especial (Norma Mintransporte)</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                En Colombia el transporte especial solo puede prestarse con vehículos legalmente vinculados a una empresa habilitada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Empresa de Transporte a la que está Afiliado *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={affiliatedCompany}
                    onChange={(e) => setAffiliatedCompany(e.target.value)}
                    placeholder="Ej. Transportes y Turismo Nacional S.A.S."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Tarjeta de Operación *
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={operatingCardNumber}
                    onChange={(e) => setOperatingCardNumber(e.target.value)}
                    placeholder="Ej. TO-2024-88491-BG"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Guardar y Registrar Vehículo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
