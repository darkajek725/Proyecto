import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';
import {
  Wind,
  Users,
  Wifi,
  Zap,
  Tv,
  Volume2,
  Lightbulb,
  Briefcase,
  Sun,
  Bath,
  ShieldCheck,
  PlusCircle,
  AlertTriangle,
  Activity,
  Gauge,
  Radio,
  ShieldAlert,
  Wrench,
  Calendar,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { formatPlateDisplay } from '../utils/formatters';

interface EditEquipmentModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSaved?: () => void;
}

export const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  vehicle,
  onClose,
  onSaved,
}) => {
  const { updateVehicle } = useApp();

  // Confort a Bordo
  const [airConditioning, setAirConditioning] = useState<boolean>(
    vehicle.airConditioning ?? true
  );
  const [recliningSeats, setRecliningSeats] = useState<boolean>(
    vehicle.recliningSeats ?? true
  );
  const [wifi, setWifi] = useState<boolean>(vehicle.wifi ?? false);
  const [usbChargers, setUsbChargers] = useState<boolean>(
    vehicle.usbChargers ?? true
  );
  const [screenTv, setScreenTv] = useState<boolean>(vehicle.screenTv ?? false);
  const [soundSystem, setSoundSystem] = useState<boolean>(
    vehicle.soundSystem ?? true
  );
  const [readingLights, setReadingLights] = useState<boolean>(
    vehicle.readingLights ?? true
  );
  const [luggageRack, setLuggageRack] = useState<boolean>(
    vehicle.luggageRack ?? true
  );
  const [tintedWindows, setTintedWindows] = useState<boolean>(
    vehicle.tintedWindows ?? true
  );
  const [bathroom, setBathroom] = useState<boolean>(vehicle.bathroom ?? false);

  // Seguridad & Normatividad Mintransporte
  const [seatbeltsOnAllSeats, setSeatbeltsOnAllSeats] = useState<boolean>(
    vehicle.seatbeltsOnAllSeats ?? true
  );
  const [firstAidKit, setFirstAidKit] = useState<boolean>(
    vehicle.firstAidKit ?? true
  );
  const [emergencyExit, setEmergencyExit] = useState<boolean>(
    vehicle.emergencyExit ?? true
  );
  const [absBrakes, setAbsBrakes] = useState<boolean>(
    vehicle.absBrakes ?? true
  );
  const [speedLimiter, setSpeedLimiter] = useState<boolean>(
    vehicle.speedLimiter ?? true
  );
  const [gpsTracking, setGpsTracking] = useState<boolean>(
    vehicle.gpsTracking ?? true
  );
  const [dualAirbags, setDualAirbags] = useState<boolean>(
    vehicle.dualAirbags ?? true
  );
  const [roadKit, setRoadKit] = useState<boolean>(vehicle.roadKit ?? true);
  const [fireExtinguisherDue, setFireExtinguisherDue] = useState<string>(
    vehicle.fireExtinguisherDue || '2026-11-30'
  );
  const [gpsProvider, setGpsProvider] = useState<string>(
    vehicle.gpsProvider || 'Navisat GPS Colombia - Transmisión Mintransporte 24/7'
  );
  const [additionalEquipmentNotes, setAdditionalEquipmentNotes] = useState<string>(
    vehicle.additionalEquipmentNotes || ''
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateVehicle(vehicle.id, {
      airConditioning,
      recliningSeats,
      wifi,
      usbChargers,
      screenTv,
      soundSystem,
      readingLights,
      luggageRack,
      tintedWindows,
      bathroom,
      seatbeltsOnAllSeats,
      firstAidKit,
      emergencyExit,
      absBrakes,
      speedLimiter,
      gpsTracking,
      dualAirbags,
      roadKit,
      fireExtinguisherDue,
      gpsProvider: gpsProvider.trim(),
      additionalEquipmentNotes: additionalEquipmentNotes.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onSaved) onSaved();
      onClose();
    }, 1000);
  };

  const comfortItems = [
    {
      id: 'airConditioning',
      label: 'Aire Acondicionado Climatizado',
      desc: 'Difusores independientes en cabina y salón de pasajeros',
      icon: Wind,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      checked: airConditioning,
      toggle: () => setAirConditioning(!airConditioning),
    },
    {
      id: 'recliningSeats',
      label: 'Silletería Reclinable Ejecutiva',
      desc: 'Sillas acolchadas ergonómicas con descansabrazos',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      checked: recliningSeats,
      toggle: () => setRecliningSeats(!recliningSeats),
    },
    {
      id: 'usbChargers',
      label: 'Puertos de Carga USB / 110V',
      desc: 'Tomas de carga rápida en cada fila de asientos',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      checked: usbChargers,
      toggle: () => setUsbChargers(!usbChargers),
    },
    {
      id: 'wifi',
      label: 'Wi-Fi 4G/5G a Bordo',
      desc: 'Conectividad inalámbrica de alta velocidad para pasajeros',
      icon: Wifi,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      checked: wifi,
      toggle: () => setWifi(!wifi),
    },
    {
      id: 'screenTv',
      label: 'Pantallas de Video / TV HD',
      desc: 'Pantallas plegables para reproducción multimedia y guías',
      icon: Tv,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      checked: screenTv,
      toggle: () => setScreenTv(!screenTv),
    },
    {
      id: 'soundSystem',
      label: 'Sonido Profesional y Micrófono Guía',
      desc: 'Parlantes distribuidos y micrófono para turismo y eventos',
      icon: Volume2,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      checked: soundSystem,
      toggle: () => setSoundSystem(!soundSystem),
    },
    {
      id: 'readingLights',
      label: 'Luces de Lectura Individuales LED',
      desc: 'Control individual de luz nocturna por pasajero',
      icon: Lightbulb,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
      checked: readingLights,
      toggle: () => setReadingLights(!readingLights),
    },
    {
      id: 'luggageRack',
      label: 'Bodega y Portaequipaje Amplio',
      desc: 'Compartimientos interiores superiores y bodega posterior',
      icon: Briefcase,
      color: 'text-stone-600 bg-stone-50 border-stone-200',
      checked: luggageRack,
      toggle: () => setLuggageRack(!luggageRack),
    },
    {
      id: 'tintedWindows',
      label: 'Vidrios Polarizados con Filtro UV',
      desc: 'Película de seguridad atérmica que reduce calor y brillo',
      icon: Sun,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      checked: tintedWindows,
      toggle: () => setTintedWindows(!tintedWindows),
    },
    {
      id: 'bathroom',
      label: 'Baño / Sanitario Químico a Bordo',
      desc: 'Servicio sanitario para viajes intermunicipales largos',
      icon: Bath,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      checked: bathroom,
      toggle: () => setBathroom(!bathroom),
    },
  ];

  const safetyItems = [
    {
      id: 'seatbeltsOnAllSeats',
      label: 'Cinturones en el 100% de Asientos',
      desc: 'Cinturones de 2 y 3 puntos homologados según norma Mintransporte',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      checked: seatbeltsOnAllSeats,
      toggle: () => setSeatbeltsOnAllSeats(!seatbeltsOnAllSeats),
    },
    {
      id: 'firstAidKit',
      label: 'Botiquín Reglamentario Completo',
      desc: 'Insumos médicos estériles y elementos de primera respuesta',
      icon: Activity,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      checked: firstAidKit,
      toggle: () => setFirstAidKit(!firstAidKit),
    },
    {
      id: 'emergencyExit',
      label: 'Salidas de Emergencia y Martillos',
      desc: 'Escotillas de techo, ventanas expulsables y martillos de impacto',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      checked: emergencyExit,
      toggle: () => setEmergencyExit(!emergencyExit),
    },
    {
      id: 'absBrakes',
      label: 'Frenos ABS + Control de Estabilidad ESP',
      desc: 'Sistema antibloqueo y control electrónico de tracción',
      icon: Gauge,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      checked: absBrakes,
      toggle: () => setAbsBrakes(!absBrakes),
    },
    {
      id: 'speedLimiter',
      label: 'Sensor y Alarma Sonora de Velocidad',
      desc: 'Dispositivo sonoro calibrado a máx 80 km/h según decreto vial',
      icon: Activity,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      checked: speedLimiter,
      toggle: () => setSpeedLimiter(!speedLimiter),
    },
    {
      id: 'gpsTracking',
      label: 'Monitoreo GPS Satelital 24/7',
      desc: 'Transmisión continua de telemetría a la plataforma Mintransporte',
      icon: Radio,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      checked: gpsTracking,
      toggle: () => setGpsTracking(!gpsTracking),
    },
    {
      id: 'dualAirbags',
      label: 'Bolsas de Aire (Airbags Frontales)',
      desc: 'Protección suplementaria para conductor y copiloto',
      icon: ShieldAlert,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      checked: dualAirbags,
      toggle: () => setDualAirbags(!dualAirbags),
    },
    {
      id: 'roadKit',
      label: 'Equipo de Carretera Reglamentario',
      desc: 'Conos reflectivos, tacos, linterna, herramientas y extintor ABC',
      icon: Wrench,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
      checked: roadKit,
      toggle: () => setRoadKit(!roadKit),
    },
  ];

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#1e3a5f] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Editar Equipamiento de Seguridad y Confort
                </h3>
                <span className="font-mono font-extrabold text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-xs">
                  {formatPlateDisplay(vehicle.plate)}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {vehicle.brand} ({vehicle.type} - {vehicle.capacity} Pasajeros)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {savedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>¡Equipamiento y características actualizadas exitosamente en la ficha técnica!</span>
            </div>
          )}

          {/* Section 1: Confort a Bordo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Confort y Experiencia a Bordo
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Marca las amenidades con las que cuenta el vehículo para los pasajeros.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#1e3a5f] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {comfortItems.filter((i) => i.checked).length} de {comfortItems.length} activos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {comfortItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.toggle}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer select-none ${
                      item.checked
                        ? 'bg-slate-50/80 border-[#1e3a5f] ring-1 ring-[#1e3a5f] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        item.checked
                          ? item.color
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {item.label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            item.checked
                              ? 'bg-[#1e3a5f] text-white'
                              : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Seguridad y Normatividad Mintransporte */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Seguridad Activa, Pasiva y Reglamentaria
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Elementos de protección y cumplimiento legal para transporte especial en Colombia.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {safetyItems.filter((i) => i.checked).length} de {safetyItems.length} activos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safetyItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.toggle}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer select-none ${
                      item.checked
                        ? 'bg-slate-50/80 border-emerald-600 ring-1 ring-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        item.checked
                          ? item.color
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {item.label}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            item.checked
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Datos de Extintor, Proveedor GPS y Notas */}
          <div className="space-y-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-4 rounded-2xl border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Datos Técnicos de Seguridad & Proveedores
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vencimiento del Extintor de Incendios *</span>
                </label>
                <input
                  type="date"
                  required
                  value={fireExtinguisherDue}
                  onChange={(e) => setFireExtinguisherDue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Proveedor de Monitoreo Satelital GPS</span>
                </label>
                <input
                  type="text"
                  value={gpsProvider}
                  onChange={(e) => setGpsProvider(e.target.value)}
                  placeholder="Ej: Navisat GPS Colombia / Hunter / Colven"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Observaciones y Equipamientos Especiales Adicionales</span>
              </label>
              <textarea
                rows={2}
                value={additionalEquipmentNotes}
                onChange={(e) => setAdditionalEquipmentNotes(e.target.value)}
                placeholder="Ej: Nevera ejecutiva para bebidas, cortinas de tela en ventanas, portavasos en todos los puestos, cámara de reversa HD con sensores..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Guardar Equipamiento y Confort</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
