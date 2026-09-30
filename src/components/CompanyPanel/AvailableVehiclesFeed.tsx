import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleType } from '../../types';
import {
  Car,
  Bus,
  Users,
  Building2,
  FileCheck2,
  Phone,
  MessageCircle,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  User,
  FileText,
} from 'lucide-react';
import { formatPlateDisplay } from '../../utils/formatters';
import { VerificationCheckBadge } from '../VerificationCheckBadge';
import { validateVehicleDocuments } from '../../utils/documentValidation';

export const AvailableVehiclesFeed: React.FC = () => {
  const { vehicles, owners, openVehicleModal } = useApp();
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Filter only vehicles marked as available
  const availableVehicles = vehicles.filter((v) => v.isAvailable);

  const filtered = availableVehicles.filter((v) => {
    if (selectedType !== 'todos' && v.type !== selectedType) return false;
    if (onlyVerified) {
      const vStatus = validateVehicleDocuments(v);
      if (!vStatus.isValid) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        v.plate.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.affiliatedCompany.toLowerCase().includes(q) ||
        v.operatingCardNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Helper to find owner contact
  const getOwner = (ownerId: string) => {
    return owners.find((o) => o.id === ownerId);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">
                Feed de Vehículos Disponibles en Tiempo Real
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Vehículos de servicio especial marcados actualmente como listos y disponibles por sus propietarios.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 shrink-0 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{availableVehicles.length} vehículos disponibles</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, modelo, empresa afiliada o tarjeta de operación..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white"
            >
              <option value="todos">Todos los tipos</option>
              <option value="Buseta">Busetas</option>
              <option value="Bus">Buses grandes</option>
              <option value="Microbús">Microbuses</option>
              <option value="Van">Vans</option>
              <option value="Camioneta">Camionetas</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`w-full py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                onlyVerified
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${onlyVerified ? 'text-white' : 'text-emerald-600'}`} />
              <span>Solo Verificados</span>
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Car className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron vehículos disponibles
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba cambiando los filtros o esperando a que los propietarios marquen sus unidades como disponibles.
          </p>
        </div>
      ) : (
        /* Vehicle Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vehicle) => {
            const owner = getOwner(vehicle.ownerId);

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image with Circular Profile Avatar overlay */}
                  <div
                    onClick={() => openVehicleModal(vehicle.id)}
                    className="relative h-44 w-full bg-slate-800 overflow-hidden cursor-pointer"
                    title="Clic para ver perfil completo y documentación"
                  >
                    <img
                      src={vehicle.coverImage}
                      alt={`Vehículo ${vehicle.plate}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    {/* Top badging */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span>Disponible</span>
                      </span>

                      <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        {vehicle.type}
                      </span>
                    </div>

                    {/* Circular Profile Avatar overlapping at bottom-left */}
                    <div className="absolute -bottom-4 left-4 z-10">
                      <img
                        src={vehicle.profileImage}
                        alt="Miniatura vehículo"
                        className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md hover:ring-2 hover:ring-amber-400 transition-all"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Plate at bottom-right */}
                    <div className="absolute bottom-2.5 right-3 text-right">
                      <div className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded font-mono font-extrabold text-sm shadow-sm tracking-wider inline-block transition-colors">
                        {formatPlateDisplay(vehicle.plate)}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Body Info */}
                  <div className="pt-6 px-5 pb-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => openVehicleModal(vehicle.id)}
                          className="text-left font-bold text-slate-900 text-base leading-tight hover:text-[#1e3a5f] hover:underline cursor-pointer flex items-center gap-1.5 group/title"
                        >
                          <span>{vehicle.brand}</span>
                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-[#1e3a5f] transition-colors" />
                        </button>
                        <VerificationCheckBadge vehicle={vehicle} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Modelo {vehicle.modelYear}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-[#1e3a5f]" />
                          {vehicle.capacity} pasajeros
                        </span>
                      </div>
                    </div>

                    {/* Regulatory mandatory fields: Empresa afiliada & Tarjeta de Operación */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-[#1e3a5f] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Empresa Afiliada
                          </span>
                          <span className="font-semibold text-slate-900 leading-tight">
                            {vehicle.affiliatedCompany}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5 text-slate-700">
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Tarjeta de Operación Mintransporte
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-800">
                            {vehicle.operatingCardNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Button to Open Profile & Technical Sheet */}
                    <button
                      type="button"
                      onClick={() => openVehicleModal(vehicle.id)}
                      className="w-full py-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#1e3a5f] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200/60"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Ficha Técnica y Documentos</span>
                    </button>
                  </div>
                </div>

                {/* Footer with Owner Contact */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-slate-900 leading-tight">
                        {owner ? owner.name : 'Propietario particular'}
                      </div>
                      <div className="text-[10px] text-slate-500">Propietario registrado</div>
                    </div>
                  </div>

                  {owner?.phone && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${owner.phone}`}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                        title={`Llamar al propietario (${owner.phone})`}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1e3a5f]" />
                        <span>Llamar</span>
                      </a>

                      <a
                        href={`https://wa.me/57${owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${owner.name}, vi su vehículo ${vehicle.type} ${vehicle.brand} (Placa ${vehicle.plate}) disponible en el Tablero de Transporte Especial y me gustaría consultar disponibilidad y cotizar un servicio.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Contactar por WhatsApp directamente al chat"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white/20 text-white" />
                        <span>Contactar por WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
