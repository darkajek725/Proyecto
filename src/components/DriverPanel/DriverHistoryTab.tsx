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
} from 'lucide-react';
import { formatCOP, formatDateDDMMYYYY } from '../../utils/formatters';
import { TransportRequest } from '../../types';

export const DriverHistoryTab: React.FC = () => {
  const { currentSession, requests } = useApp();

  const myAcceptedServices = useApp().requests.filter(
    (r) =>
      r.status === 'aceptada' &&
      r.acceptedBy &&
      (r.acceptedBy.driverId === currentSession?.userId ||
        r.acceptedBy.driverName === currentSession?.name)
  );

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const stats = useMemo(() => {
    let servicesThisMonth = 0;
    let copThisMonth = 0;
    let passengersThisMonth = 0;
    let historicalCop = 0;

    myAcceptedServices.forEach((req) => {
      const amount = req.acceptedBy?.agreedAmount || req.paymentAmount;
      historicalCop += amount;

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
  }, [myAcceptedServices, currentMonthKey]);

  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: TransportRequest[] } = {};

    myAcceptedServices.forEach((req) => {
      const monthKey = req.serviceDate.substring(0, 7);
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(req);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => ({
      monthKey: key,
      label: formatMonthLabel(key),
      items: groups[key],
    }));
  }, [myAcceptedServices]);

  function formatMonthLabel(key: string) {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    const monthName = date.toLocaleDateString('es-CO', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Historial y Ganancias del Conductor</h2>
        <p className="text-xs text-slate-500">
          Resumen de ingresos devengados, viajes completados y pasajeros transportados.
        </p>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Servicios este Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.servicesThisMonth}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">viajes realizados</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Valor Generado este Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-extrabold text-emerald-700">
              {formatCOP(stats.copThisMonth)}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">ingreso bruto mensual</span>
          </div>
        </div>

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
            <span className="text-xs text-slate-400 block mt-0.5">personas atendidas</span>
          </div>
        </div>

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
            <span className="text-xs text-slate-300 block mt-0.5">ingreso acumulado histórico</span>
          </div>
        </div>
      </div>

      {/* List grouped by month */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2">
          Detalle Agrupado por Mes
        </h3>

        {groupedByMonth.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Aún no tienes viajes registrados en tu historial de conductor.
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
                <div className="px-6 py-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1e3a5f]" />
                    <span className="font-bold text-sm text-slate-900">{group.label}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({group.items.length} {group.items.length === 1 ? 'viaje' : 'viajes'})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 mr-2">Total generado:</span>
                    <span className="font-extrabold text-sm text-emerald-700">
                      {formatCOP(monthTotal)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {group.items.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {formatDateDDMMYYYY(req.serviceDate)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-600 font-semibold">
                            {req.companyName}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500">
                            {req.passengerCount} pasajeros
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 flex items-center gap-2">
                          <span className="font-medium">{req.pickupLocation}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-bold text-[#1e3a5f]">
                            {req.destinationLocation}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">Tarifa Acordada</span>
                        <span className="text-base font-extrabold text-emerald-700">
                          {formatCOP(req.acceptedBy?.agreedAmount || req.paymentAmount)}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {req.paymentTerm}
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
