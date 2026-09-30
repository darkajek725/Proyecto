import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  ExternalLink,
  ChevronDown,
  X,
  Info,
} from 'lucide-react';
import { Vehicle, Driver } from '../types';
import {
  validateVehicleDocuments,
  validateDriverDocuments,
  ValidationSummary,
} from '../utils/documentValidation';

interface VerificationCheckBadgeProps {
  vehicle?: Vehicle;
  driver?: Driver;
  size?: 'sm' | 'md' | 'lg';
  showDetailsOnClick?: boolean;
  className?: string;
  labelOverride?: string;
}

export const VerificationCheckBadge: React.FC<VerificationCheckBadgeProps> = ({
  vehicle,
  driver,
  size = 'md',
  showDetailsOnClick = true,
  className = '',
  labelOverride,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate validation
  const validation: ValidationSummary | null = vehicle
    ? validateVehicleDocuments(vehicle)
    : driver
    ? validateDriverDocuments(driver)
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!validation) return null;

  const { isValid, scorePercentage, passedCount, totalCount, hasExpiringSoon, hasExpired } =
    validation;

  // Size configurations
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-semibold rounded-full',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold rounded-xl',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          if (showDetailsOnClick) {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }
        }}
        title="Ver auditoría de documentos legales exigidos por Mintransporte"
        className={`inline-flex items-center transition-all cursor-pointer select-none border shadow-2xs ${
          sizeClasses[size]
        } ${
          isValid
            ? hasExpiringSoon
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 ring-1 ring-amber-400/20'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 ring-1 ring-emerald-500/25 shadow-emerald-500/10'
            : hasExpired
            ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
        }`}
      >
        {isValid ? (
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute opacity-40"></span>
            <CheckCircle2 className={`${iconSizes[size]} text-emerald-700 fill-emerald-100`} />
          </div>
        ) : (
          <AlertTriangle className={`${iconSizes[size]} text-amber-600`} />
        )}

        <span className="whitespace-nowrap">
          {labelOverride ||
            (isValid
              ? hasExpiringSoon
                ? 'Docs al Día (Próx. a vencer)'
                : '100% Docs Verificados'
              : `${passedCount}/${totalCount} Docs Validados`)}
        </span>

        {showDetailsOnClick && (
          <ChevronDown
            className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Interactive popover with detailed legal breakdown */}
      {isOpen && (
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 mt-2 right-0 sm:left-0 sm:right-auto w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div
            className={`p-4 border-b ${
              isValid
                ? 'bg-gradient-to-r from-emerald-900 to-teal-900 text-white'
                : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                    isValid ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight text-white">
                    Auditoría Documental Automática
                  </h4>
                  <p className="text-[11px] text-emerald-100/80">
                    {vehicle
                      ? `Vehículo Placa ${vehicle.plate} • Mintransporte`
                      : `Conductor ${driver?.name} • RUNT / PILA`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score pill */}
            <div className="mt-3 flex items-center justify-between bg-black/20 rounded-xl p-2.5 backdrop-blur-xs">
              <div className="text-xs">
                <span className="text-white/80 block text-[10px] uppercase font-semibold">
                  Cumplimiento Legal Exigido
                </span>
                <span className="font-extrabold text-white text-base">
                  {scorePercentage}% Conforme
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  isValid
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'bg-amber-400 text-amber-950'
                }`}
              >
                {passedCount} de {totalCount} Verificados
              </span>
            </div>
          </div>

          {/* Document list */}
          <div className="p-3 max-h-80 overflow-y-auto divide-y divide-slate-100 space-y-1">
            {validation.items.map((doc) => (
              <div key={doc.id} className="py-2.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {doc.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-tight">
                        {doc.shortName}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        ({doc.regulatoryBasis})
                      </span>
                    </div>
                    {doc.documentNumber && (
                      <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                        N° {doc.documentNumber}
                      </p>
                    )}
                    {doc.entityName && (
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{doc.entityName}</span>
                      </p>
                    )}
                    {doc.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">{doc.notes}</p>
                    )}
                  </div>
                </div>

                {/* Expiration date status badge */}
                <div className="text-right shrink-0">
                  {doc.expirationDate && (
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                        doc.status === 'vigente'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : doc.status === 'proximo_a_vencer'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : doc.status === 'vencido'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {doc.status === 'vencido'
                        ? 'Vencido'
                        : doc.status === 'proximo_a_vencer'
                        ? 'Próx. a vencer'
                        : doc.expirationDate.includes('-')
                        ? `Vence ${doc.expirationDate}`
                        : doc.expirationDate}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer banner */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Base: Decreto 1079 de 2015
            </span>
            <span className="text-emerald-700 font-bold">
              {isValid ? 'Apto para contratación' : 'Requiere actualización'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
