import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { TransPortalLogo } from './TransPortalLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="mb-3">
              <TransPortalLogo size="sm" lightBackground={false} />
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Tablero público de contratación ágil para empresas y prestadores de servicio de transporte especial en Colombia (buses, busetas, vans y camionetas).
            </p>
          </div>

          <div>
            <div className="text-slate-200 font-semibold mb-2 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Marco Normativo - Decreto 1079 de 2015</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Servicio público de transporte terrestre automotor especial. Exige afiliación vigente a empresa habilitada y Tarjeta de Operación expedida por el Ministerio de Transporte.
            </p>
          </div>

          <div>
            <div className="text-slate-200 font-semibold mb-2 flex items-center gap-1.5 text-xs">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Formato & Moneda</span>
            </div>
            <p className="text-slate-400 text-xs">
              Todos los valores en Pesos Colombianos (COP). Formato de fecha Día/Mes/Año. Prototipo funcional con sincronización compartida.
            </p>
          </div>
        </div>

        {/* Aviso Legal Mandatorio */}
        <div className="mt-6 pt-2 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
          <p className="text-slate-400 text-xs leading-relaxed text-center">
            <span className="font-semibold text-amber-400">Aviso legal:</span> En Colombia el transporte especial requiere que los vehículos estén afiliados a una empresa de transporte habilitada por el Ministerio de Transporte, y que los datos de afiliación mostrados en la app son responsabilidad de quien los registra (la app no los verifica automáticamente ante el RUNT).
          </p>
        </div>

        <div className="mt-4 text-center text-slate-500 text-[11px] flex flex-wrap items-center justify-center gap-3">
          <span>© {new Date().getFullYear()} Solicitudes de Transporte Especial Colombia</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-1.5 bg-yellow-400 rounded-xs"></span>
            <span className="w-2 h-1.5 bg-blue-600 rounded-xs"></span>
            <span className="w-2 h-1.5 bg-red-600 rounded-xs"></span>
            <span>República de Colombia</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
