import React, { useState, useEffect } from 'react';
import { TransportRequest, PaymentTerm } from '../../types';
import {
  X,
  Pencil,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CreditCard,
  UserCheck,
  Phone,
  Save,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

interface EditRequestModalProps {
  request: TransportRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    requestId: string,
    data: {
      serviceDate?: string;
      serviceTime?: string;
      pickupLocation?: string;
      destinationLocation?: string;
      passengerCount?: number;
      returnDate?: string;
      paymentAmount?: number;
      paymentTerm?: PaymentTerm;
      coordinatorName?: string;
      coordinatorPhone?: string;
      reason?: string;
    }
  ) => { success: boolean; message?: string; isPendingApproval?: boolean };
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !request) return null;

  const isAccepted = request.status === 'aceptada';
  const hasPendingModification = Boolean(
    request.pendingModification && request.pendingModification.status === 'pendiente'
  );

  const [serviceDate, setServiceDate] = useState(request.serviceDate);
  const [serviceTime, setServiceTime] = useState(request.serviceTime);
  const [pickupLocation, setPickupLocation] = useState(request.pickupLocation);
  const [destinationLocation, setDestinationLocation] = useState(request.destinationLocation);
  const [passengerCount, setPassengerCount] = useState<number | ''>(request.passengerCount);
  const [returnDate, setReturnDate] = useState(request.returnDate || '');
  const [paymentAmount, setPaymentAmount] = useState<number | ''>(
    request.acceptedBy?.agreedAmount || request.paymentAmount
  );
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>(request.paymentTerm);
  const [coordinatorName, setCoordinatorName] = useState(request.coordinatorName);
  const [coordinatorPhone, setCoordinatorPhone] = useState(request.coordinatorPhone);
  const [reason, setReason] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync state if request changes
  useEffect(() => {
    if (request) {
      setServiceDate(request.serviceDate);
      setServiceTime(request.serviceTime);
      setPickupLocation(request.pickupLocation);
      setDestinationLocation(request.destinationLocation);
      setPassengerCount(request.passengerCount);
      setReturnDate(request.returnDate || '');
      setPaymentAmount(request.acceptedBy?.agreedAmount || request.paymentAmount);
      setPaymentTerm(request.paymentTerm);
      setCoordinatorName(request.coordinatorName);
      setCoordinatorPhone(request.coordinatorPhone);
      setReason('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (hasPendingModification) {
      setErrorMsg(
        'Ya existe una propuesta de modificación pendiente. Debes esperar a que el conductor responda o cancelarla antes de enviar una nueva.'
      );
      return;
    }

    if (!pickupLocation.trim()) {
      setErrorMsg('Por favor especifica el lugar de recogida.');
      return;
    }
    if (!destinationLocation.trim()) {
      setErrorMsg('Por favor especifica el lugar de destino.');
      return;
    }
    if (!passengerCount || passengerCount <= 0) {
      setErrorMsg('Ingresa una cantidad válida de pasajeros.');
      return;
    }
    if (!paymentAmount || paymentAmount <= 0) {
      setErrorMsg('Ingresa un valor a pagar en COP.');
      return;
    }
    if (!coordinatorName.trim() || !coordinatorPhone.trim()) {
      setErrorMsg('Ingresa el nombre y número de contacto del coordinador.');
      return;
    }

    const res = onSave(request.id, {
      serviceDate,
      serviceTime,
      pickupLocation: pickupLocation.trim(),
      destinationLocation: destinationLocation.trim(),
      passengerCount: Number(passengerCount),
      returnDate: returnDate ? returnDate : undefined,
      paymentAmount: Number(paymentAmount),
      paymentTerm,
      coordinatorName: coordinatorName.trim(),
      coordinatorPhone: coordinatorPhone.trim(),
      reason: isAccepted ? reason.trim() : undefined,
    });

    if (res.success) {
      setSuccessMsg(
        res.isPendingApproval
          ? '¡Propuesta de modificación enviada al conductor! Queda pendiente de aprobación mutua.'
          : '¡Solicitud actualizada exitosamente!'
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Error al actualizar la solicitud.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 my-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Editar Solicitud de Servicio</h2>
              <p className="text-xs text-slate-500">
                Modifica los detalles del viaje, tarifa o datos de contacto del coordinador
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Accepted warning notice if service is already accepted */}
        {isAccepted && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950 text-sm">
                  ⚠️ Servicio ya Aceptado — Aprobación Mutua Requerida
                </p>
                <p className="mt-1 leading-relaxed">
                  Este viaje ya fue confirmado y asignado al conductor{' '}
                  <span className="font-bold text-slate-900">{request.acceptedBy?.driverName}</span> (Placa{' '}
                  <span className="font-mono font-bold bg-[#1e3a5f] text-white px-1.5 py-0.5 rounded text-[11px]">
                    {request.acceptedBy?.vehiclePlate}
                  </span>
                  ). De acuerdo con la normativa de transporte,{' '}
                  <strong>ninguna condición puede modificarse unilateralmente sin el acuerdo de ambas partes</strong>.
                </p>
                <p className="mt-1.5 text-amber-800">
                  Al enviar este formulario, el conductor recibirá la propuesta con los cambios solicitados para su revisión.
                  Los nuevos términos <strong>solo entrarán en vigencia si el conductor los aprueba</strong>.
                </p>
              </div>
            </div>

            {hasPendingModification && (
              <div className="mt-2 p-2.5 bg-white border border-amber-300 rounded-lg text-amber-900 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <span>
                  Actualmente hay una propuesta de modificación enviada esperando respuesta del conductor. No puedes enviar otra hasta que se resuelva.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Rutas: Origen y Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Origen / Recogida *</span>
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Ej. Bogotá - Calle 127 # 15-45"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Destino Final *</span>
              </label>
              <input
                type="text"
                required
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                placeholder="Ej. Melgar - Hotel Campestre"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
              />
            </div>
          </div>

          {/* Fechas y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1e3a5f]" />
                <span>Fecha Servicio *</span>
              </label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1e3a5f]" />
                <span>Hora Salida *</span>
              </label>
              <input
                type="time"
                required
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Regreso (Opcional)</span>
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
              />
            </div>
          </div>

          {/* Pasajeros y Plazo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#1e3a5f]" />
                <span>Cantidad de Pasajeros *</span>
              </label>
              <input
                type="number"
                min="1"
                max="80"
                required
                value={passengerCount}
                onChange={(e) => setPassengerCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#1e3a5f]" />
                <span>Plazo de Pago *</span>
              </label>
              <select
                value={paymentTerm}
                onChange={(e) => setPaymentTerm(e.target.value as PaymentTerm)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white"
              >
                <option value="De contado">De contado (Contra entrega o anticipo)</option>
                <option value="En 1 semana">En 1 semana (7 días)</option>
                <option value="En 15 días">En 15 días (Quincenal)</option>
                <option value="En 1 mes">En 1 mes (30 días)</option>
              </select>
            </div>
          </div>

          {/* Tarifa Ofrecida */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valor Ofrecido a Pagar (COP) *</span>
              </label>
              {paymentAmount !== '' && paymentAmount > 0 && (
                <span className="text-xs font-bold text-[#1e3a5f]">
                  {formatCOP(Number(paymentAmount))}
                </span>
              )}
            </div>
            <input
              type="number"
              min="50000"
              step="10000"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-semibold text-slate-800"
            />
          </div>

          {/* Contacto Coordinador */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#1e3a5f]" />
              <span>Datos del Coordinador Responsable</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nombre del Coordinador *
                </label>
                <input
                  type="text"
                  required
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>Teléfono Celular *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={coordinatorPhone}
                  onChange={(e) => setCoordinatorPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Justification reason if service is already accepted */}
          {isAccepted && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Motivo de la propuesta de cambio (se mostrará al conductor):
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. El cliente solicitó adelantar la hora de recogida a las 6:30 AM por congestión vial..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white"
                disabled={hasPendingModification}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                El conductor recibirá esta justificación junto con la comparativa de los cambios para decidir si los acepta o no.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={hasPendingModification}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer ${
                hasPendingModification
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : isAccepted
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#1e3a5f] hover:bg-[#142842]'
              }`}
            >
              <Save className="w-4 h-4 text-white" />
              <span>{isAccepted ? 'Enviar Propuesta al Conductor' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
