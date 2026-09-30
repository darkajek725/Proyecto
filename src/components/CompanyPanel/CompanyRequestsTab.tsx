import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TransportRequest } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CreditCard,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  Car,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  RotateCcw,
  FileText,
  GraduationCap,
  Building,
  Bus,
} from 'lucide-react';
import { formatCOP, formatDateDDMMYYYY, formatDateTime } from '../../utils/formatters';
import { EditRequestModal } from './EditRequestModal';
import { VerificationCheckBadge } from '../VerificationCheckBadge';

export const CompanyRequestsTab: React.FC = () => {
  const {
    currentSession,
    requests,
    respondCounterOffer,
    updateRequest,
    deleteRequest,
    cancelRequestModification,
    openVehicleModal,
    vehicles,
    drivers,
  } = useApp();
  const [filter, setFilter] = useState<'todas' | 'disponible' | 'aceptada'>('todas');
  const [editingRequest, setEditingRequest] = useState<TransportRequest | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter requests belonging to this company or coordinator's company
  const myRequests = requests.filter((r) => {
    if (currentSession?.role === 'coordinador') {
      return (
        r.companyId === currentSession?.companyId ||
        r.createdByCoordinatorId === currentSession?.userId ||
        r.companyNit === currentSession?.companyNit
      );
    }
    return r.companyId === currentSession?.userId || r.companyNit === currentSession?.identifier;
  });

  const filtered = myRequests.filter((r) => {
    if (filter === 'todas') return true;
    return r.status === filter;
  });

  const handleDelete = (reqId: string, routeName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas cancelar y retirar la solicitud "${routeName}" del tablero público?`)) {
      const res = deleteRequest(reqId);
      if (res.success) {
        setActionNotice('Solicitud retirada exitosamente del tablero.');
        setTimeout(() => setActionNotice(null), 3500);
      }
    }
  };

  const handleCancelProposal = (reqId: string) => {
    if (window.confirm('¿Deseas retirar la propuesta de modificación enviada al conductor? Las condiciones originales se mantendrán.')) {
      const res = cancelRequestModification(reqId);
      if (res.success) {
        setActionNotice('Propuesta de modificación retirada exitosamente.');
        setTimeout(() => setActionNotice(null), 3500);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mis Solicitudes de Transporte</h2>
          <p className="text-xs text-slate-500">
            Control de viajes publicados por tu empresa, revisión de contraofertas y vehículos asignados.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('todas')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'todas'
                ? 'bg-white text-[#1e3a5f] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({myRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('disponible')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'disponible'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disponibles ({myRequests.filter((r) => r.status === 'disponible').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('aceptada')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filter === 'aceptada'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aceptadas ({myRequests.filter((r) => r.status === 'aceptada').length})
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            No tienes solicitudes en esta categoría
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Ve a la pestaña "Publicar solicitud" para anunciar una nueva necesidad de transporte especial para tu empresa.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((req) => {
            const isAccepted = req.status === 'aceptada';
            const pendingOffers = req.counterOffers.filter((c) => c.status === 'pendiente');

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Request Top Bar */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isAccepted
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAccepted ? 'bg-blue-600' : 'bg-emerald-500'
                        }`}
                      ></span>
                      <span>{isAccepted ? 'SERVICIO ACEPTADO' : 'DISPONIBLE EN TABLERO'}</span>
                    </span>

                    {/* Service Category Badge */}
                    {req.serviceCategory === 'fija' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {req.serviceType === 'escolar' ? (
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <Building className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                        <span>
                          Ruta Fija {req.serviceType === 'escolar' ? 'Escolar' : 'Empresarial'}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                        <span>Servicio Ocasional</span>
                      </span>
                    )}

                    {/* Coordinator attribution */}
                    {req.createdByCoordinatorName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1e3a5f] border border-blue-100">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        <span>Coord: {req.createdByCoordinatorName}</span>
                      </span>
                    )}

                    {req.pendingModification && req.pendingModification.status === 'pendiente' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Modificación pendiente de aprobación mutua</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Publicado: {formatDateDDMMYYYY(req.createdAt)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 block">Tarifa Ofrecida</span>
                      <span className="text-base font-extrabold text-[#1e3a5f]">
                        {formatCOP(req.paymentAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditingRequest(req)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#1e3a5f] border border-slate-300 hover:border-slate-400 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Editar solicitud de servicio"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>Editar</span>
                      </button>

                      {!isAccepted && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              req.id,
                              `${req.pickupLocation} ➔ ${req.destinationLocation}`
                            )
                          }
                          className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-300 hover:border-rose-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          title="Cancelar y retirar solicitud del tablero"
                          aria-label="Cancelar solicitud"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Route & details */}
                <div className="p-6">
                  {/* Fixed Route Banner with School / Corporate Info & Days */}
                  {req.serviceCategory === 'fija' && (
                    <div className="mb-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-indigo-700" />
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                            Condiciones de Ruta Fija {req.serviceType === 'escolar' ? 'Escolar' : 'Empresarial'}
                          </span>
                        </div>
                        {req.routeDays && req.routeDays.length > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold text-indigo-900 mr-1">Días:</span>
                            {req.routeDays.map((day) => (
                              <span
                                key={day}
                                className="px-2 py-0.5 bg-white text-indigo-900 border border-indigo-200 text-[10px] font-bold rounded-md"
                              >
                                {day.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Escolar info */}
                      {req.serviceType === 'escolar' && req.schoolInfo && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-indigo-100">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Colegio Destino:
                            </span>
                            <span className="font-bold text-slate-800">{req.schoolInfo.schoolName}</span>
                            <p className="text-[11px] text-slate-500 truncate">{req.schoolInfo.schoolAddress}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Estudiantes / Capacidad:
                            </span>
                            <span className="font-bold text-slate-800">
                              {req.schoolInfo.studentCount || req.passengerCount} estudiantes
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Modalidad de Pago:
                            </span>
                            <span className="font-bold text-indigo-700">
                              {req.schoolInfo.paymentModality === 'por_estudiante'
                                ? 'Cobro por Estudiante'
                                : 'Cupo Completo Vehículo'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Zona de Origen / Horarios:
                            </span>
                            <span className="font-semibold text-slate-700">
                              {req.schoolInfo.routeStartZone || req.pickupLocation}
                            </span>
                            {req.schoolInfo.morningPickupTime && (
                              <p className="text-[10px] text-slate-500">
                                Recogida: {req.schoolInfo.morningPickupTime}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Corporate info */}
                      {req.serviceType === 'empresarial' && req.corporateInfo && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-lg border border-indigo-100">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Empresa / Planta:
                            </span>
                            <span className="font-bold text-slate-800">{req.corporateInfo.companyName}</span>
                            <p className="text-[11px] text-slate-500 truncate">{req.corporateInfo.companyAddress}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Colaboradores:
                            </span>
                            <span className="font-bold text-slate-800">
                              {req.corporateInfo.employeeCount || req.passengerCount} trabajadores
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Modalidad de Pago:
                            </span>
                            <span className="font-bold text-indigo-700">
                              {req.corporateInfo.paymentModality === 'por_pasajero'
                                ? 'Cobro por Trabajador'
                                : 'Cupo Completo Vehículo'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                              Turno / Programación:
                            </span>
                            <span className="font-semibold text-slate-700">
                              {req.corporateInfo.shiftSchedule || 'Turno ordinario'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    {/* Origin & Dest */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                          A
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase">
                            Origen / Recogida
                          </div>
                          <div className="text-sm font-bold text-slate-800">{req.pickupLocation}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                          B
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase">
                            Destino Final
                          </div>
                          <div className="text-sm font-bold text-slate-800">
                            {req.destinationLocation}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata specs */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Fecha y Hora:</span>
                        <span className="font-semibold text-slate-800">
                          {formatDateDDMMYYYY(req.serviceDate)} - {req.serviceTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Pasajeros:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          {req.passengerCount} personas
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Plazo de Pago:</span>
                        <span className="font-semibold text-slate-800">{req.paymentTerm}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Fecha Regreso:</span>
                        <span className="font-semibold text-slate-800">
                          {req.returnDate ? formatDateDDMMYYYY(req.returnDate) : 'Sólo ida'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CASE 1: SI YA FUE ACEPTADA */}
                  {isAccepted && req.acceptedBy && (() => {
                    const matchedVehicle = vehicles.find(
                      (v) => v.plate.toUpperCase() === req.acceptedBy?.vehiclePlate.toUpperCase()
                    );
                    const matchedDriver = drivers.find(
                      (d) => d.name.toLowerCase() === req.acceptedBy?.driverName.toLowerCase()
                    );

                    return (
                      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          <span>Servicio Aceptado y Vehículo Confirmado</span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {req.acceptedBy.vehiclePhoto ? (
                              <img
                                src={req.acceptedBy.vehiclePhoto}
                                alt="Vehículo asignado"
                                onClick={() => openVehicleModal(req.acceptedBy!.vehiclePlate, req.companyId)}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-[#1e3a5f] transition-all"
                                title="Clic para ver ficha técnica y documentación"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div
                                onClick={() => openVehicleModal(req.acceptedBy!.vehiclePlate, req.companyId)}
                                className="w-16 h-16 rounded-xl bg-blue-200 flex items-center justify-center text-blue-700 cursor-pointer"
                                title="Clic para ver ficha técnica"
                              >
                                <Car className="w-8 h-8" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => openVehicleModal(req.acceptedBy!.vehiclePlate, req.companyId)}
                                  className="text-xs font-mono font-bold bg-[#1e3a5f] hover:bg-[#142842] text-white px-2 py-0.5 rounded-md cursor-pointer transition-colors shadow-2xs"
                                  title="Ver ficha técnica de este vehículo"
                                >
                                  {req.acceptedBy.vehiclePlate}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openVehicleModal(req.acceptedBy!.vehiclePlate, req.companyId)}
                                  className="text-xs font-bold text-slate-800 hover:text-[#1e3a5f] hover:underline cursor-pointer"
                                >
                                  {req.acceptedBy.vehicleType} {req.acceptedBy.vehicleBrand}
                                </button>
                                <VerificationCheckBadge vehicle={matchedVehicle} size="sm" />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                                <span>
                                  Conductor:{' '}
                                  <span className="font-semibold text-slate-900">
                                    {req.acceptedBy.driverName}
                                  </span>
                                </span>
                                <VerificationCheckBadge driver={matchedDriver} size="sm" />
                              </div>

                              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                                <button
                                  type="button"
                                  onClick={() => openVehicleModal(req.acceptedBy!.vehiclePlate, req.companyId)}
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#1e3a5f] border border-blue-200 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Ver ficha técnica completa del vehículo y descargarla con logo"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Ver Ficha Técnica</span>
                                </button>

                                <a
                                  href={`tel:${req.acceptedBy.driverPhone}`}
                                  className="px-3 py-1.5 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
                                  title="Llamar al conductor"
                                >
                                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Llamar: {req.acceptedBy.driverPhone}</span>
                                </a>

                                <a
                                  href={`https://wa.me/57${req.acceptedBy.driverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Hola ${req.acceptedBy.driverName}, le escribo de la empresa ${req.companyName} respecto al servicio aceptado ${req.pickupLocation} ➔ ${req.destinationLocation} para el ${formatDateDDMMYYYY(req.serviceDate)} (Placa: ${req.acceptedBy.vehiclePlate}). Me comunico para coordinar los detalles del viaje y planilla FUEC.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Escribir al WhatsApp del conductor"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-white/20 text-white" />
                                  <span>Escribir a WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-blue-100 text-right shrink-0">
                            <span className="text-[11px] text-slate-500 block">Valor Acordado</span>
                            <span className="text-base font-extrabold text-emerald-600">
                              {formatCOP(req.acceptedBy.agreedAmount)}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Aceptado: {formatDateDDMMYYYY(req.acceptedBy.acceptedAt)}
                            </span>
                          </div>
                        </div>

                        {/* --- REPORTE DE ESTADO DEL SERVICIO POR EL CONDUCTOR --- */}
                        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                            <div className="flex items-center gap-2">
                              {req.trackingState?.isActive ? (
                                <>
                                  <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                  </span>
                                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                                    Servicio en Curso / Reporte Activo
                                  </span>
                                </>
                              ) : req.trackingState?.currentStatus === 'finalizado el servicio' ? (
                                <>
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                                    Servicio Completado
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                    Esperando Inicio del Servicio
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Detail of tracking state */}
                          {!req.trackingState && (
                            <div className="text-xs text-slate-500 flex items-center gap-2 py-1">
                              <span className="text-base">🕒</span>
                              <span>El conductor aún no ha iniciado el servicio. En cuanto comience, verás su progreso y bitácora de estados aquí en tiempo real.</span>
                            </div>
                          )}

                          {req.trackingState && (
                            <div className="space-y-3">
                              {/* Actual Status and Progress Bar */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fase actual del viaje:</span>
                                  <span className="font-extrabold text-[#1e3a5f] uppercase tracking-wide">
                                    {req.trackingState.currentStatus || 'En camino a recoger'}
                                  </span>
                                </div>
                                <div className="bg-white p-2.5 rounded-lg border border-slate-150">
                                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Última actualización de estado:</span>
                                  <span className="font-semibold text-slate-700">
                                    {req.trackingState.statusHistory && req.trackingState.statusHistory.length > 0 ? (
                                      new Date(req.trackingState.statusHistory[req.trackingState.statusHistory.length - 1].timestamp).toLocaleTimeString()
                                    ) : 'No iniciada'}
                                  </span>
                                </div>
                              </div>

                              {/* Progress Timeline list of status updates */}
                              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                                <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-2">Bitácora de Cumplimiento (Historial de Estados):</span>
                                <div className="space-y-1.5">
                                  {req.trackingState.statusHistory && req.trackingState.statusHistory.length > 0 ? (
                                    req.trackingState.statusHistory.map((sh, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 border-b border-dashed border-slate-100 pb-1">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                          <span className="capitalize font-semibold">{sh.status}</span>
                                        </span>
                                        <span className="text-slate-400 font-mono">
                                          {new Date(sh.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px] block">Esperando reporte de eventos de ruta por parte del conductor...</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Banner de Propuesta de Modificación Pendiente de Aprobación Mutua */}
                        {req.pendingModification && req.pendingModification.status === 'pendiente' && (
                          <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <h5 className="text-xs font-bold text-amber-950">
                                    Propuesta de Modificación Enviada al Conductor
                                  </h5>
                                  <p className="text-[11px] text-amber-800 mt-0.5">
                                    El servicio se encuentra actualmente bajo los términos originales. Las nuevas condiciones no entrarán en vigencia hasta que el conductor{' '}
                                    <span className="font-semibold">{req.acceptedBy.driverName}</span> las apruebe desde su panel.
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCancelProposal(req.id)}
                                className="self-start sm:self-auto px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 hover:border-slate-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                                title="Retirar propuesta y conservar términos vigentes"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                                <span>Retirar propuesta</span>
                              </button>
                            </div>

                            {req.pendingModification.reason && (
                              <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs text-amber-900">
                                <span className="font-semibold text-[10px] uppercase text-amber-700 block mb-0.5">
                                  Motivo enviado al conductor:
                                </span>
                                <p className="italic">"{req.pendingModification.reason}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* CASE 2: SI SIGUE DISPONIBLE (MUESTRA CONTRAOFERTAS RECIBIDAS) */}
                  {!isAccepted && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Contraofertas Recibidas ({req.counterOffers.length})
                          </h4>
                          {pendingOffers.length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {pendingOffers.length} pendiente(s)
                            </span>
                          )}
                        </div>
                      </div>

                      {req.counterOffers.length === 0 ? (
                        <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500 border border-slate-100">
                          Aún no has recibido contraofertas para este servicio. Sigue disponible para todos los conductores en el tablero público.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {req.counterOffers.map((offer) => {
                            const isPending = offer.status === 'pendiente';
                            const offerVehicle = vehicles.find(
                              (v) => v.plate.toUpperCase() === offer.vehiclePlate.toUpperCase()
                            );
                            const offerDriver = drivers.find(
                              (d) => d.name.toLowerCase() === offer.driverName.toLowerCase()
                            );

                            return (
                              <div
                                key={offer.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  isPending
                                    ? 'bg-amber-50/50 border-amber-200'
                                    : offer.status === 'aceptada'
                                    ? 'bg-emerald-50/60 border-emerald-200'
                                    : 'bg-slate-50 border-slate-200 opacity-60'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    {offer.vehiclePhoto ? (
                                      <img
                                        src={offer.vehiclePhoto}
                                        alt="Vehículo"
                                        onClick={() => openVehicleModal(offer.vehiclePlate, req.companyId)}
                                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
                                        title="Clic para ver ficha técnica del vehículo"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div
                                        onClick={() => openVehicleModal(offer.vehiclePlate, req.companyId)}
                                        className="w-12 h-12 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 cursor-pointer"
                                      >
                                        <Car className="w-6 h-6" />
                                      </div>
                                    )}

                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-xs text-slate-900">
                                          {offer.driverName}
                                        </span>
                                        <VerificationCheckBadge driver={offerDriver} size="sm" />
                                        <button
                                          type="button"
                                          onClick={() => openVehicleModal(offer.vehiclePlate, req.companyId)}
                                          className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-[#1e3a5f] hover:text-white text-slate-800 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                          title="Ver ficha técnica"
                                        >
                                          {offer.vehiclePlate}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => openVehicleModal(offer.vehiclePlate, req.companyId)}
                                          className="text-[11px] text-slate-600 hover:text-[#1e3a5f] hover:underline cursor-pointer"
                                        >
                                          ({offer.vehicleType} - {offer.vehicleModel})
                                        </button>
                                        <VerificationCheckBadge vehicle={offerVehicle} size="sm" />
                                      </div>

                                      {offer.note && (
                                        <p className="text-xs text-slate-600 mt-1 italic bg-white/70 p-1.5 rounded border border-slate-200/60">
                                          "{offer.note}"
                                        </p>
                                      )}

                                      <span className="text-[10px] text-slate-400 block mt-1">
                                        Enviada el {formatDateTime(offer.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                                    <div className="text-right">
                                      <span className="text-[10px] text-slate-500 block">
                                        Valor Propuesto
                                      </span>
                                      <span className="text-base font-extrabold text-[#1e3a5f]">
                                        {formatCOP(offer.proposedAmount)}
                                      </span>
                                    </div>

                                    {/* Action buttons if pending */}
                                    {isPending ? (
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            respondCounterOffer(req.id, offer.id, 'aceptar');
                                            setActionNotice(
                                              `¡Contraoferta de ${offer.driverName} aceptada! Ahora puedes llamarlo o escribirle directamente a su WhatsApp.`
                                            );
                                            setTimeout(() => setActionNotice(null), 5000);
                                          }}
                                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Aceptar</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            respondCounterOffer(req.id, offer.id, 'rechazar')
                                          }
                                          className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                          <span>Rechazar</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <span
                                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                          offer.status === 'aceptada'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-slate-200 text-slate-600'
                                        }`}
                                      >
                                        {offer.status === 'aceptada' ? 'Aceptada' : 'Rechazada'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de edición */}
      <EditRequestModal
        request={editingRequest}
        isOpen={Boolean(editingRequest)}
        onClose={() => setEditingRequest(null)}
        onSave={updateRequest}
      />
    </div>
  );
};
