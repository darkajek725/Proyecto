import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PaymentTerm,
  ServiceCategory,
  ServiceType,
  SchoolPaymentModality,
  CorporatePaymentModality,
} from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CreditCard,
  UserCheck,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Compass,
  Repeat,
  Bus,
  School,
  CheckSquare,
  Square,
  FileCheck2,
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

interface PublishRequestFormProps {
  onSuccessNavigate?: () => void;
}

const ALL_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const PublishRequestForm: React.FC<PublishRequestFormProps> = ({ onSuccessNavigate }) => {
  const { currentSession, companies, publishRequest } = useApp();

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  // Company identity for coordinators
  const representingCompanyName =
    currentSession?.role === 'coordinador'
      ? currentSession.companyName || 'Empresa de Transporte'
      : currentSession?.name || 'Mi Empresa';

  // Category & Type selector
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('fija');
  const [serviceType, setServiceType] = useState<ServiceType>('escolar');

  // Route Days
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
  ]);

  // School Route details
  const [schoolName, setSchoolName] = useState('Colegio Nueva Granada / Liceo Francés');
  const [schoolAddress, setSchoolAddress] = useState('Cra. 2 Este # 70-20, Chapinero Alto, Bogotá');
  const [schoolStudentsCount, setSchoolStudentsCount] = useState<number | ''>(18);
  const [schoolPaymentModality, setSchoolPaymentModality] = useState<SchoolPaymentModality>('por_estudiante');
  const [amountPerStudent, setAmountPerStudent] = useState<number | ''>(280000);
  const [schoolStartZone, setSchoolStartZone] = useState('Usaquén / Cedritos (Cl 140 con 9)');
  const [schoolMorningPickupTime, setSchoolMorningPickupTime] = useState('06:15');
  const [schoolAfternoonReturnTime, setSchoolAfternoonReturnTime] = useState('15:10');

  // Corporate Route details
  const [corporateName, setCorporateName] = useState('Bavaria S.A. / Cervecería de Tocancipá');
  const [corporateLocation, setCorporateLocation] = useState('Zona Franca Tocancipá, Km 28 Autopista Norte');
  const [corporateEmployeesCount, setCorporateEmployeesCount] = useState<number | ''>(24);
  const [corporatePaymentModality, setCorporatePaymentModality] = useState<CorporatePaymentModality>('por_cupo_completo');
  const [corporateStartZone, setCorporateStartZone] = useState('Portal Norte / Terminal Satélite del Norte');
  const [corporateShiftStartTime, setCorporateShiftStartTime] = useState('05:30');
  const [corporateShiftEndTime, setCorporateShiftEndTime] = useState('14:30');
  const [corporateVehicleType, setCorporateVehicleType] = useState('Buseta / Microbús (19-24 pax)');

  // Common / Ocasional fields
  const [serviceDate, setServiceDate] = useState(defaultDateStr);
  const [serviceTime, setServiceTime] = useState('06:30');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [passengerCount, setPassengerCount] = useState<number | ''>(20);
  const [returnDate, setReturnDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>(3200000);
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>('En 15 días');

  // Coordinator contact fields
  const [coordinatorName, setCoordinatorName] = useState(currentSession?.name || '');
  const [coordinatorPhone, setCoordinatorPhone] = useState(currentSession?.phone || '3104528891');

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let finalPickup = pickupLocation;
    let finalDest = destinationLocation;
    let finalPax = Number(passengerCount) || 15;
    let finalTime = serviceTime;
    let finalAmount = Number(paymentAmount) || 0;

    if (serviceCategory === 'fija') {
      if (selectedDays.length === 0) {
        setErrorMsg('Por favor selecciona al menos un día de la semana para la ruta fija.');
        return;
      }

      if (serviceType === 'escolar') {
        if (!schoolName.trim()) {
          setErrorMsg('Por favor indica el nombre del colegio.');
          return;
        }
        if (!schoolAddress.trim()) {
          setErrorMsg('Por favor indica la ubicación o dirección del colegio.');
          return;
        }
        if (!schoolStartZone.trim()) {
          setErrorMsg('Por favor indica dónde inicia la ruta escolar.');
          return;
        }
        if (!schoolStudentsCount || Number(schoolStudentsCount) <= 0) {
          setErrorMsg('Indica la cantidad de estudiantes que tendría la ruta.');
          return;
        }

        finalPickup = `Inicio: ${schoolStartZone.trim()}`;
        finalDest = `Colegio: ${schoolName.trim()} (${schoolAddress.trim()})`;
        finalPax = Number(schoolStudentsCount);
        finalTime = schoolMorningPickupTime;

        if (schoolPaymentModality === 'por_estudiante') {
          const perStudent = Number(amountPerStudent) || 0;
          finalAmount = perStudent * finalPax;
        }
      } else {
        // Empresarial
        if (!corporateName.trim()) {
          setErrorMsg('Por favor indica la empresa a donde se prestará el servicio.');
          return;
        }
        if (!corporateLocation.trim()) {
          setErrorMsg('Por favor indica la ubicación de la empresa / planta.');
          return;
        }
        if (!corporateStartZone.trim()) {
          setErrorMsg('Por favor indica dónde inicia la ruta empresarial.');
          return;
        }
        if (!corporateEmployeesCount || Number(corporateEmployeesCount) <= 0) {
          setErrorMsg('Indica la cantidad de trabajadores / colaboradores.');
          return;
        }

        finalPickup = `Inicio: ${corporateStartZone.trim()}`;
        finalDest = `Empresa: ${corporateName.trim()} (${corporateLocation.trim()})`;
        finalPax = Number(corporateEmployeesCount);
        finalTime = corporateShiftStartTime;
      }
    } else {
      // Ocasional
      if (!pickupLocation.trim() || !destinationLocation.trim()) {
        setErrorMsg('Por favor especifica origen y destino del servicio ocasional.');
        return;
      }
      if (!passengerCount || Number(passengerCount) <= 0) {
        setErrorMsg('Ingresa una cantidad válida de pasajeros.');
        return;
      }
    }

    if (finalAmount <= 0) {
      setErrorMsg('Ingresa un valor a pagar válido en COP.');
      return;
    }

    if (!coordinatorName.trim() || !coordinatorPhone.trim()) {
      setErrorMsg('Ingresa el nombre y número de contacto del coordinador.');
      return;
    }

    publishRequest({
      serviceCategory,
      serviceType: serviceCategory === 'fija' ? serviceType : 'turismo_expreso',
      routeDays: serviceCategory === 'fija' ? selectedDays : undefined,
      schoolInfo:
        serviceCategory === 'fija' && serviceType === 'escolar'
          ? {
              schoolName: schoolName.trim(),
              schoolLocation: schoolAddress.trim(),
              studentsCount: Number(schoolStudentsCount),
              paymentModality: schoolPaymentModality,
              amountPerStudent: schoolPaymentModality === 'por_estudiante' ? Number(amountPerStudent) : undefined,
              routeStartZone: schoolStartZone.trim(),
              morningPickupTime: schoolMorningPickupTime,
              afternoonReturnTime: schoolAfternoonReturnTime,
            }
          : undefined,
      corporateInfo:
        serviceCategory === 'fija' && serviceType === 'empresarial'
          ? {
              companyName: corporateName.trim(),
              companyLocation: corporateLocation.trim(),
              routeStartZone: corporateStartZone.trim(),
              shiftStartTime: corporateShiftStartTime,
              shiftEndTime: corporateShiftEndTime,
              employeesCount: Number(corporateEmployeesCount),
              paymentModality: corporatePaymentModality,
              preferredVehicleType: corporateVehicleType,
            }
          : undefined,
      serviceDate,
      serviceTime: finalTime,
      pickupLocation: finalPickup,
      destinationLocation: finalDest,
      passengerCount: finalPax,
      returnDate: returnDate || undefined,
      paymentAmount: finalAmount,
      paymentTerm,
      coordinatorName: coordinatorName.trim(),
      coordinatorPhone: coordinatorPhone.trim(),
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      if (onSuccessNavigate) {
        onSuccessNavigate();
      }
    }, 1200);
  };

  // Quick Preset Helper
  const loadPreset = (category: ServiceCategory, type: ServiceType) => {
    setServiceCategory(category);
    setServiceType(type);
    if (category === 'fija' && type === 'escolar') {
      setSchoolName('Colegio San Jorge de Inglaterra / Saint George');
      setSchoolAddress('Calle 222 # 55-30, Suba / Guaymaral, Bogotá');
      setSchoolStartZone('Cedritos y Mazurén (Cl 140 a 153 con Autonorte)');
      setSchoolStudentsCount(19);
      setSchoolPaymentModality('por_estudiante');
      setAmountPerStudent(310000);
      setSchoolMorningPickupTime('06:10');
      setSchoolAfternoonReturnTime('15:00');
      setPaymentAmount(19 * 310000);
      setPaymentTerm('En 15 días');
    } else if (category === 'fija' && type === 'empresarial') {
      setCorporateName('Planta Parmalat / Lactalis Colombia');
      setCorporateLocation('Parque Industrial Celta, Autopista Medellín Km 7, Funza');
      setCorporateStartZone('Bogotá Portal 80 / Engativá Centro');
      setCorporateEmployeesCount(28);
      setCorporatePaymentModality('por_cupo_completo');
      setCorporateShiftStartTime('05:15');
      setCorporateShiftEndTime('14:15');
      setPaymentAmount(4200000);
      setPaymentTerm('En 15 días');
    } else {
      setPickupLocation('Bogotá D.C. (Hotel Tequendama, Cra 10 # 26-21)');
      setDestinationLocation('Villa de Leyva, Boyacá (Plaza Mayor)');
      setPassengerCount(25);
      setPaymentAmount(2100000);
      setPaymentTerm('De contado');
      setServiceDate(defaultDateStr);
      setServiceTime('07:00');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Coordinator Delegation Banner */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#142842] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>
              {currentSession?.role === 'coordinador'
                ? 'Coordinador Autorizado'
                : 'Panel de Contratación'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Publicar Solicitud de Servicio a Nombre de la Empresa
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {currentSession?.role === 'coordinador' ? (
              <span>
                Publicando oficialmente con respaldo de:{' '}
                <strong className="text-amber-300 font-bold">
                  {representingCompanyName}
                </strong>{' '}
                (NIT: {currentSession.companyNit || 'Registrado'})
              </span>
            ) : (
              <span>
                Genera solicitudes de transporte para recibir postulaciones de propietarios y conductores habilitados.
              </span>
            )}
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => loadPreset('fija', 'escolar')}
            className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Ej. Escolar Fija</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset('fija', 'empresarial')}
            className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Ej. Empresarial Fija</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset('ocasional', 'turismo_expreso')}
            className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Ej. Ocasional</span>
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 font-semibold text-xs shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">¡Solicitud de Transporte Publicada!</h4>
            <p className="text-emerald-700">
              La solicitud ya está visible en el tablero público oficial a nombre de{' '}
              {representingCompanyName}. Los conductores notificados podrán enviar contraofertas de inmediato.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Step 1: Category Selector (Ruta Fija vs Ocasional) */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            1. Tipo y Modalidad del Servicio
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setServiceCategory('fija')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                serviceCategory === 'fija'
                  ? 'border-[#1e3a5f] bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceCategory === 'fija'
                    ? 'bg-[#1e3a5f] text-amber-400'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">Ruta Fija</span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Recurrente / Contrato
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Rutas escolares o empresariales periódicas con días específicos de la semana, horarios fijos y modalidad de pago por cupo o estudiante.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setServiceCategory('ocasional')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                serviceCategory === 'ocasional'
                  ? 'border-[#1e3a5f] bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  serviceCategory === 'ocasional'
                    ? 'bg-[#1e3a5f] text-amber-400'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">Servicio Ocasional</span>
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Expreso / Evento
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Viajes de turismo, traslados especiales, paseos o eventos puntuales con fecha y hora específica de ida y regreso.
                </p>
              </div>
            </button>
          </div>

          {/* Sub-Selector for Ruta Fija: Escolar vs Empresarial */}
          {serviceCategory === 'fija' && (
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Subtipo de Ruta Fija:</span>
              <button
                type="button"
                onClick={() => setServiceType('escolar')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  serviceType === 'escolar'
                    ? 'bg-[#1e3a5f] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Ruta Escolar (Colegios e Instituciones)</span>
              </button>
              <button
                type="button"
                onClick={() => setServiceType('empresarial')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  serviceType === 'empresarial'
                    ? 'bg-[#1e3a5f] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Ruta Empresarial (Personal y Plantas)</span>
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Specific Configuration according to Category */}
        <div className="p-6 border-b border-slate-100 space-y-6">
          {serviceCategory === 'fija' && (
            <>
              {/* Days of the Week Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  ¿Qué días de la semana opera la ruta? *
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#1e3a5f] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ROUTE ESCOLAR FIELDS */}
              {serviceType === 'escolar' && (
                <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl space-y-5">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm pb-2 border-b border-amber-200/80">
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                    <span>Configuración de Ruta Escolar</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿Cuál sería el Colegio? *
                      </label>
                      <div className="relative">
                        <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="Ej. Colegio Nueva Granada"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿Dónde está ubicado el Colegio? (Dirección / Sede) *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={schoolAddress}
                          onChange={(e) => setSchoolAddress(e.target.value)}
                          placeholder="Ej. Cra. 2 Este # 70-20, Chapinero Alto"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿Dónde iniciaría la ruta? (Punto o Sector) *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={schoolStartZone}
                          onChange={(e) => setSchoolStartZone(e.target.value)}
                          placeholder="Ej. Cedritos / Usaquén (Cl 140)"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿A qué hora inicia la mañana? *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="time"
                          required
                          value={schoolMorningPickupTime}
                          onChange={(e) => setSchoolMorningPickupTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hora Retorno Tarde (Colegio ➔ Casa)
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="time"
                          value={schoolAfternoonReturnTime}
                          onChange={(e) => setSchoolAfternoonReturnTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-amber-200/60">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿Cuántos estudiantes tendría la ruta? *
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          min={1}
                          max={60}
                          required
                          value={schoolStudentsCount}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Number(e.target.value);
                            setSchoolStudentsCount(val);
                            if (val && schoolPaymentModality === 'por_estudiante' && amountPerStudent) {
                              setPaymentAmount(Number(val) * Number(amountPerStudent));
                            }
                          }}
                          placeholder="Ej. 18"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Modalidad de Pago *
                      </label>
                      <select
                        value={schoolPaymentModality}
                        onChange={(e) => {
                          const mod = e.target.value as SchoolPaymentModality;
                          setSchoolPaymentModality(mod);
                          if (mod === 'por_estudiante' && schoolStudentsCount && amountPerStudent) {
                            setPaymentAmount(Number(schoolStudentsCount) * Number(amountPerStudent));
                          }
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                      >
                        <option value="por_estudiante">Por estudiante (Tarifa individual)</option>
                        <option value="por_cupo_completo">Por cupo completo del vehículo</option>
                      </select>
                    </div>

                    <div>
                      {schoolPaymentModality === 'por_estudiante' ? (
                        <>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tarifa mensual por estudiante (COP) *
                          </label>
                          <div className="relative">
                            <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                            <input
                              type="number"
                              min={10000}
                              step={5000}
                              value={amountPerStudent}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                setAmountPerStudent(val);
                                if (val && schoolStudentsCount) {
                                  setPaymentAmount(Number(schoolStudentsCount) * Number(val));
                                }
                              }}
                              placeholder="Ej. 280000"
                              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tarifa total mensual por vehículo (COP) *
                          </label>
                          <div className="relative">
                            <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                            <input
                              type="number"
                              min={50000}
                              step={50000}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Ej. 4500000"
                              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ROUTE EMPRESARIAL FIELDS */}
              {serviceType === 'empresarial' && (
                <div className="bg-blue-50/50 border border-blue-200 p-5 rounded-2xl space-y-5">
                  <div className="flex items-center gap-2 text-[#1e3a5f] font-extrabold text-sm pb-2 border-b border-blue-200/80">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>Configuración de Ruta Empresarial</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿Cuál sería la Empresa cliente / contratante? *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={corporateName}
                          onChange={(e) => setCorporateName(e.target.value)}
                          placeholder="Ej. Bavaria S.A. / Cervecería Tocancipá"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿Dónde está ubicada la Empresa / Planta? *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={corporateLocation}
                          onChange={(e) => setCorporateLocation(e.target.value)}
                          placeholder="Ej. Zona Franca Tocancipá, Km 28 Autonorte"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿Dónde iniciaría la ruta de empleados? *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={corporateStartZone}
                          onChange={(e) => setCorporateStartZone(e.target.value)}
                          placeholder="Ej. Portal Norte / Terminal Satélite"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ¿A qué horas inicia la ruta? (Turno Entrada) *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="time"
                          required
                          value={corporateShiftStartTime}
                          onChange={(e) => setCorporateShiftStartTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hora Turno Salida / Retorno
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="time"
                          value={corporateShiftEndTime}
                          onChange={(e) => setCorporateShiftEndTime(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-blue-200/60">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cantidad de Empleados / Trabajadores *
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          min={1}
                          max={60}
                          required
                          value={corporateEmployeesCount}
                          onChange={(e) => setCorporateEmployeesCount(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="Ej. 24"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Modalidad de Pago *
                      </label>
                      <select
                        value={corporatePaymentModality}
                        onChange={(e) => setCorporatePaymentModality(e.target.value as CorporatePaymentModality)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                      >
                        <option value="por_cupo_completo">Por cupo completo del vehículo</option>
                        <option value="por_pasajero">Por pasajero / trabajador</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tipo de Vehículo Sugerido
                      </label>
                      <div className="relative">
                        <Bus className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={corporateVehicleType}
                          onChange={(e) => setCorporateVehicleType(e.target.value)}
                          placeholder="Ej. Buseta / Microbús (19-24 pax)"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* OCASIONAL FIELDS */}
          {serviceCategory === 'ocasional' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lugar de Recogida / Origen *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Ej. Bogotá D.C. (Hotel Tequendama, Cra 10 # 26-21)"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lugar de Destino *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-rose-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={destinationLocation}
                      onChange={(e) => setDestinationLocation(e.target.value)}
                      placeholder="Ej. Villa de Leyva, Boyacá (Plaza Mayor)"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha del Servicio *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hora de Salida *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="time"
                      required
                      value={serviceTime}
                      onChange={(e) => setServiceTime(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha de Regreso (Opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad de Pasajeros *
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 24"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Payment & Terms */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            {serviceCategory === 'fija' ? '2. Tarifa y Condiciones de Pago de la Ruta' : '2. Tarifa y Condiciones Económicas'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {serviceCategory === 'fija'
                  ? 'Valor Total Mensual / Facturación Pactada (COP) *'
                  : 'Valor Ofrecido a Pagar (COP) *'}
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={50000}
                  step={50000}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej. 2500000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>
              {paymentAmount && (
                <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                  Total presupuestado: {formatCOP(Number(paymentAmount))} COP
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Plazo o Término de Pago *
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={paymentTerm}
                  onChange={(e) => setPaymentTerm(e.target.value as PaymentTerm)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                >
                  <option value="De contado">De contado (Contra entrega / Anticipo)</option>
                  <option value="En 1 semana">En 1 semana (7 días calendario)</option>
                  <option value="En 15 días">En 15 días (Quincenal)</option>
                  <option value="En 1 mes">En 1 mes (30 días factura)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Coordinator Contact Details */}
        <div className="p-6 space-y-4">
          <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            3. Datos de Contacto del Coordinador Responsable
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Coordinador *
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono / WhatsApp de Coordinación *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={coordinatorPhone}
                  onChange={(e) => setCoordinatorPhone(e.target.value)}
                  placeholder="Ej. 3104528891"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Al publicar, la solicitud se emitirá en el tablero oficial a nombre de{' '}
            <strong className="text-slate-800 font-bold">{representingCompanyName}</strong>.
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-400" />
            <span>Publicar Solicitud de Ruta</span>
          </button>
        </div>
      </form>
    </div>
  );
};
