import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Inbox,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';

interface DriverNotificationsTabProps {
  onViewServices?: () => void;
}

export const DriverNotificationsTab: React.FC<DriverNotificationsTabProps> = ({
  onViewServices,
}) => {
  const { currentSession, notifications, markNotificationsAsRead } = useApp();

  const myNotifications = notifications.filter(
    (n) => n.recipientId === currentSession?.userId
  );

  // Automatically mark as read when entering
  useEffect(() => {
    if (currentSession?.userId) {
      markNotificationsAsRead(currentSession.userId);
    }
  }, [currentSession?.userId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Notificaciones del Conductor</h2>
          <p className="text-xs text-slate-500">
            Avisos de empresas seguidas, respuestas a tus contraofertas y confirmaciones de viaje.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {myNotifications.length} notificaciones
        </span>
      </div>

      {myNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No tienes notificaciones</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Cuando las empresas que sigues publiquen nuevos viajes o respondan tus contraofertas, recibirás alertas aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifications.map((notif) => {
            const isAccepted = notif.type === 'accepted';
            const isRejected = notif.type === 'rejected';
            const isCompanyPost = notif.type === 'new_request_followed_company';
            const isModification = notif.type === 'modification_request';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isAccepted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCompanyPost
                        ? 'bg-blue-100 text-[#1e3a5f]'
                        : isModification
                        ? 'bg-amber-500 text-white shadow-xs'
                        : isRejected
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isAccepted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCompanyPost ? (
                      <Building2 className="w-5 h-5" />
                    ) : isModification ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : isRejected ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatRelativeTime(notif.date)}</span>
                      <span>•</span>
                      <span>{formatDateTime(notif.date)}</span>
                    </span>
                  </div>
                </div>

                {onViewServices && (
                  <button
                    type="button"
                    onClick={onViewServices}
                    className="shrink-0 text-xs font-bold text-[#1e3a5f] hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Ver servicio
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
