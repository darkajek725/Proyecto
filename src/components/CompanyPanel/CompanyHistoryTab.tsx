import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Car,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { formatCOP, formatDateDDMMYYYY } from '../../utils/formatters';
import { TransportRequest } from '../../types';

export const CompanyHistoryTab: React.FC = () => {
  const { currentSession, requests, openVehicleModal } = useApp();

  // Filter accepted services for this company
  const acceptedRequests = requests.filter(
    (r) =>
      (r.companyId === currentSession?.userId || r.companyNit === currentSession?.identifier) &&
      r.status === 'aceptada'
  );

  // Group by month and calculate metrics
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const stats = useMemo(() => {
    let servicesThisMonth = 0;
    let copThisMonth = 0;
    let passengersThisMonth = 0;
    let historicalCop = 0;

    acceptedRequests.forEach((req) => {
      const amount = req.acceptedBy?.agreedAmount || req.paymentAmount;
      historicalCop += amount;

      // Check month from serviceDate (YYYY-MM-DD)
      const serviceMonth = req.serviceDate.substring(0, 7);
      if (serviceMonth === currentMonthKey) {
        servicesThisMonth += 1;
        copThisMonth += amount;
        passengersThisMonth += req.passengerCount;
      }
    });

    return {
      servicesThisMonth,
      copThisMonth,
      passengersThisMonth,
      historicalCop,
    };
  }, [acceptedRequests, currentMonthKey]);

  // Group requests by month
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: TransportRequest[] } = {};

    acceptedRequests.forEach((req) => {
      const monthKey = req.serviceDate.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(req);
    });

    // Sort months descending
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => ({
      monthKey: key,
      label: formatMonthLabel(key),
      items: groups[key],
    }));
  }, [acceptedRequests]);

  function formatMonthLabel(key: string) {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    const monthName = date.toLocaleDateString('es-CO', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Historial y Métricas de Servicios</h2>
        <p className="text-xs text-slate-500">
          Consolidado mensual de transportes contratados, pasajeros movilizados y montos devengados.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Servicios este mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Servicios este Mes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1e3a5f] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.servicesThisMonth}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">viajes contratados</span>
          </div>
        </div>

        {/* Card 2: Valor a pagar este mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Valor Total Este Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-extrabold text-emerald-700">
              {formatCOP(stats.copThisMonth)}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">comprometido en el mes</span>
          </div>
        </div>

        {/* Card 3: Pasajeros este mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pasajeros Movilizados</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.passengersThisMonth}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">personas transportadas</span>
          </div>
        </div>

        {/* Card 4: Valor Total Histórico */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs bg-gradient-to-br from-slate-900 to-[#1e3a5f] text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Total Histórico</span>
            <div className="w-8 h-8 rounded-lg bg-white/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-extrabold text-white">
              {formatCOP(stats.historicalCop)}
            </span>
            <span className="text-xs text-slate-300 block mt-0.5">acumulado total contratado</span>
          </div>
        </div>
      </div>

      {/* List of Services Grouped by Month */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2">
          Detalle de Servicios Aceptados Agrupados por Mes
        </h3>

        {groupedByMonth.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Aún no hay servicios aceptados registrados en tu historial.
          </div>
        ) : (
          groupedByMonth.map((group) => {
            const monthTotal = group.items.reduce(
              (sum, item) => sum + (item.acceptedBy?.agreedAmount || item.paymentAmount),
              0
            );

            return (
              <div
                key={group.monthKey}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Month Group Header */}
                <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1e3a5f]" />
                    <span className="font-bold text-sm text-slate-900">{group.label}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({group.items.length} {group.items.length === 1 ? 'servicio' : 'servicios'})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 mr-2">Total mes:</span>
                    <span className="font-extrabold text-sm text-emerald-700">
                      {formatCOP(monthTotal)}
                    </span>
                  </div>
                </div>

                {/* Items in Month */}
                <div className="divide-y divide-slate-100">
                  {group.items.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {formatDateDDMMYYYY(req.serviceDate)} - {req.serviceTime}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {req.passengerCount} pasajeros
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {req.paymentTerm}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 flex items-center gap-2">
                          <span className="font-semibold text-emerald-700">
                            {req.pickupLocation}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-semibold text-rose-700">
                            {req.destinationLocation}
                          </span>
                        </div>

                        {req.acceptedBy && (
                          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 pt-1.5">
                            <button
                              type="button"
                              onClick={() => openVehicleModal(req.acceptedBy!.vehiclePlate, req.companyId)}
                              className="font-mono font-bold bg-[#1e3a5f] hover:bg-[#142842] text-white px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors"
                              title="Ver ficha técnica del vehículo"
                            >
                              {req.acceptedBy.vehiclePlate}
                            </button>
                            <span className="font-medium text-slate-800">{req.acceptedBy.driverName}</span>
                            <button
                              type="button"
                              onClick={() => openVehicleModal(req.acceptedBy!.vehiclePlate, req.companyId)}
                              className="text-slate-500 hover:text-[#1e3a5f] hover:underline cursor-pointer"
                            >
                              ({req.acceptedBy.vehicleType})
                            </button>
                            <span className="text-slate-300">|</span>

                            <a
                              href={`tel:${req.acceptedBy.driverPhone}`}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#1e3a5f] font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                              title="Llamar al conductor"
                            >
                              <Phone className="w-3 h-3 text-[#1e3a5f]" />
                              <span>{req.acceptedBy.driverPhone}</span>
                            </a>

                            <a
                              href={`https://wa.me/57${req.acceptedBy.driverPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hola ${req.acceptedBy.driverName}, le escribo de ${req.companyName} sobre el servicio ${req.pickupLocation} ➔ ${req.destinationLocation} (Placa ${req.acceptedBy.vehiclePlate}).`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="Escribir por WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 fill-white/20 text-white" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-400 block">Tarifa Acordada</span>
                        <span className="text-base font-extrabold text-[#1e3a5f]">
                          {formatCOP(req.acceptedBy?.agreedAmount || req.paymentAmount)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completado / En curso</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
