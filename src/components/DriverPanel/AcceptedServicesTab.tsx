import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Phone,
  MessageCircle,
  CheckCircle2,
  Building2,
  UserCheck,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
  ShieldAlert,
  Camera,
  Printer,
  Upload,
  Download,
} from 'lucide-react';
import { formatCOP, formatDateDDMMYYYY } from '../../utils/formatters';

export const AcceptedServicesTab: React.FC = () => {
  const { currentSession, requests, respondRequestModification, updateServiceTracking, drivers, owners, updateDriverProfile } = useApp();
  const [actionFeedback, setActionFeedback] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const [cancelReasonText, setCancelReasonText] = useState('');

  // States for Cuenta de Cobro (Invoice Printing)
  const [printInvoiceReq, setPrintInvoiceReq] = useState<any | null>(null);
  const [invoiceBankName, setInvoiceBankName] = useState('Bancolombia');
  const [invoiceAccountType, setInvoiceAccountType] = useState<'Ahorros' | 'Corriente'>('Ahorros');
  const [invoiceAccountNumber, setInvoiceAccountNumber] = useState('108-412356-91');
  const [invoiceHolderName, setInvoiceHolderName] = useState('');
  const [invoiceHolderId, setInvoiceHolderId] = useState('');
  const [isSavingInvoiceDetails, setIsSavingInvoiceDetails] = useState(false);
  const [invoiceSavedMessage, setInvoiceSavedMessage] = useState('');

  const openInvoiceModal = (req: any) => {
    setPrintInvoiceReq(req);
    
    // Find driver in app context
    const drv = drivers?.find(
      (d) =>
        d.id === req.acceptedBy?.driverId ||
        d.id === currentSession?.userId ||
        d.name === req.acceptedBy?.driverName
    );
    
    // Find owner in app context
    const own = owners?.find(
      (o) =>
        o.id === drv?.ownerId ||
        (currentSession?.role === 'propietario' && o.id === currentSession?.userId)
    );

    const bankInfo = drv?.bankInfo || own?.bankInfo;
    
    setInvoiceBankName(bankInfo?.bankName || 'Bancolombia');
    setInvoiceAccountType(bankInfo?.accountType || 'Ahorros');
    setInvoiceAccountNumber(bankInfo?.accountNumber || '108-412356-91');
    setInvoiceHolderName(bankInfo?.holderName || drv?.name || own?.name || currentSession?.name || '');
    setInvoiceHolderId(bankInfo?.holderId || drv?.identification || own?.identification || '');
  };

  const handleSaveInvoiceDetails = () => {
    if (!printInvoiceReq) return;
    setIsSavingInvoiceDetails(true);

    // Find driver in app context
    const drv = drivers?.find(
      (d) =>
        d.id === printInvoiceReq.acceptedBy?.driverId ||
        d.id === currentSession?.userId ||
        d.name === printInvoiceReq.acceptedBy?.driverName
    );

    if (drv) {
      updateDriverProfile(drv.id, {
        bankInfo: {
          bankName: invoiceBankName,
          accountType: invoiceAccountType,
          accountNumber: invoiceAccountNumber,
          holderName: invoiceHolderName,
          holderId: invoiceHolderId,
        }
      });
      setInvoiceSavedMessage('✓ Datos bancarios guardados en el perfil del propietario/conductor.');
      setTimeout(() => setInvoiceSavedMessage(''), 3000);
    }
    setIsSavingInvoiceDetails(false);
  };

  const handleDownloadHTML = () => {
    if (!printInvoiceReq) return;

    const ccNumber = `CC-${printInvoiceReq.id.substring(4, 10).toUpperCase()}`;
    const formattedAmount = formatCOP(printInvoiceReq.paymentAmount);
    const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const serviceDateFormatted = formatDateDDMMYYYY(printInvoiceReq.serviceDate);

    const valorEnLetras = 
      printInvoiceReq.paymentAmount === 11900 ? 'ONCE MIL NOVECIENTOS PESOS M/CTE' :
      printInvoiceReq.paymentAmount === 119000 ? 'CIENTO DIECINUEVE MIL PESOS M/CTE' :
      printInvoiceReq.paymentAmount === 1190000 ? 'UN MILLÓN CIENTO NOVENTA MIL PESOS M/CTE' :
      printInvoiceReq.paymentAmount === 850000 ? 'OCHOCIENTOS CINCUENTA MIL PESOS M/CTE' :
      printInvoiceReq.paymentAmount === 450000 ? 'CUATROCIENTOS CINCUENTA MIL PESOS M/CTE' :
      printInvoiceReq.paymentAmount === 600000 ? 'SEISCIENTOS MIL PESOS M/CTE' :
      printInvoiceReq.paymentAmount === 1200000 ? 'UN MILLÓN DOSCIENTOS MIL PESOS M/CTE' :
      `${printInvoiceReq.paymentAmount.toLocaleString('es-CO')} PESOS M/CTE`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cuenta de Cobro ${ccNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .sheet {
      background: white;
      max-width: 800px;
      margin: 0 auto;
      padding: 50px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      box-sizing: border-box;
      min-height: 297mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 5px 0 0 0;
    }
    .doc-num {
      background: #f1f5f9;
      color: #1e3a5f;
      font-weight: 800;
      padding: 8px 15px;
      border-radius: 6px;
      font-size: 16px;
      text-align: right;
    }
    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 15px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 30px;
    }
    .meta-box strong {
      color: #059669;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      font-size: 13px;
      margin-bottom: 30px;
    }
    .party-col {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .party-title {
      font-weight: 800;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .party-name {
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .concept-box {
      background: #fafafb;
      border: 1px solid #f1f5f9;
      padding: 20px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 30px;
    }
    .bank-box {
      background: #f0f7ff;
      border: 1px solid #e0f2fe;
      padding: 20px;
      border-radius: 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      font-size: 13px;
      margin-bottom: 30px;
    }
    .bank-item span {
      display: block;
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
    }
    .bank-item strong {
      color: #1e293b;
    }
    .letters-box {
      background: #f1f5f9;
      padding: 12px 15px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      border: 1px solid #e2e8f0;
      margin-bottom: 30px;
    }
    .footer-section {
      border-top: 1px solid #e2e8f0;
      padding-top: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 12px;
    }
    .legal-text {
      max-width: 400px;
      color: #64748b;
      font-size: 11px;
    }
    .signature-box {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-bottom: 1px solid #94a3b8;
      height: 40px;
      margin-bottom: 10px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .sheet {
        box-shadow: none;
        border: none;
        padding: 0;
      }
      .print-btn-bar {
        display: none !important;
      }
    }
    .print-btn-bar {
      max-width: 800px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn {
      background: #059669;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
    }
    .btn:hover {
      background: #047857;
    }
  </style>
</head>
<body>
  <div class="print-btn-bar">
    <button class="btn" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
  </div>
  <div class="sheet">
    <div>
      <div class="header">
        <div>
          <h2 class="title">Cuenta de Cobro</h2>
          <p class="subtitle">Soporte Oficial de Prestación de Servicios de Transporte Especial Ocasional</p>
        </div>
        <div>
          <div class="doc-num">\${ccNumber}</div>
          <p style="margin: 5px 0 0 0; font-size: 11px; color: #94a3b8; text-align: right;">Bogotá D.C., Colombia</p>
        </div>
      </div>

      <div class="meta-box">
        <div><strong>FECHA DE EMISIÓN:</strong> \${dateStr}</div>
        <div><strong>VALOR TOTAL ACORDADO:</strong> <strong>\${formattedAmount} COP</strong></div>
      </div>

      <div class="parties">
        <div class="party-col">
          <span class="party-title">Debe a (Prestador):</span>
          <span class="party-name">\${invoiceHolderName || 'Conductor / Propietario'}</span>
          <div>C.C. / NIT: <strong>\${invoiceHolderId || 'No registrado'}</strong></div>
          <div>Celular: <strong>\${printInvoiceReq.acceptedBy?.driverPhone || 'No registrado'}</strong></div>
          <div>Servicio: <strong>Transporte Terrestre Especial Ocasional</strong></div>
        </div>
        <div class="party-col" style="border-left: 1px solid #e2e8f0; padding-left: 40px;">
          <span class="party-title">Dirigida a (Cliente):</span>
          <span class="party-name" style="color: #1e3a5f;">\${printInvoiceReq.companyName || 'Empresa Contratante'}</span>
          <div>Ruta contratada: <strong>\${printInvoiceReq.pickupLocation} ➔ \${printInvoiceReq.destinationLocation}</strong></div>
          <div>NIT: <strong>\${printInvoiceReq.companyNit || '901.412.356-8'}</strong></div>
          <div>Coordinador: <strong>\${printInvoiceReq.coordinatorName || 'Coordinador General'}</strong></div>
        </div>
      </div>

      <div class="concept-box">
        <span class="party-title">Concepto Detallado</span>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #334155;">
          Por concepto de prestación de servicios de transporte terrestre especial ocasional de pasajeros, prestado el día <strong>\${serviceDateFormatted}</strong> a las <strong>\${printInvoiceReq.serviceTime}</strong>.
        </p>
        <div style="display: flex; gap: 30px; margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e2e8f0; font-size: 11px; color: #64748b;">
          <div><strong>Vehículo:</strong> \${printInvoiceReq.acceptedBy?.vehicleType || 'Minivan/Bus'} - Placa \${printInvoiceReq.acceptedBy?.vehiclePlate || 'N/A'}</div>
          <div><strong>Grupo:</strong> \${printInvoiceReq.passengerCount} pasajeros</div>
        </div>
      </div>

      <div class="bank-box">
        <div class="bank-item">
          <span>Entidad Bancaria</span>
          <strong>\${invoiceBankName}</strong>
        </div>
        <div class="bank-item">
          <span>Tipo de Cuenta</span>
          <strong>\${invoiceAccountType}</strong>
        </div>
        <div class="bank-item">
          <span>Número de Cuenta</span>
          <strong style="color: #059669; font-size: 15px;">\${invoiceAccountNumber}</strong>
        </div>
        <div class="bank-item">
          <span>Titular de la Cuenta</span>
          <strong>\${invoiceHolderName}</strong>
        </div>
      </div>

      <div class="letters-box">
        <span style="font-weight: normal; color: #64748b; font-size: 10px; display: block; margin-bottom: 2px;">SUMA EN LETRAS</span>
        \${valorEnLetras}
      </div>
    </div>

    <div class="footer-section">
      <div class="legal-text">
        Esta cuenta de cobro digital presta mérito ejecutivo y soporte legal de acuerdo con las normas comerciales colombianas aplicables al transporte especial ocasional.
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <strong style="display: block; color: #0f172a;">\${invoiceHolderName}</strong>
        <span style="color: #64748b; font-size: 11px;">C.C. \${invoiceHolderId}</span>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cuenta_Cobro_\${ccNumber}_\${printInvoiceReq.companyName.replace(/\\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRespond = (requestId: string, action: 'aceptar' | 'rechazar' | 'cancelar_servicio', reason?: string) => {
    const res = respondRequestModification(requestId, action, reason);
    if (res.success) {
      setActionFeedback({
        id: requestId,
        message: res.message || (action === 'aceptar' ? 'Modificación aceptada' : action === 'cancelar_servicio' ? 'Servicio cancelado' : 'Modificación rechazada'),
        type: action === 'aceptar' ? 'success' : action === 'cancelar_servicio' ? 'error' : 'info',
      });
      setCancellingRequestId(null);
      setCancelReasonText('');
      setTimeout(() => {
        setActionFeedback(null);
      }, 5000);
    }
  };

  // Filter requests accepted by this driver
  const myAcceptedServices = requests.filter(
    (r) =>
      r.status === 'aceptada' &&
      r.acceptedBy &&
      (r.acceptedBy.driverId === currentSession?.userId ||
        r.acceptedBy.driverName === currentSession?.name)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mis Servicios Aceptados</h2>
          <p className="text-xs text-slate-500">
            Viajes confirmados para tu vehículo con datos de contacto directo de los coordinadores de empresa.
          </p>
        </div>

        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 shrink-0 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{myAcceptedServices.length} servicios confirmados</span>
        </span>
      </div>

      {myAcceptedServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">
            Aún no has aceptado servicios
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ve a la pestaña "Servicios disponibles" para postularte a los viajes publicados por las empresas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {myAcceptedServices.map((req) => {
            const agreedAmount = req.acceptedBy?.agreedAmount || req.paymentAmount;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Top status bar */}
                <div className="px-6 py-4 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CONFIRMADO Y ASIGNADO</span>
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {req.companyName}
                    </span>
                    {req.pendingModification && req.pendingModification.status === 'pendiente' && (
                      <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>MODIFICACIÓN PENDIENTE DE TU APROBACIÓN</span>
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Tarifa Acordada</span>
                    <span className="text-base font-extrabold text-[#1e3a5f]">
                      {formatCOP(agreedAmount)}
                    </span>
                  </div>
                </div>

                {/* Banner de Feedback si respondió */}
                {actionFeedback && actionFeedback.id === req.id && (
                  <div
                    className={`px-6 py-3 border-b text-xs font-bold flex items-center gap-2 ${
                      actionFeedback.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionFeedback.message}</span>
                  </div>
                )}

                {/* ALERTA DE PROPUESTA DE MODIFICACIÓN MUTUA PENDIENTE */}
                {req.pendingModification && req.pendingModification.status === 'pendiente' && (() => {
                  const mod = req.pendingModification;
                  const prev = mod.previousValues;
                  const prop = mod.proposedChanges;

                  const changesList: { label: string; from: string; to: string }[] = [];

                  if (prop.serviceDate && prop.serviceDate !== prev.serviceDate) {
                    changesList.push({
                      label: 'Fecha del viaje',
                      from: formatDateDDMMYYYY(prev.serviceDate),
                      to: formatDateDDMMYYYY(prop.serviceDate),
                    });
                  }
                  if (prop.serviceTime && prop.serviceTime !== prev.serviceTime) {
                    changesList.push({
                      label: 'Hora de recogida',
                      from: prev.serviceTime,
                      to: prop.serviceTime,
                    });
                  }
                  if (prop.pickupLocation && prop.pickupLocation !== prev.pickupLocation) {
                    changesList.push({
                      label: 'Punto de recogida',
                      from: prev.pickupLocation,
                      to: prop.pickupLocation,
                    });
                  }
                  if (prop.destinationLocation && prop.destinationLocation !== prev.destinationLocation) {
                    changesList.push({
                      label: 'Destino',
                      from: prev.destinationLocation,
                      to: prop.destinationLocation,
                    });
                  }
                  if (prop.passengerCount !== undefined && prop.passengerCount !== prev.passengerCount) {
                    changesList.push({
                      label: 'Cantidad de pasajeros',
                      from: `${prev.passengerCount} personas`,
                      to: `${prop.passengerCount} personas`,
                    });
                  }
                  if (prop.paymentAmount !== undefined && prop.paymentAmount !== prev.paymentAmount) {
                    changesList.push({
                      label: 'Tarifa acordada',
                      from: formatCOP(prev.paymentAmount),
                      to: formatCOP(prop.paymentAmount),
                    });
                  }
                  if (prop.paymentTerm && prop.paymentTerm !== prev.paymentTerm) {
                    changesList.push({
                      label: 'Plazo de pago',
                      from: prev.paymentTerm,
                      to: prop.paymentTerm,
                    });
                  }
                  if (prop.returnDate !== undefined && prop.returnDate !== (prev.returnDate || '')) {
                    changesList.push({
                      label: 'Fecha de retorno',
                      from: prev.returnDate ? formatDateDDMMYYYY(prev.returnDate) : 'No definida',
                      to: prop.returnDate ? formatDateDDMMYYYY(prop.returnDate) : 'Sin retorno',
                    });
                  }
                  if (prop.coordinatorPhone && prop.coordinatorPhone !== prev.coordinatorPhone) {
                    changesList.push({
                      label: 'Teléfono de contacto',
                      from: prev.coordinatorPhone,
                      to: prop.coordinatorPhone,
                    });
                  }

                  return (
                    <div className="mx-6 mt-6 p-5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                              <span>Propuesta de Modificación de Condiciones</span>
                              <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                Acuerdo Mutuo Requerido
                              </span>
                            </h4>
                            <p className="text-xs text-amber-800 mt-0.5">
                              La empresa <strong>{req.companyName}</strong> solicita cambiar los términos pactados originalmente. De acuerdo a las normas,{' '}
                              <strong>ninguna condición puede modificarse sin tu aprobación</strong>.
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg self-start sm:self-auto font-medium">
                          Solicitado: {new Date(mod.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Motivo explicado por la empresa */}
                      {mod.reason && (
                        <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-amber-950 shadow-2xs">
                          <span className="font-bold text-[10px] uppercase text-amber-700 tracking-wider block mb-1">
                            Mensaje / Justificación de la empresa:
                          </span>
                          <p className="italic">"{mod.reason}"</p>
                        </div>
                      )}

                      {/* Comparativa de cambios */}
                      <div>
                        <div className="text-[11px] font-bold uppercase text-amber-900 tracking-wider mb-2">
                          Cambios solicitados en este viaje:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {changesList.map((ch, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white rounded-xl border border-amber-200 text-xs shadow-2xs flex flex-col justify-between"
                            >
                              <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block mb-1">
                                {ch.label}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap font-medium">
                                <span className="line-through text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded">
                                  {ch.from}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {ch.to}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botones de Aceptar, Rechazar o Cancelar Servicio */}
                      <div className="flex flex-col gap-3 pt-3 border-t border-amber-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-amber-900">
                          <span>
                            Como contraparte asignada, puedes <strong>aceptar</strong> los nuevos términos, <strong>rechazarlos</strong> para mantener el acuerdo original, o <strong>cancelar el servicio</strong> si las nuevas condiciones no te permiten prestar el viaje.
                          </span>
                        </div>

                        {cancellingRequestId === req.id ? (
                          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-3">
                            <div className="flex items-start gap-2">
                              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                              <div className="text-xs text-rose-900">
                                <strong className="font-bold block">¿Confirmas la cancelación de este servicio?</strong>
                                Esta acción cancelará definitivamente el viaje y notificará de forma inmediata a la empresa contratante {req.companyName}.
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-rose-800 mb-1">
                                Motivo de cancelación por modificación (opcional):
                              </label>
                              <input
                                type="text"
                                value={cancelReasonText}
                                onChange={(e) => setCancelReasonText(e.target.value)}
                                placeholder="Ej: No dispongo de horario para la nueva fecha/hora solicitada..."
                                className="w-full px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                              />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCancellingRequestId(null);
                                  setCancelReasonText('');
                                }}
                                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                              >
                                Volver
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRespond(req.id, 'cancelar_servicio', cancelReasonText)}
                                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Confirmar Cancelación del Servicio</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-2 w-full pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setCancellingRequestId(req.id);
                                setCancelReasonText('');
                              }}
                              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              title="Cancelar este servicio definitivamente ante la solicitud de cambios"
                            >
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
                              <span>Cancelar Servicio</span>
                            </button>

                            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                              <button
                                type="button"
                                onClick={() => handleRespond(req.id, 'rechazar')}
                                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <X className="w-4 h-4 text-slate-500" />
                                <span>Rechazar Cambios</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRespond(req.id, 'aceptar')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-4 h-4 text-white" />
                                <span>Aceptar Modificación</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="p-6 space-y-6">
                  {/* --- MÓDULO DE REPORTES DE ESTADO DE SERVICIO --- */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${req.trackingState?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          {req.trackingState?.isActive ? '⚡ Servicio en curso / Actualización de estado' : '💤 Esperando inicio del servicio'}
                        </span>
                      </div>
                      
                      {/* CUENTA DE COBRO DISPONIBLE PARA IMPRIMIR */}
                      {req.serviceCategory === 'ocasional' && (req.trackingState?.currentStatus === 'servicio terminado' || (!req.trackingState?.isActive && req.trackingState?.currentStatus === 'servicio terminado')) && (
                        <button
                          type="button"
                          onClick={() => openInvoiceModal(req)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all animate-bounce"
                        >
                          <Printer className="w-4 h-4 text-white" />
                          <span>Imprimir Cuenta de Cobro 🧾</span>
                        </button>
                      )}
                    </div>

                    {!req.trackingState?.isActive && req.trackingState?.currentStatus !== 'finalizado el servicio' && req.trackingState?.currentStatus !== 'servicio terminado' && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/60">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-950">¿Listo para iniciar tu ruta?</h4>
                          <p className="text-[11px] text-slate-500 leading-normal max-w-md">
                            Al iniciar el servicio, podrás ir reportando en tiempo real cada fase del viaje para mantener informada a la empresa contratante.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const initialStatus = req.serviceCategory === 'ocasional'
                              ? 'en camino a punto de recogida'
                              : 'en camino a recoger';
                            updateServiceTracking(req.id, true, initialStatus);
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-sm transition-colors cursor-pointer text-center"
                        >
                          Iniciar Servicio
                        </button>
                      </div>
                    )}

                    {!req.trackingState?.isActive && (req.trackingState?.currentStatus === 'finalizado el servicio' || req.trackingState?.currentStatus === 'servicio terminado') && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-4 rounded-xl text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>¡Servicio Finalizado Exitosamente!</span>
                          </div>
                          {req.serviceCategory === 'ocasional' && (
                            <button
                              type="button"
                              onClick={() => openInvoiceModal(req)}
                              className="px-3.5 py-1.5 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-amber-400" />
                              <span>Generar Cuenta de Cobro</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-800/85">
                          El viaje ha concluido formalmente. El reporte y la bitácora de cumplimiento han sido compartidos con la empresa contratante para su correspondiente registro de operaciones.
                        </p>
                      </div>
                    )}

                    {req.trackingState?.isActive && (() => {
                      const isOcasional = req.serviceCategory === 'ocasional';
                      const steps = isOcasional
                        ? [
                            'en camino a punto de recogida',
                            'en punto de recogida',
                            'pasajeros abordando',
                            'inicio recorrido',
                            'en lugar de destino',
                            'iniciando regreso',
                            'servicio terminado'
                          ]
                        : [
                            'en camino a recoger',
                            'personal abordando',
                            'en ruta hacia destino',
                            'en destino',
                            'finalizado el servicio'
                          ];
                      
                      const currentStatus = req.trackingState.currentStatus || steps[0];
                      const curIndex = steps.indexOf(currentStatus);
                      const totalSteps = steps.length;
                      
                      // Calculate percentage for active bar
                      const percentage = totalSteps > 1 ? `${(curIndex / (totalSteps - 1)) * 100}%` : '0%';

                      return (
                        <div className="space-y-4">
                          {/* Estado Actual */}
                          <div className="bg-white p-3 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">Fase actual del servicio:</span>
                            <span className="font-extrabold text-[#1e3a5f] uppercase tracking-wider bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md text-[11px] border border-blue-100">
                              {currentStatus}
                            </span>
                          </div>

                          {/* Stepper Visual de Estados */}
                          <div className="relative pt-4 pb-2 px-2">
                            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2" />
                            
                            {/* Línea de progreso activa */}
                            <div
                              className="absolute top-1/2 left-4 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-500"
                              style={{ width: `calc(${percentage} - 16px)` }}
                            />

                            <div className="relative flex justify-between">
                              {steps.map((stepName, idx) => {
                                const isCompleted = curIndex >= idx;
                                const isActive = curIndex === idx;
                                
                                let stepLabel = '';
                                if (isOcasional) {
                                  if (idx === 0) stepLabel = 'En camino';
                                  else if (idx === 1) stepLabel = 'En Punto (Foto)';
                                  else if (idx === 2) stepLabel = 'Abordando';
                                  else if (idx === 3) stepLabel = 'Inicio';
                                  else if (idx === 4) stepLabel = 'En Destino';
                                  else if (idx === 5) stepLabel = 'Regreso';
                                  else if (idx === 6) stepLabel = 'Terminado';
                                } else {
                                  if (idx === 0) stepLabel = 'En camino';
                                  else if (idx === 1) stepLabel = 'Abordando';
                                  else if (idx === 2) stepLabel = 'En Ruta';
                                  else if (idx === 3) stepLabel = 'En Destino';
                                  else if (idx === 4) stepLabel = 'Finalizado';
                                }

                                return (
                                  <div key={stepName} className="flex flex-col items-center flex-1">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-xs font-black z-10 ${
                                      isActive 
                                        ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-sm scale-110' 
                                        : isCompleted 
                                        ? 'bg-emerald-500 border-emerald-600 text-white' 
                                        : 'bg-white border-slate-300 text-slate-400'
                                    }`}>
                                      {isCompleted && !isActive ? '✓' : idx + 1}
                                    </div>
                                    <span className="text-[8px] font-extrabold text-slate-500 mt-1 uppercase text-center hidden sm:block max-w-[70px] truncate leading-tight">
                                      {stepLabel}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* REQUERIMIENTO ESPECIAL: FOTO DE EVIDENCIA EN PUNTO DE RECOGIDA */}
                          {isOcasional && currentStatus === 'en punto de recogida' && (
                            <div className="bg-amber-50/75 border border-amber-200/80 rounded-xl p-4 space-y-3">
                              <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                                <Camera className="w-4 h-4 text-amber-600" />
                                <span>📸 Foto de Evidencia de Llegada Requerida</span>
                              </div>
                              <p className="text-[11px] text-amber-800 leading-normal">
                                Es obligatorio registrar una foto de soporte en el punto de recogida para asegurar que la unidad ha llegado y dar paso al abordaje.
                              </p>

                              {req.trackingState?.proofPhotoUrl ? (
                                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-200">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                    <img 
                                      src={req.trackingState.proofPhotoUrl} 
                                      alt="Evidencia cargada" 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <span className="text-emerald-800 font-bold text-xs block">✓ Evidencia registrada correctamente</span>
                                    <span className="text-[10px] text-slate-400 block">Imagen lista. El paso de abordaje se encuentra desbloqueado.</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'en punto de recogida', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80');
                                    }}
                                    className="text-xs text-[#1e3a5f] hover:underline font-bold px-2 py-1 bg-slate-100 rounded-md cursor-pointer"
                                  >
                                    Cambiar
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Simulate camera photo instantly with a high-fidelity image
                                      updateServiceTracking(
                                        req.id, 
                                        true, 
                                        'en punto de recogida', 
                                        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80'
                                      );
                                    }}
                                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                  >
                                    <Camera className="w-4 h-4" />
                                    <span>Tomar Foto (Simular Cámara)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(
                                        req.id, 
                                        true, 
                                        'en punto de recogida', 
                                        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80'
                                      );
                                    }}
                                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Cargar Archivo</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Botones de Acción de Transición de Estado */}
                          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-200">
                            {/* ESTADOS OCASIONALES */}
                            {isOcasional && (
                              <>
                                {currentStatus === 'en camino a punto de recogida' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'en punto de recogida');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Siguiente Estado: En punto de recogida ➔
                                  </button>
                                )}
                                {currentStatus === 'en punto de recogida' && (
                                  <button
                                    type="button"
                                    disabled={!req.trackingState?.proofPhotoUrl}
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'pasajeros abordando');
                                    }}
                                    className={`w-full sm:w-auto px-4 py-2 text-white text-xs font-black rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                                      req.trackingState?.proofPhotoUrl 
                                        ? 'bg-[#1e3a5f] hover:bg-[#142842] cursor-pointer shadow-sm' 
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                                    }`}
                                    title={!req.trackingState?.proofPhotoUrl ? "Debes subir la foto de evidencia antes de continuar" : "Continuar"}
                                  >
                                    <span>Siguiente Estado: Pasajeros abordando ➔</span>
                                    {!req.trackingState?.proofPhotoUrl && <span className="text-[9px] bg-slate-400 text-white px-1 py-0.2 rounded-sm uppercase tracking-wider font-bold">Foto Obligatoria</span>}
                                  </button>
                                )}
                                {currentStatus === 'pasajeros abordando' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'inicio recorrido');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Siguiente Estado: Inicio recorrido ➔
                                  </button>
                                )}
                                {currentStatus === 'inicio recorrido' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'en lugar de destino');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Siguiente: En lugar de destino ➔
                                  </button>
                                )}
                                {currentStatus === 'en lugar de destino' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'iniciando regreso');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Siguiente: Iniciando regreso ➔
                                  </button>
                                )}
                                {currentStatus === 'iniciando regreso' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, false, 'servicio terminado');
                                    }}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                                  >
                                    <span>✓ Finalizar Servicio y Generar Cuenta de Cobro</span>
                                  </button>
                                )}
                              </>
                            )}

                            {/* ESTADOS ESTÁNDAR (RUTAS FIJAS) */}
                            {!isOcasional && (
                              <>
                                {currentStatus === 'en camino a recoger' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'personal abordando');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Siguiente Estado: Personal Abordando ➔
                                  </button>
                                )}
                                {currentStatus === 'personal abordando' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'en ruta hacia destino');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Siguiente Estado: En Ruta hacia Destino ➔
                                  </button>
                                )}
                                {currentStatus === 'en ruta hacia destino' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, true, 'en destino');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    Siguiente Estado: En Destino ➔
                                  </button>
                                )}
                                {currentStatus === 'en destino' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateServiceTracking(req.id, false, 'finalizado el servicio');
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                                  >
                                    ✓ Finalizar y Cerrar Servicio
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Route & metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                          A
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Punto de Recogida
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
                            Destino
                          </div>
                          <div className="text-sm font-bold text-slate-900">{req.destinationLocation}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Fecha del Viaje:</span>
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
                        <span className="text-slate-400 block text-[10px]">Plazo de Pago:</span>
                        <span className="font-semibold text-slate-800">{req.paymentTerm}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contacto directo revelado del coordinador */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-950">
                          Coordinador de la Empresa: {req.coordinatorName}
                        </div>
                        <div className="text-[11px] text-blue-700">
                          Comunícate para coordinar detalles de planilla FUEC, pasajeros y lista de viaje.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`tel:${req.coordinatorPhone}`}
                        className="px-3.5 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Llamar: {req.coordinatorPhone}</span>
                      </a>

                      <a
                        href={`https://wa.me/57${req.coordinatorPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${req.coordinatorName}, soy el conductor asignado al servicio ${req.pickupLocation} ➔ ${req.destinationLocation} para el ${formatDateDDMMYYYY(req.serviceDate)}. Me comunico para coordinar detalles.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Abrir chat de WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white/20 text-white" />
                        <span>Escribir a WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL DE CUENTA DE COBRO IMPRIMIBLE --- */}
      {printInvoiceReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white overflow-y-auto print-modal-container">
          {/* Dynamic styles to override printing */}
          <style>{`
            @media print {
              /* Ocultar barra de navegación, pie de página y resto del panel del conductor */
              nav, footer, header, aside, .print-hidden, .print\:hidden,
              .space-y-6 > div:not(.print-modal-container),
              .space-y-6 > h1,
              .space-y-6 > p,
              div[class*="bg-amber-400"],
              div[class*="bg-[#1e3a5f]"],
              div[class*="bg-white rounded-2xl"] {
                display: none !important;
              }

              /* Resetear contenedores base para flujo continuo sin recortes */
              html, body, #root, main, .min-h-screen {
                background: white !important;
                color: black !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
                position: static !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
              }

              main {
                max-width: 100% !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
              }

              /* Transformar el modal fijo de fondo en un bloque de flujo natural */
              .print-modal-container {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: 100% !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
                overflow: visible !important;
                z-index: 999999 !important;
                box-shadow: none !important;
              }

              /* Expandir la tarjeta del documento */
              .bg-white.w-full.max-w-5xl {
                max-width: 100% !important;
                width: 100% !important;
                max-height: none !important;
                height: auto !important;
                border: none !important;
                box-shadow: none !important;
                display: block !important;
                overflow: visible !important;
                background: white !important;
                border-radius: 0 !important;
              }

              /* Ocultar el formulario lateral de edición */
              .w-full.md\:w-80 {
                display: none !important;
              }

              /* Ocultar botones de acción y barras superiores de previsualización */
              .print\:hidden, .print-hidden, [class*="pb-4 border-b"] {
                display: none !important;
              }

              /* Contenedor de la hoja de cuenta de cobro */
              .flex-1.bg-slate-100 {
                background: white !important;
                padding: 0 !important;
                overflow: visible !important;
                display: block !important;
                height: auto !important;
              }

              /* Ajuste de márgenes y estilo oficial para hoja Carta */
              #printable-invoice-sheet {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 1.5cm !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                box-sizing: border-box !important;
                color: black !important;
                min-height: 0 !important;
              }
            }
          `}</style>

          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 max-h-[90vh] flex flex-col md:flex-row print:max-h-none print:shadow-none print:border-none print:rounded-none">
            
            {/* Editor Sidebar (Left) */}
            <div className="w-full md:w-80 bg-slate-50 p-5 border-b md:border-b-0 md:border-r border-slate-200 space-y-4 print:hidden shrink-0 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Datos de Transferencia</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Registra los datos bancarios del propietario o conductor asignado para que aparezcan en la cuenta de cobro oficial.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Banco Destinatario</label>
                    <input
                      type="text"
                      value={invoiceBankName}
                      onChange={(e) => setInvoiceBankName(e.target.value)}
                      placeholder="Ej. Bancolombia, Banco de Bogotá"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Tipo Cuenta</label>
                      <select
                        value={invoiceAccountType}
                        onChange={(e) => setInvoiceAccountType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Ahorros">Ahorros</option>
                        <option value="Corriente">Corriente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Número Cuenta</label>
                      <input
                        type="text"
                        value={invoiceAccountNumber}
                        onChange={(e) => setInvoiceAccountNumber(e.target.value)}
                        placeholder="000-00000-00"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Nombre del Titular</label>
                    <input
                      type="text"
                      value={invoiceHolderName}
                      onChange={(e) => setInvoiceHolderName(e.target.value)}
                      placeholder="Titular de la cuenta"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Identificación Titular (NIT/CC)</label>
                    <input
                      type="text"
                      value={invoiceHolderId}
                      onChange={(e) => setInvoiceHolderId(e.target.value)}
                      placeholder="Ej. 1.020.123.456 o 901.123.456-1"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {invoiceSavedMessage && (
                  <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 animate-pulse">
                    {invoiceSavedMessage}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSaveInvoiceDetails}
                  disabled={isSavingInvoiceDetails}
                  className="w-full py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isSavingInvoiceDetails ? 'Guardando...' : 'Guardar en Perfil Conductor'}
                </button>
                <button
                  type="button"
                  onClick={() => setPrintInvoiceReq(null)}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Volver al Panel
                </button>
              </div>
            </div>

            {/* Document Preview (Right) */}
            <div className="flex-1 bg-slate-100 p-6 overflow-y-auto flex flex-col print:bg-white print:p-0">
              
              {/* Header actions (Print, Close) */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-4 print:hidden flex-wrap gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Vista Previa de Impresión Oficial (Carta)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    💡 Si el navegador bloquea la impresión por el iFrame, usa "Descargar HTML Imprimible".
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleDownloadHTML}
                    className="px-3.5 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Guarda la cuenta en tu equipo para abrirla e imprimirla con total libertad sin bloqueos del visualizador."
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar HTML Imprimible</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.focus();
                        window.print();
                      } catch (e) {
                        console.error("Iframe print blocked: ", e);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer transform hover:scale-[1.02]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Directo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintInvoiceReq(null)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    ✖ Cerrar
                  </button>
                </div>
              </div>

              {/* The Corporate Invoice Sheet */}
              <div 
                id="printable-invoice-sheet"
                className="w-full max-w-2xl mx-auto bg-white shadow-xl p-10 border border-slate-300/40 rounded-xl flex flex-col justify-between text-slate-900 leading-relaxed font-serif text-sm print:shadow-none print:border-none print:rounded-none print:p-0"
                style={{ minHeight: '29.7cm' }}
              >
                {/* Header Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                    <div>
                      <h2 className="text-xl font-bold font-sans text-slate-900 uppercase tracking-tight">Cuenta de Cobro</h2>
                      <p className="text-xs font-sans text-slate-500 mt-1">Soporte Digital de Prestación de Servicios de Transporte Ocasional</p>
                    </div>
                    <div className="text-right font-sans text-xs">
                      <div className="font-extrabold text-[#1e3a5f] bg-slate-100 px-3 py-1.5 rounded text-sm">
                        No. CC-{printInvoiceReq.id.substring(4, 10).toUpperCase()}
                      </div>
                      <div className="text-slate-400 mt-2">Bogotá D.C., Colombia</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex justify-between text-xs font-sans text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-500">FECHA DE EMISIÓN:</span> {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">VALOR TOTAL ACORDADO:</span> <span className="font-black text-emerald-700">{formatCOP(printInvoiceReq.paymentAmount)} COP</span>
                    </div>
                  </div>

                  {/* Parties (To / From) */}
                  <div className="grid grid-cols-2 gap-6 text-xs font-sans pt-2">
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-500 uppercase tracking-wider text-[10px]">DEBE A (PRESTADOR):</h4>
                      <div className="font-bold text-slate-950 text-sm">{invoiceHolderName || 'Conductor / Propietario'}</div>
                      <div>C.C. / NIT: <span className="font-semibold">{invoiceHolderId || 'No registrado'}</span></div>
                      <div>Celular: <span className="font-semibold">{printInvoiceReq.acceptedBy?.driverPhone || 'No registrado'}</span></div>
                      <div>Servicio: <span className="font-semibold">Transporte Terrestre Especial Ocasional</span></div>
                    </div>

                    <div className="space-y-1 border-l border-slate-200 pl-6">
                      <h4 className="font-black text-slate-500 uppercase tracking-wider text-[10px]">DIRIGIDA A (CLIENTE):</h4>
                      <div className="font-bold text-[#1e3a5f] text-sm">{printInvoiceReq.companyName || 'Empresa Contratante'}</div>
                      <div>Ruta contratada: <span className="font-semibold">{printInvoiceReq.pickupLocation} ➔ {printInvoiceReq.destinationLocation}</span></div>
                      <div>NIT: <span className="font-semibold">{printInvoiceReq.companyNit || '901.412.356-8'}</span></div>
                      <div>Coordinador: <span className="font-semibold">{printInvoiceReq.coordinatorName || 'Coordinador General'}</span></div>
                    </div>
                  </div>

                  {/* Concept Section */}
                  <div className="space-y-3 pt-6">
                    <h3 className="font-bold text-xs uppercase tracking-wider font-sans text-slate-500">CONCEPTO DETALLADO</h3>
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-xs text-slate-700 font-sans space-y-2">
                      <p className="leading-normal">
                        Por concepto de prestación de servicios de transporte terrestre especial ocasional de pasajeros, prestado el día <strong>{formatDateDDMMYYYY(printInvoiceReq.serviceDate)}</strong> a las <strong>{printInvoiceReq.serviceTime}</strong>.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-[11px] border-t border-slate-200/60 pt-2 mt-2">
                        <div>
                          <strong>Vehículo:</strong> {printInvoiceReq.acceptedBy?.vehicleType || 'Minivan/Bus'} - Placa {printInvoiceReq.acceptedBy?.vehiclePlate || 'N/A'}
                        </div>
                        <div>
                          <strong>Grupo:</strong> {printInvoiceReq.passengerCount} pasajeros a bordo
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3 pt-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider font-sans text-slate-500">INFORMACIÓN DE PAGO / TRANSFERENCIA</h3>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">
                      El valor de este servicio se debe transferir electrónicamente en un plazo de <strong>{printInvoiceReq.paymentTerm || '30 días'}</strong> bajo los siguientes datos de cuenta autorizados:
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs font-sans bg-[#1e3a5f]/5 p-4 rounded-xl border border-[#1e3a5f]/10">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Entidad Bancaria:</span>
                        <strong className="text-slate-800">{invoiceBankName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tipo de Cuenta:</span>
                        <strong className="text-slate-800">{invoiceAccountType}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Número de Cuenta:</span>
                        <strong className="text-emerald-700 tracking-wider">{invoiceAccountNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Titular:</span>
                        <strong className="text-slate-800">{invoiceHolderName}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Value in Letters */}
                  <div className="p-3 bg-slate-100/50 text-slate-800 font-sans text-xs rounded-lg font-bold border border-slate-200/50">
                    <span className="text-slate-500 font-normal">SUMA EN LETRAS:</span> {
                      printInvoiceReq.paymentAmount === 11900 ? 'ONCE MIL NOVECIENTOS PESOS M/CTE' :
                      printInvoiceReq.paymentAmount === 119000 ? 'CIENTO DIECINUEVE MIL PESOS M/CTE' :
                      printInvoiceReq.paymentAmount === 1190000 ? 'UN MILLÓN CIENTO NOVENTA MIL PESOS M/CTE' :
                      printInvoiceReq.paymentAmount === 850000 ? 'OCHOCIENTOS CINCUENTA MIL PESOS M/CTE' :
                      printInvoiceReq.paymentAmount === 450000 ? 'CUATROCIENTOS CINCUENTA MIL PESOS M/CTE' :
                      printInvoiceReq.paymentAmount === 600000 ? 'SEISCIENTOS MIL PESOS M/CTE' :
                      printInvoiceReq.paymentAmount === 1200000 ? 'UN MILLÓN DOSCIENTOS MIL PESOS M/CTE' :
                      `${printInvoiceReq.paymentAmount.toLocaleString('es-CO')} PESOS M/CTE`
                    }
                  </div>
                </div>

                {/* Footer and Signature */}
                <div className="pt-10 border-t border-slate-200 flex justify-between items-end font-sans text-xs">
                  <div className="space-y-4 max-w-sm">
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Esta cuenta de cobro digital presta mérito ejecutivo y soporte legal según la legislación comercial colombiana vigente.
                    </p>
                  </div>
                  <div className="text-center space-y-1 shrink-0">
                    <div className="h-10 border-b border-slate-400 w-44 mx-auto" />
                    <p className="font-extrabold text-slate-900">{invoiceHolderName}</p>
                    <p className="text-[10px] text-slate-500">C.C. {invoiceHolderId}</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
