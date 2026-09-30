import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Heart,
  UserX,
  PlusCircle,
  FileText,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const FollowedCompaniesTab: React.FC = () => {
  const {
    currentSession,
    companies,
    toggleFollowCompany,
    isFollowingCompany,
    requests,
    openCompanyModal,
    getCompanyRating,
  } = useApp();

  // Filter companies that the driver is following
  const followed = companies.filter((c) => isFollowingCompany(c.id));
  const otherCompanies = companies.filter((c) => !isFollowingCompany(c.id));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Followed Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            Empresas de Transporte que Sigo
          </h2>
          <p className="text-xs text-slate-500">
            Recibirás alertas inmediatas cada vez que estas empresas publiquen una nueva solicitud de servicio.
          </p>
        </div>

        <span className="text-xs font-bold text-[#1e3a5f] bg-blue-50 border border-blue-200/80 px-3 py-1 rounded-full self-start sm:self-auto">
          {followed.length} empresas seguidas
        </span>
      </div>

      {followed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Aún no sigues a ninguna empresa</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explora el directorio de empresas abajo o en la pestaña "Servicios disponibles" y haz clic en el botón de corazón para seguirlas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followed.map((company) => {
            const activeRequestsCount = requests.filter(
              (r) => r.companyId === company.id && r.status === 'disponible'
            ).length;
            const rating = getCompanyRating(company.id);

            return (
              <div
                key={company.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Company Logo */}
                    <button
                      type="button"
                      onClick={() => openCompanyModal(company.id)}
                      className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-amber-400 transition-all cursor-pointer shrink-0"
                      title={`Ver perfil de ${company.name}`}
                    >
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1e3a5f] text-amber-400 flex items-center justify-center font-bold text-xs">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                    </button>

                    <div>
                      <button
                        type="button"
                        onClick={() => openCompanyModal(company.id)}
                        className="font-bold text-xs text-slate-900 leading-tight hover:text-[#1e3a5f] hover:underline text-left cursor-pointer"
                      >
                        {company.name}
                      </button>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono">NIT: {company.nit}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {company.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollowCompany(company.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Dejar de seguir a esta empresa"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Dejar de seguir</span>
                  </button>
                </div>

                {/* Rating & Action Row */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => openCompanyModal(company.id)}
                    className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-full text-slate-800 transition-colors cursor-pointer"
                    title="Ver calificaciones de conductores"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span className="font-extrabold">{rating.average}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({rating.count} {rating.count === 1 ? 'opinión' : 'opiniones'})
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1e3a5f] bg-blue-50 px-2.5 py-0.5 rounded-full text-[11px]">
                      {activeRequestsCount} viajes activos
                    </span>

                    <button
                      type="button"
                      onClick={() => openCompanyModal(company.id)}
                      className="px-2.5 py-1 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Ver Perfil</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Directory of other registered companies to explore */}
      {otherCompanies.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1e3a5f]" />
                Explorar Otras Empresas de Transporte Habilitadas
              </h3>
              <p className="text-xs text-slate-500">
                Síguelas para recibir notificaciones prioritarias de sus nuevas publicaciones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherCompanies.map((company) => {
              const activeCount = requests.filter(
                (r) => r.companyId === company.id && r.status === 'disponible'
              ).length;
              const rating = getCompanyRating(company.id);

              return (
                <div
                  key={company.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => openCompanyModal(company.id)}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-amber-400 shrink-0 cursor-pointer"
                    >
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1e3a5f] text-amber-400 flex items-center justify-center font-bold text-xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => openCompanyModal(company.id)}
                        className="font-bold text-xs text-slate-900 hover:text-[#1e3a5f] hover:underline text-left block truncate cursor-pointer"
                      >
                        {company.name}
                      </button>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {company.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => openCompanyModal(company.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-amber-600"
                    >
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{rating.average}</span>
                      <span className="text-slate-400 font-normal">({rating.count})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFollowCompany(company.id)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Heart className="w-3 h-3 text-slate-950" />
                      <span>Seguir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
