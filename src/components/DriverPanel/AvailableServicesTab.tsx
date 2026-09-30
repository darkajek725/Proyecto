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
  Heart,
  EyeOff,
  CheckCircle2,
  TrendingUp,
  X,
  Send,
  Building2,
  AlertCircle,
  Clock3,
  Car,
  Globe,
  Sparkles,
  ArrowRight,
  Star,
  GraduationCap,
  Building,
  Bus,
  UserCheck,
} from 'lucide-react';
import { formatCOP, formatDateDDMMYYYY } from '../../utils/formatters';

export const AvailableServicesTab: React.FC = () => {
  const {
    currentSession,
    requests,
    companies,
    acceptRequest,
    submitCounterOffer,
    ignoreRequest,
    toggleFollowCompany,
    isFollowingCompany,
    driverFeedFilter,
    setDriverFeedFilter,
    setDriverActiveTab,
    openCompanyModal,
    getCompanyRating,
  } = useApp();

  // Modal for counter-offer
  const [activeCounterOfferRequest, setActiveCounterOfferRequest] = useState<TransportRequest | null>(null);
  const [proposedAmount, setProposedAmount] = useState<number | ''>('');
  const [counterOfferNote, setCounterOfferNote] = useState('');
  const [offerError, setOfferError] = useState<string | null>(null);
  const [acceptedToast, setAcceptedToast] = useState<{ id: string; coordinatorPhone: string; coordinatorName: string } | null>(null);

  // All available requests (not ignored by driver)
  const allAvailableRequests = requests.filter(
    (r) =>
      r.status === 'disponible' &&
      (!currentSession || !r.ignoredByDriverIds.includes(currentSession.userId))
  );

  // Filtered requests from followed companies only
  const followedRequests = allAvailableRequests.filter((r) =>
    isFollowingCompany(r.companyId)
  );

  // Displayed requests based on active filter
  const displayedRequests =
    driverFeedFilter === 'seguidos' ? followedRequests : allAvailableRequests;

  const handleOpenCounterOffer = (req: TransportRequest) => {
    setActiveCounterOfferRequest(req);
    // Suggest 10-15% more or equal
    setProposedAmount(Math.round(req.paymentAmount * 1.1));
    setCounterOfferNote('Incluye peajes, seguro contractual y disponibilidad de vehículo en excelente estado.');
    setOfferError(null);
  };

  const handleSendCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCounterOfferRequest) return;
    if (!proposedAmount || Number(proposedAmount) <= 0) {
      setOfferError('Ingresa un valor propuesto válido.');
      return;
    }

    const res = submitCounterOffer(
      activeCounterOfferRequest.id,
      Number(proposedAmount),
      counterOfferNote
    );

    if (!res.success) {
      setOfferError(res.message || 'Error al enviar contraoferta');
      return;
    }

    setActiveCounterOfferRequest(null);
  };

  const handleAccept = (req: TransportRequest) => {
    const res = acceptRequest(req.id);
    if (res.success) {
      setAcceptedToast({
        id: req.id,
        coordinatorName: req.coordinatorName,
        coordinatorPhone: req.coordinatorPhone,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast when accepted */}
      {acceptedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">
                ¡Servicio Aceptado con Éxito!
              </h4>
              <p className="text-xs text-emerald-800">
                Comunícate de inmediato con el coordinador: <span className="font-bold">{acceptedToast.coordinatorName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`tel:${acceptedToast.coordinatorPhone}`}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              title="Llamar al coordinador"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Llamar: {acceptedToast.coordinatorPhone}</span>
            </a>
            <a
              href={`https://wa.me/57${acceptedToast.coordinatorPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hola ${acceptedToast.coordinatorName}, acabo de aceptar el servicio de transporte en la plataforma. Me comunico para coordinar detalles.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Abrir chat de WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white/20 text-white" />
              <span>Escribir a WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setAcceptedToast(null)}
              className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header bar and Filter Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">
                {driverFeedFilter === 'seguidos'
                  ? 'Inicio: Solicitudes de Empresas que Sigues'
                  : 'Todas las Solicitudes Disponibles'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {driverFeedFilter === 'seguidos'
                ? 'Feed prioritario con los viajes publicados exclusivamente por las empresas a las que estás suscrito.'
                : 'Catálogo global de servicios de transporte especial publicados por todas las empresas.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-blue-50 text-blue-900 font-bold text-xs rounded-xl border border-blue-200 shrink-0">
              {displayedRequests.length} {displayedRequests.length === 1 ? 'viaje disponible' : 'viajes disponibles'}
            </span>
          </div>
        </div>

        {/* Filter Pill Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filtrar por:
          </span>

          <button
            type="button"
            onClick={() => setDriverFeedFilter('seguidos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              driverFeedFilter === 'seguidos'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Car className={`w-4 h-4 ${driverFeedFilter === 'seguidos' ? 'text-amber-400' : 'text-[#1e3a5f]'}`} />
            <span>Empresas que Sigo (Inicio)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                driverFeedFilter === 'seguidos'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-300 text-slate-800'
              }`}
            >
              {followedRequests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDriverFeedFilter('todos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              driverFeedFilter === 'todos'
                ? 'bg-[#1e3a5f] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Globe className={`w-4 h-4 ${driverFeedFilter === 'todos' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Todas las Solicitudes</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                driverFeedFilter === 'todos'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-300 text-slate-800'
              }`}
            >
              {allAvailableRequests.length}
            </span>
          </button>

          {/* Quick link to follow companies */}
          <button
            type="button"
            onClick={() => setDriverActiveTab('siguiendo')}
            className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer py-1"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-100" />
            <span>Administrar empresas que sigo</span>
          </button>
        </div>
      </div>

      {displayedRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
            {driverFeedFilter === 'seguidos' ? (
              <Car className="w-7 h-7" />
            ) : (
              <Clock className="w-7 h-7" />
            )}
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800">
              {driverFeedFilter === 'seguidos'
                ? 'No hay solicitudes activas de tus empresas seguidas'
                : 'No hay solicitudes disponibles en este momento'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {driverFeedFilter === 'seguidos'
                ? 'Las empresas que sigues aún no han publicado nuevos viajes para este periodo, o puedes seguir más empresas para ampliar tus oportunidades.'
                : 'Las nuevas solicitudes publicadas por empresas aparecerán aquí de inmediato en tiempo real.'}
            </p>
          </div>

          {driverFeedFilter === 'seguidos' && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDriverFeedFilter('todos')}
                className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#152843] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Ver todas las solicitudes ({allAvailableRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDriverActiveTab('siguiendo')}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Seguir más empresas</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedRequests.map((req) => {
            const isFollowing = isFollowingCompany(req.companyId);
            const myExistingOffer = req.counterOffers.find(
              (co) => co.driverId === currentSession?.userId
            );

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header card with Company info & follow */}
                {(() => {
                  const compObj = companies.find((c) => c.id === req.companyId);
                  const rating = getCompanyRating(req.companyId);

                  return (
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Company Logo / Avatar */}
                        <button
                          type="button"
                          onClick={() => openCompanyModal(req.companyId)}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer shrink-0"
                          title={`Ver perfil y calificaciones de ${req.companyName}`}
                        >
                          {compObj?.logo ? (
                            <img
                              src={compObj.logo}
                              alt={req.companyName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1e3a5f] text-amber-400 flex items-center justify-center font-bold text-xs">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openCompanyModal(req.companyId)}
                              className="font-bold text-xs text-slate-900 leading-tight hover:text-[#1e3a5f] hover:underline text-left cursor-pointer"
                            >
                              {req.companyName}
                            </button>

                            {/* Rating badge */}
                            <button
                              type="button"
                              onClick={() => openCompanyModal(req.companyId)}
                              className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-800 transition-colors cursor-pointer"
                              title={`Calificación: ${rating.average} de 5 estrellas (${rating.count} opiniones)`}
                            >
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span>{rating.average}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({rating.count})
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleFollowCompany(req.companyId)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer ${
                                isFollowing
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                              title={isFollowing ? 'Dejar de seguir' : 'Seguir empresa para recibir alertas de nuevos viajes'}
                            >
                              <Heart
                                className={`w-3 h-3 ${
                                  isFollowing ? 'fill-rose-600 text-rose-600' : 'text-slate-500'
                                }`}
                              />
                              <span>{isFollowing ? 'Siguiendo' : 'Seguir empresa'}</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400">
                              NIT: {req.companyNit} • Publicado {formatDateDDMMYYYY(req.createdAt)}
                            </span>

                            {/* Service category badge */}
                            {req.serviceCategory === 'fija' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                                {req.serviceType === 'escolar' ? (
                                  <GraduationCap className="w-3 h-3 text-indigo-600" />
                                ) : (
                                  <Building className="w-3 h-3 text-indigo-600" />
                                )}
                                <span>Ruta Fija {req.serviceType === 'escolar' ? 'Escolar' : 'Empresarial'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700">
                                Ocasional
                              </span>
                            )}

                            {/* Coordinator tag */}
                            {req.createdByCoordinatorName && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#1e3a5f] border border-blue-100">
                                <UserCheck className="w-3 h-3 text-blue-600" />
                                <span>Coord: {req.createdByCoordinatorName}</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => openCompanyModal(req.companyId)}
                              className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                            >
                              Ver perfil & calificar
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Tarifa Ofrecida</span>
                        <span className="text-lg font-extrabold text-[#1e3a5f]">
                          {formatCOP(req.paymentAmount)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          {req.paymentTerm}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Route specs */}
                <div className="p-6 space-y-6">
                  {/* Fixed Route Banner for drivers */}
                  {req.serviceCategory === 'fija' && (
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
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
                              Estudiantes / Cupo:
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
                              Zona Origen / Recogida:
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
                    {/* Origin and destination */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                          A
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Lugar de Recogida
                          </div>
                          <div className="text-sm font-bold text-slate-900">{req.pickupLocation}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                          B
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Lugar de Destino
                          </div>
                          <div className="text-sm font-bold text-slate-900">{req.destinationLocation}</div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Fecha del Servicio:</span>
                        <span className="font-semibold text-slate-800">
                          {formatDateDDMMYYYY(req.serviceDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Hora de Recogida:</span>
                        <span className="font-semibold text-slate-800">{req.serviceTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pasajeros:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#1e3a5f]" />
                          {req.passengerCount} personas
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Fecha de Regreso:</span>
                        <span className="font-semibold text-slate-800">
                          {req.returnDate ? formatDateDDMMYYYY(req.returnDate) : 'Sólo ida'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* My active counteroffer notification if I sent one */}
                  {myExistingOffer && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-amber-900">
                          Enviaste una contraoferta por {formatCOP(myExistingOffer.proposedAmount)}
                        </span>
                        <span className="text-amber-700 text-[11px] block">
                          Estado:{' '}
                          <span className="font-semibold capitalize">{myExistingOffer.status}</span>
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                        Enviada
                      </span>
                    </div>
                  )}

                  {/* Action Buttons as required:
                      - Aceptar servicio (revela el contacto del coordinador de la empresa)
                      - Ofrecer otro valor (contraoferta)
                      - No me interesa (rechaza y notifica a la empresa sin cambiar para otros)
                  */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => ignoreRequest(req.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Descartar este servicio para mi perfil"
                    >
                      <EyeOff className="w-4 h-4" />
                      <span>No me interesa</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenCounterOffer(req)}
                        className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <span>Ofrecer otro valor (Contraoferta)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAccept(req)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aceptar Servicio</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL PARA CONTRAOFERTA */}
      {activeCounterOfferRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#1e3a5f] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Enviar Contraoferta</h3>
                <p className="text-xs text-amber-300">
                  Propón un valor distinto a {activeCounterOfferRequest.companyName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCounterOfferRequest(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {offerError && (
              <div className="m-6 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{offerError}</span>
              </div>
            )}

            <form onSubmit={handleSendCounterOffer} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold text-slate-700">Ruta:</span>{' '}
                  {activeCounterOfferRequest.pickupLocation} ➔ {activeCounterOfferRequest.destinationLocation}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Tarifa original ofrecida:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {formatCOP(activeCounterOfferRequest.paymentAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tu Valor Propuesto (COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="2150000"
                    className="w-full pl-7 pr-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                {proposedAmount && (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    {formatCOP(Number(proposedAmount))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota / Justificación para la Empresa
                </label>
                <textarea
                  rows={3}
                  value={counterOfferNote}
                  onChange={(e) => setCounterOfferNote(e.target.value)}
                  placeholder="Ej. Incluye peajes, seguro contractual y conductor con amplia experiencia..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCounterOfferRequest(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Contraoferta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
