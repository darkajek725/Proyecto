import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle, VehicleDocumentInfo, Company } from '../types';
import {
  Car,
  Bus,
  Users,
  Building2,
  FileCheck2,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Printer,
  FileText,
  User,
  Check,
  Eye,
  Upload,
  Sparkles,
  Share2,
  X,
  Loader2,
  ExternalLink,
  ChevronRight,
  Gauge,
  Zap,
  Radio,
  Tv,
  Wifi,
  Wind,
  Layers,
  Award,
  Hash,
  Trash2,
  Settings2,
  Edit3,
  Bath,
  Volume2,
  Lightbulb,
  Sun,
  Briefcase,
  ShieldAlert,
  Wrench,
  Activity,
} from 'lucide-react';
import { EditEquipmentModal } from './EditEquipmentModal';
import {
  formatPlateDisplay,
  formatDateDDMMYYYY,
  formatDateTime,
  getDaysUntilExpiration,
  readFileAsDataUrl,
} from '../utils/formatters';
import { generatePdfFromElement, printOrDownloadPdf } from '../utils/pdfGenerator';

interface VehicleProfileModalProps {
  vehicleId: string;
  requestingCompanyId?: string | null;
  onClose: () => void;
}

export const VehicleProfileModal: React.FC<VehicleProfileModalProps> = ({
  vehicleId,
  requestingCompanyId,
  onClose,
}) => {
  const {
    vehicles,
    companies,
    owners,
    drivers,
    currentSession,
    updateVehicle,
    deleteVehicle,
    openDriverModal,
    requests,
  } = useApp();

  // Find vehicle by ID or plate
  const vehicle =
    vehicles.find((v) => v.id === vehicleId) ||
    vehicles.find((v) => v.plate.toUpperCase() === vehicleId.toUpperCase());

  // Verify if a company user has an accepted service/request with this vehicle
  const isCompanyUser = currentSession?.role === 'empresa' || currentSession?.role === 'coordinador';
  const userCompanyId = currentSession?.role === 'empresa'
    ? currentSession.userId
    : (currentSession?.role === 'coordinador' ? currentSession.companyId : null);

  const activeCompanyId = userCompanyId || requestingCompanyId;

  const isVehicleServiceAcceptedByThisCompany = !!(vehicle && activeCompanyId && requests.some((req) => {
    if (req.status !== 'aceptada') return false;
    if (req.companyId !== activeCompanyId) return false;
    
    // Check if the service is assigned to this vehicle
    const matchesPlate = req.acceptedBy?.vehiclePlate?.toUpperCase() === vehicle.plate.toUpperCase();
    const matchesPrimaryDriver = vehicle.assignedDriverId && req.acceptedBy?.driverId === vehicle.assignedDriverId;
    const matchesSecondaryDriver = vehicle.secondaryDriverId && req.acceptedBy?.driverId === vehicle.secondaryDriverId;
    
    return matchesPlate || matchesPrimaryDriver || matchesSecondaryDriver;
  }));

  // Decide if the company user is allowed to see the technical sheet (ficha técnica)
  // If the user is a company (or viewed under a company's request), they must have an accepted service with this vehicle
  const isFichaVisible = !(isCompanyUser || requestingCompanyId) || isVehicleServiceAcceptedByThisCompany;

  // Find owner & drivers (Principal & Relevo)
  const owner = vehicle ? owners.find((o) => o.id === vehicle.ownerId) : null;
  const isOwnerOfThisVehicle =
    vehicle &&
    currentSession?.role === 'propietario' &&
    vehicle.ownerId === currentSession.userId;

  const canManageEquipment =
    vehicle &&
    (currentSession?.role === 'empresa' ||
      currentSession?.role === 'propietario' ||
      (currentSession?.role === 'conductor' &&
        (currentSession.assignedVehicleId === vehicle.id || currentSession.assignedPlate === vehicle.plate)));

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [isEditingEquipment, setIsEditingEquipment] = useState(false);

  const driver = vehicle
    ? drivers.find(
        (d) =>
          d.id === vehicle.assignedDriverId ||
          d.assignedVehicleId === vehicle.id ||
          d.assignedVehiclePlate === vehicle.plate
      )
    : null;

  const secondaryDriver = vehicle
    ? drivers.find(
        (d) =>
          d.id === vehicle.secondaryDriverId ||
          d.secondaryVehicleId === vehicle.id ||
          d.secondaryVehiclePlate === vehicle.plate
      )
    : null;

  // Active tab in modal
  const [activeTab, setActiveTab] = useState<'info' | 'documentos' | 'ficha'>('info');

  // Requesting Company state for Ficha Técnica
  const defaultCompanyId =
    requestingCompanyId ||
    (currentSession?.role === 'empresa' ? currentSession.userId : null) ||
    (companies.length > 0 ? companies[0].id : '');

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(defaultCompanyId || '');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [dispatchNote, setDispatchNote] = useState<string>('Vehículo habilitado y verificado para operación de transporte especial empresarial, turístico y escolar.');
  const [includeScannedPreviews, setIncludeScannedPreviews] = useState<boolean>(true);

  // Scanned Document Viewer Modal
  const [viewingDoc, setViewingDoc] = useState<{
    title: string;
    doc: VehicleDocumentInfo;
  } | null>(null);

  // Document upload state
  const [uploadingDocKey, setUploadingDocKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const selectedCompany: Company | undefined =
    companies.find((c) => c.id === selectedCompanyId) || companies[0];

  if (!vehicle) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Vehículo no encontrado</h3>
          <p className="text-xs text-slate-500">
            No se encontró el registro del vehículo solicitado en el sistema.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Calculate overall document health
  const docsList = [
    { key: 'soat', name: 'SOAT', doc: vehicle.soat },
    { key: 'tecnomecanica', name: 'Revisión Técnico-Mecánica (CDA)', doc: vehicle.tecnomecanica },
    { key: 'tarjetaOperacion', name: 'Tarjeta de Operación Mintransporte', doc: vehicle.tarjetaOperacion },
    { key: 'polizaContractual', name: 'Póliza RCC (Contractual)', doc: vehicle.polizaContractual },
    { key: 'polizaExtracontractual', name: 'Póliza RCE (Extracontractual)', doc: vehicle.polizaExtracontractual },
    { key: 'tarjetaPropiedad', name: 'Tarjeta de Propiedad / Licencia Tránsito', doc: vehicle.tarjetaPropiedad },
    { key: 'revisionPreventivaBimestral', name: 'Revisión Preventiva Bimestral', doc: vehicle.revisionPreventivaBimestral },
    { key: 'driverLicense', name: 'Licencia del Conductor Asignado', doc: vehicle.driverLicense },
  ];

  const totalDocs = docsList.length;
  const validDocs = docsList.filter((d) => {
    if (!d.doc?.expirationDate) return false;
    const { status } = getDaysUntilExpiration(d.doc.expirationDate);
    return status === 'vigente' || status === 'proximo_a_vencer';
  }).length;

  const handleTriggerDocUpload = (docKey: string) => {
    setUploadingDocKey(docKey);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingDocKey) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const currentDoc = (vehicle as any)[uploadingDocKey] || {};
      updateVehicle(vehicle.id, {
        [uploadingDocKey]: {
          ...currentDoc,
          scannedUrl: dataUrl,
          documentNumber: currentDoc.documentNumber || `DOC-${Date.now().toString().slice(-6)}`,
          expirationDate: currentDoc.expirationDate || '2027-12-31',
          status: 'vigente',
        },
      });
    } catch (err) {
      console.warn('Error reading file:', err);
    } finally {
      setUploadingDocKey(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const [pdfSuccessToast, setPdfSuccessToast] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    if (activeTab !== 'ficha') {
      setActiveTab('ficha');
      await new Promise((r) => setTimeout(r, 200));
    }

    const printContent = document.getElementById('printable-ficha-tecnica') || printContainerRef.current;
    if (!printContent) return;

    setIsGeneratingPdf(true);
    setPdfStatusMessage('Iniciando generación de PDF...');

    try {
      const companyNameClean = (selectedCompany?.name || 'Empresa').replace(/\s+/g, '_');
      const fileName = `Ficha_Tecnica_${vehicle.plate}_${companyNameClean}.pdf`;
      const title = `Ficha Técnica Vehicular - ${vehicle.plate} - ${selectedCompany?.name || 'Transporte Especial'}`;

      const success = await generatePdfFromElement(printContent, {
        fileName,
        title,
        onProgress: (msg) => setPdfStatusMessage(msg),
      });

      if (success) {
        setPdfSuccessToast('¡Ficha Técnica descargada en formato PDF oficial!');
        setTimeout(() => setPdfSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error('Error al generar PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatusMessage(null);
    }
  };

  const handlePrint = async () => {
    if (activeTab !== 'ficha') {
      setActiveTab('ficha');
      await new Promise((r) => setTimeout(r, 200));
    }

    const printContent = document.getElementById('printable-ficha-tecnica') || printContainerRef.current;
    if (!printContent) return;

    setIsGeneratingPdf(true);
    setPdfStatusMessage('Preparando documento para impresión...');

    try {
      const companyNameClean = (selectedCompany?.name || 'Empresa').replace(/\s+/g, '_');
      const fileName = `Ficha_Tecnica_${vehicle.plate}_${companyNameClean}.pdf`;
      const title = `Ficha Técnica Vehicular - ${vehicle.plate} - ${selectedCompany?.name || 'Transporte Especial'}`;

      const result = await printOrDownloadPdf(printContent, {
        fileName,
        title,
        onProgress: (msg) => setPdfStatusMessage(msg),
      });

      if (result.method === 'download_pdf') {
        setPdfSuccessToast('Ficha Técnica generada y descargada en PDF (entorno protegido).');
        setTimeout(() => setPdfSuccessToast(null), 4500);
      } else {
        setPdfSuccessToast('Diálogo de impresión ejecutado.');
        setTimeout(() => setPdfSuccessToast(null), 3000);
      }
    } catch (err) {
      console.error('Error en impresión:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatusMessage(null);
    }
  };


  const companyLogo = customLogoUrl || selectedCompany?.logo || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Hidden File Input for document upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Main Modal Container */}
      <div className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1e3a5f] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 text-slate-950 px-3 py-1 rounded-lg font-mono font-extrabold text-base tracking-wider shadow-inner">
              {formatPlateDisplay(vehicle.plate)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                  {vehicle.brand}
                </h2>
                {vehicle.internalNumber && (
                  <span className="text-[11px] bg-white/20 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                    No. Interno: {vehicle.internalNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {vehicle.type} • Modelo {vehicle.modelYear} • {vehicle.capacity} Pasajeros • Tarjeta Op.: {vehicle.operatingCardNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageEquipment && (
              <button
                type="button"
                onClick={() => setIsEditingEquipment(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer border border-white/20"
                title="Editar equipamiento de seguridad y confort"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Editar Equipamiento</span>
              </button>
            )}

            {isOwnerOfThisVehicle && (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                title="Eliminar este vehículo"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}

            {isFichaVisible && (
              <button
                type="button"
                onClick={() => setActiveTab('ficha')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Descargar Ficha Técnica</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 overflow-x-auto gap-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-[#1e3a5f] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Ficha y Especificaciones</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documentos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'documentos'
                  ? 'bg-[#1e3a5f] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Documentos y Vencimientos</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  validDocs === totalDocs
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {validDocs}/{totalDocs} al día
              </span>
            </button>

            {isFichaVisible && (
              <button
                type="button"
                onClick={() => setActiveTab('ficha')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'ficha'
                    ? 'bg-[#1e3a5f] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Printer className="w-4 h-4 text-amber-500" />
                <span>Descargar Ficha con Logo de Empresa</span>
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Habilitado Mintransporte</span>
          </div>
        </div>

        {/* Global Alert / Progress Banner */}
        {pdfSuccessToast && (
          <div className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{pdfSuccessToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setPdfSuccessToast(null)}
              className="text-white/80 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isGeneratingPdf && (
          <div className="px-6 py-2.5 bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{pdfStatusMessage || 'Generando archivo PDF con alta fidelidad gráfica...'}</span>
          </div>
        )}


        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: FICHA & ESPECIFICACIONES */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Top Banner with Overlay Stats */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 h-56 sm:h-64 shadow-inner">
                <img
                  src={vehicle.coverImage}
                  alt={`Vehículo ${vehicle.plate}`}
                  className="w-full h-full object-cover opacity-85"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md ${
                      vehicle.isAvailable
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    <span>{vehicle.isAvailable ? 'Disponible para Viajes' : 'No disponible'}</span>
                  </span>

                  <span className="px-3 py-1 bg-black/60 backdrop-blur-xs text-white rounded-full text-xs font-semibold">
                    {vehicle.type}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={vehicle.profileImage}
                      alt="Miniatura vehículo"
                      className="w-16 h-16 rounded-2xl object-cover border-3 border-white shadow-lg shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-xl font-black text-white">{vehicle.brand}</h3>
                      <p className="text-xs text-slate-300 font-medium">
                        {vehicle.lineModel || 'Servicio Público de Transporte Especial Terrestre'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-amber-300 mt-1 font-semibold">
                        <span>Modelo {vehicle.modelYear}</span>
                        <span>•</span>
                        <span>{vehicle.capacity} Pasajeros sentados</span>
                        <span>•</span>
                        <span>{vehicle.color || 'Blanco'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ficha')}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#1e3a5f]" />
                      <span>Generar Ficha Oficial</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid with Vehicle Specs & Identification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card: Identificación Técnica */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Gauge className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Identificación Técnica y Registral
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      RUNT Verificado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Placa
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatPlateDisplay(vehicle.plate)}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Número Interno
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {vehicle.internalNumber || 'Sin asignar'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Clase / Carrocería
                      </span>
                      <span className="font-semibold text-slate-900">
                        {vehicle.bodyType || `${vehicle.type} Cerrada`}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Combustible / Cilindraje
                      </span>
                      <span className="font-semibold text-slate-900">
                        {vehicle.fuelType || 'Diésel'} • {vehicle.cylinderCapacity || '5.200 cc'}
                      </span>
                    </div>

                    <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Número de Chasis (VIN)
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {vehicle.chassisNumber || '93FBK64M8P0028471'}
                      </span>
                    </div>

                    <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Número de Motor
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {vehicle.engineNumber || '4HK1-TC549210'}
                      </span>
                    </div>

                    <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Organismo de Tránsito (Matrícula)
                      </span>
                      <span className="font-semibold text-slate-800">
                        {vehicle.registrationCity || 'Secretaría de Movilidad y Tránsito de Bogotá D.C.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Habilitación de Transporte y GPS */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Habilitación Mintransporte y Monitoreo
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Tarjeta Op. Vigente
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Building2 className="w-4 h-4 text-[#1e3a5f] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Empresa Afiliada (Habilitada por Mintransporte)
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {vehicle.affiliatedCompany}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <FileCheck2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Tarjeta de Operación No.
                        </span>
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {vehicle.operatingCardNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Vigencia hasta:{' '}
                          <span className="font-bold text-slate-800">
                            {formatDateDDMMYYYY(vehicle.tarjetaOperacion?.expirationDate || '2027-04-15')}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                      <Radio className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Monitoreo Satelital GPS (Homologado Mintransporte)
                        </span>
                        <span className="font-bold text-slate-900">
                          {vehicle.gpsProvider || 'Hunter / Navisat GPS Colombia (Transmisión 24/7)'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          ✓ Transmisión activa de posición, velocidad y botón de pánico
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities and Safety Equipment */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Equipamiento de Seguridad y Confort a Bordo
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Especificaciones de bienestar para pasajeros y dispositivos de seguridad reglamentarios.
                      </p>
                    </div>
                  </div>

                  {canManageEquipment && (
                    <button
                      type="button"
                      onClick={() => setIsEditingEquipment(true)}
                      className="px-3.5 py-1.5 bg-[#1e3a5f] hover:bg-[#142842] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Editar Equipamiento</span>
                    </button>
                  )}
                </div>

                {/* Sub-section 1: Confort y Amenidades */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Confort y Experiencia de Viaje
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.airConditioning !== false
                          ? 'bg-blue-50/70 border-blue-200 text-blue-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Wind
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.airConditioning !== false ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.airConditioning !== false ? 'Aire Acondicionado' : 'Sin A/C'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.recliningSeats !== false
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Users
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.recliningSeats !== false ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.recliningSeats !== false ? 'Sillas Reclinables' : 'Sillas Fijas'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.usbChargers !== false
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Zap
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.usbChargers !== false ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.usbChargers !== false ? 'Puertos USB / 110V' : 'Sin USB'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.wifi
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Wifi
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.wifi ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.wifi ? 'Wi-Fi a Bordo' : 'Sin Wi-Fi'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.screenTv
                          ? 'bg-purple-50/70 border-purple-200 text-purple-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Tv
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.screenTv ? 'text-purple-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.screenTv ? 'Pantallas TV / HD' : 'Audio Básico'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.soundSystem !== false
                          ? 'bg-cyan-50/70 border-cyan-200 text-cyan-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Volume2
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.soundSystem !== false ? 'text-cyan-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.soundSystem !== false ? 'Sonido y Micrófono' : 'Sin micrófono'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.readingLights !== false
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Lightbulb
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.readingLights !== false ? 'text-amber-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.readingLights !== false ? 'Luces de Lectura' : 'Luz General'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.luggageRack !== false
                          ? 'bg-stone-50/80 border-stone-200 text-stone-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Briefcase
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.luggageRack !== false ? 'text-stone-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.luggageRack !== false ? 'Bodega Equipaje' : 'Sin bodega'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.tintedWindows !== false
                          ? 'bg-orange-50/70 border-orange-200 text-orange-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Sun
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.tintedWindows !== false ? 'text-orange-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.tintedWindows !== false ? 'Vidrios Filtro UV' : 'Vidrios Claros'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.bathroom
                          ? 'bg-teal-50/70 border-teal-200 text-teal-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Bath
                        className={`w-4 h-4 shrink-0 ${
                          vehicle.bathroom ? 'text-teal-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-[11px] truncate">
                        {vehicle.bathroom ? 'Baño a Bordo' : 'Sin Baño'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-section 2: Seguridad y Normativa */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Seguridad Activa, Pasiva y Normativa Mintransporte
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.seatbeltsOnAllSeats !== false
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] truncate">Cinturones 100% Asientos</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.firstAidKit !== false
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-[11px] truncate">Botiquín de Primeros Aux.</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.emergencyExit !== false
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[11px] truncate">Salidas y Martillos OK</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.absBrakes !== false
                          ? 'bg-blue-50/70 border-blue-200 text-blue-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Gauge className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-[11px] truncate">Frenos ABS + ESP</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.speedLimiter !== false
                          ? 'bg-violet-50/70 border-violet-200 text-violet-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Activity className="w-4 h-4 text-violet-600 shrink-0" />
                      <span className="text-[11px] truncate">Alarma Velocidad 80 km/h</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.gpsTracking !== false
                          ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Radio className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-[11px] truncate">GPS Satelital 24/7</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.dualAirbags !== false
                          ? 'bg-cyan-50/70 border-cyan-200 text-cyan-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span className="text-[11px] truncate">Bolsas de Aire (Airbags)</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                        vehicle.roadKit !== false
                          ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Wrench className="w-4 h-4 text-slate-700 shrink-0" />
                      <span className="text-[11px] truncate">Equipo de Carretera</span>
                    </div>
                  </div>
                </div>

                {/* Additional equipment notes if any */}
                {vehicle.additionalEquipmentNotes && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold block mb-0.5">Observaciones adicionales de equipamiento:</span>
                    <p className="text-slate-800">{vehicle.additionalEquipmentNotes}</p>
                  </div>
                )}
              </div>

              {/* Owner and Driver Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Propietario */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-base shrink-0 border border-slate-200">
                      {owner?.profileImage ? (
                        <img
                          src={owner.profileImage}
                          alt={owner.name}
                          className="w-full h-full object-cover rounded-2xl"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Propietario del Vehículo
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{owner ? owner.name : 'Propietario particular'}</h4>
                      <p className="text-xs text-slate-500">C.C. {owner?.identification || '79845123'}</p>
                    </div>
                  </div>

                  {owner?.phone && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${owner.phone}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
                        title="Llamar al propietario"
                      >
                        <Phone className="w-4 h-4 text-[#1e3a5f]" />
                      </a>
                      <a
                        href={`https://wa.me/57${owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${owner.name}, le escribo respecto al vehículo ${vehicle.type} ${vehicle.brand} (Placa ${vehicle.plate}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-colors shadow-2xs"
                        title="WhatsApp al propietario"
                      >
                        <MessageCircle className="w-4 h-4 fill-white/20 text-white" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Conductores Asignados (Principal y Relevo) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      Conductores Asignados al Vehículo
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {driver && secondaryDriver
                        ? '2 conductores autorizados'
                        : driver || secondaryDriver
                        ? '1 conductor autorizado'
                        : 'Sin conductores asignados'}
                    </span>
                  </div>

                  {/* 1. Conductor Principal */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200 overflow-hidden">
                        {driver?.profilePhoto ? (
                          <img
                            src={driver.profilePhoto}
                            alt={driver.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-5 h-5 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                            Titular
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {driver ? driver.name : vehicle.assignedDriverName || 'Sin conductor principal'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tel: {driver?.phone || 'Sin teléfono'} • Cat: {driver?.licenseCategory || 'C2'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {driver && (
                        <button
                          type="button"
                          onClick={() => openDriverModal(driver.id)}
                          className="px-2.5 py-1.5 bg-[#1e3a5f] hover:bg-[#142842] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Ver ficha técnica, cédula y licencia por ambos lados"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ficha Conductor</span>
                        </button>
                      )}
                      {driver?.phone && (
                        <a
                          href={`tel:${driver.phone}`}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
                          title="Llamar al conductor titular"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#1e3a5f]" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 2. Conductor de Relevo */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200 overflow-hidden">
                        {secondaryDriver?.profilePhoto ? (
                          <img
                            src={secondaryDriver.profilePhoto}
                            alt={secondaryDriver.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-5 h-5 text-amber-700" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded">
                            Relevo / Suplente
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {secondaryDriver
                              ? secondaryDriver.name
                              : vehicle.secondaryDriverName || 'Sin conductor de relevo asignado'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {secondaryDriver
                            ? `Tel: ${secondaryDriver.phone} • Cat: ${secondaryDriver.licenseCategory || 'C2'}`
                            : 'Opcional para viajes de larga distancia o turnos dobles'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {secondaryDriver && (
                        <button
                          type="button"
                          onClick={() => openDriverModal(secondaryDriver.id)}
                          className="px-2.5 py-1.5 bg-[#1e3a5f] hover:bg-[#142842] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Ver ficha técnica, cédula y licencia por ambos lados"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ficha Conductor</span>
                        </button>
                      )}
                      {secondaryDriver?.phone && (
                        <a
                          href={`tel:${secondaryDriver.phone}`}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
                          title="Llamar al conductor de relevo"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#1e3a5f]" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTOS Y VENCIMIENTOS (DOSSIER ESCANEADO) */}
          {activeTab === 'documentos' && (
            <div className="space-y-6">
              {/* Top Document Status Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Dossier de Documentos y Pólizas Obligatorias
                    </h3>
                    <p className="text-xs text-slate-500">
                      Control regulatorio según Decreto 1079 de 2015 del Ministerio de Transporte de Colombia.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ficha')}
                    className="px-3.5 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Descargar Todo en Ficha Técnica</span>
                  </button>
                </div>
              </div>

              {/* Document Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docsList.map((item) => {
                  const docInfo = item.doc;
                  const expStatus = getDaysUntilExpiration(docInfo?.expirationDate);

                  return (
                    <div
                      key={item.key}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#1e3a5f] flex items-center justify-center font-bold shrink-0 mt-0.5">
                              <FileCheck2 className="w-4 h-4 text-[#1e3a5f]" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                {docInfo?.entityName || 'Entidad Aseguradora / Reguladora'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              expStatus.status === 'vigente'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : expStatus.status === 'proximo_a_vencer'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {expStatus.status === 'vigente'
                              ? '✓ Vigente'
                              : expStatus.status === 'proximo_a_vencer'
                              ? '⚠️ Por Renovar'
                              : '✕ Vencido'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Número / Póliza:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {docInfo?.documentNumber || docInfo?.policyNumber || 'Pendiente de registrar'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Fecha de Vencimiento:</span>
                            <span className="font-bold text-slate-900">
                              {formatDateDDMMYYYY(docInfo?.expirationDate)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Estado de control:</span>
                            <span
                              className={`font-semibold ${
                                expStatus.status === 'vigente'
                                  ? 'text-emerald-700'
                                  : expStatus.status === 'proximo_a_vencer'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {expStatus.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {docInfo?.scannedUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setViewingDoc({
                                title: item.name,
                                doc: docInfo,
                              })
                            }
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Documento Escaneado</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Sin escaneo cargado
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleTriggerDocUpload(item.key)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Cargar o actualizar documento escaneado"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>{docInfo?.scannedUrl ? 'Actualizar' : 'Subir'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GENERAR Y DESCARGAR FICHA TÉCNICA CON LOGO DE LA EMPRESA SOLICITANTE */}
          {activeTab === 'ficha' && (isFichaVisible ? (
            <div className="space-y-6">
              {/* Company Selector & Customizer Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Personalización de Ficha Técnica y Dossier
                    </h3>
                    <p className="text-xs text-slate-500">
                      La ficha se genera y descarga con el **logotipo oficial, NIT y encabezado de la empresa que la solicita**.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      disabled={isGeneratingPdf}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#1e3a5f] border border-slate-300 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                      title="Imprimir o exportar a PDF directamente"
                    >
                      <Printer className="w-4 h-4 text-[#1e3a5f]" />
                      <span>{isGeneratingPdf ? 'Procesando...' : 'Imprimir / PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPdf}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                      title="Descargar Ficha Técnica en formato PDF oficial"
                    >
                      {isGeneratingPdf ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isGeneratingPdf ? pdfStatusMessage || 'Generando...' : 'Descargar PDF Oficial'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Select requesting company */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Seleccionar Empresa Solicitante / Contratante (Logo en Encabezado):
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] bg-white font-medium text-slate-800"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — NIT: {c.nit} ({c.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Company Logo Preview */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={companyLogo}
                      alt="Logo de la empresa"
                      className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block truncate">
                        {selectedCompany?.name || 'Empresa Solicitante'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        NIT: {selectedCompany?.nit || '890.000.000-1'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Notes / Observation */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Observaciones y Objeto del Despacho (Se imprime en la ficha):
                  </label>
                  <input
                    type="text"
                    value={dispatchNote}
                    onChange={(e) => setDispatchNote(e.target.value)}
                    placeholder="Ej: Acreditación para contrato de transporte escolar / ruta empresarial..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                </div>
              </div>

              {/* PRINTABLE / DOWNLOADABLE FICHA TÉCNICA DOCUMENT */}
              <div
                id="printable-ficha-tecnica"
                ref={printContainerRef}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-lg text-slate-900 space-y-6 max-w-4xl mx-auto"
              >
                {/* Official Legal Header with Company Logo */}
                <div className="border-b-2 border-slate-900 pb-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={companyLogo}
                        alt="Logo de la empresa solicitante"
                        className="w-20 h-20 rounded-xl object-contain bg-white p-1.5 border border-slate-200 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                          EMPRESA DE TRANSPORTE TERRESTRE AUTOMOTOR ESPECIAL
                        </span>
                        <h1 className="text-lg font-black text-slate-950 leading-tight">
                          {selectedCompany?.name || 'EMPRESA DE TRANSPORTE ESPECIAL'}
                        </h1>
                        <p className="text-xs text-slate-600 font-semibold">
                          NIT: {selectedCompany?.nit || '890.000.000-1'} • {selectedCompany?.city || 'Colombia'}
                        </p>
                        <p className="text-[11px] text-slate-500 italic">
                          {selectedCompany?.habilitacionMintransporte || 'Resolución Mintransporte de Habilitación Especial'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                      <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-right">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">
                          CÓDIGO DE FICHA TÉCNICA
                        </span>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          FT-VEH-{vehicle.plate}-{vehicle.modelYear}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Fecha de Emisión: {formatDateDDMMYYYY(new Date().toISOString())}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#1e3a5f]">
                      FICHA TÉCNICA VEHICULAR Y DOSSIER DE HABILITACIÓN OFICIAL
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Documento de control y alistamiento operacional para prestación de servicio especial
                    </p>
                  </div>
                </div>

                {/* Section 1: Vehicle & Photo Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="sm:col-span-1 rounded-xl overflow-hidden h-36 bg-slate-200 border border-slate-300">
                    <img
                      src={vehicle.coverImage}
                      alt={vehicle.plate}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Placa
                      </span>
                      <span className="font-mono font-extrabold text-slate-950 text-base">
                        {formatPlateDisplay(vehicle.plate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        No. Interno
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {vehicle.internalNumber || '412'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Marca y Modelo
                      </span>
                      <span className="font-bold text-slate-900">
                        {vehicle.brand} ({vehicle.modelYear})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Clase y Capacidad
                      </span>
                      <span className="font-bold text-slate-900">
                        {vehicle.type} • {vehicle.capacity} Pasajeros
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Color de Carrocería
                      </span>
                      <span className="font-semibold text-slate-800">
                        {vehicle.color || 'Blanco'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Combustible / Cilindraje
                      </span>
                      <span className="font-semibold text-slate-800">
                        {vehicle.fuelType || 'Diésel'} • {vehicle.cylinderCapacity || '5.193 cc'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Technical Identifiers (Chassis, Engine, Transit License) */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#1e3a5f]" />
                    <span>1. Identificación y Registro Oficial (RUNT)</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Número de Chasis (VIN)
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-[11px] break-all">
                        {vehicle.chassisNumber || '93FBK64M8P0028471'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Número de Motor
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-[11px] break-all">
                        {vehicle.engineNumber || '4HK1-TC549210'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Licencia de Tránsito (RUNT)
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-[11px]">
                        {vehicle.transitLicenseNumber || '10049281729'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">
                        Organismo de Tránsito
                      </span>
                      <span className="font-semibold text-slate-900 text-[11px]">
                        {vehicle.registrationCity || 'Bogotá D.C.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Document Validity Matrix (SOAT, RTM, TO, RCC, RCE, Preventiva) */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Matriz de Control y Vigencia de Documentos y Pólizas Obligatorias</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-2">Documento / Póliza</th>
                          <th className="p-2">Entidad Emisora / Aseguradora</th>
                          <th className="p-2">No. Documento / Póliza</th>
                          <th className="p-2">Vencimiento</th>
                          <th className="p-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {docsList.map((d) => {
                          const exp = getDaysUntilExpiration(d.doc?.expirationDate);
                          return (
                            <tr key={d.key} className="hover:bg-slate-50">
                              <td className="p-2 font-bold text-slate-900">{d.name}</td>
                              <td className="p-2 text-slate-600">
                                {d.doc?.entityName || 'Aseguradora / Entidad Homologada'}
                              </td>
                              <td className="p-2 font-mono text-slate-800">
                                {d.doc?.documentNumber || d.doc?.policyNumber || 'Al día'}
                              </td>
                              <td className="p-2 font-bold text-slate-900">
                                {formatDateDDMMYYYY(d.doc?.expirationDate)}
                              </td>
                              <td className="p-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    exp.status === 'vigente'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : exp.status === 'proximo_a_vencer'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {exp.status === 'vigente' ? 'Vigente' : exp.status === 'proximo_a_vencer' ? 'Por Vencer' : 'Vencido'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 4: Owner, Drivers & Operational Staff */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Propietario Registrado
                    </span>
                    <span className="font-bold text-slate-900 block">{owner ? owner.name : 'Particular'}</span>
                    <span className="text-slate-600 block">C.C. {owner?.identification || '79845123'}</span>
                    <span className="text-slate-600 block">Tel: {owner?.phone || '3124567890'}</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1 text-xs">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                      Conductor Principal (Titular)
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {driver ? driver.name : vehicle.assignedDriverName || 'Asignado en planilla'}
                    </span>
                    <span className="text-slate-600 block">C.C. {driver?.identification || '80194820'} • Lic: {driver?.licenseCategory || 'C2'}</span>
                    <span className="text-slate-600 block">Tel: {driver?.phone || owner?.phone || '3138899112'}</span>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1 text-xs">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">
                      Conductor de Relevo (Suplente)
                    </span>
                    <span className="font-bold text-slate-900 block">
                      {secondaryDriver ? secondaryDriver.name : vehicle.secondaryDriverName || 'Sin relevo'}
                    </span>
                    <span className="text-slate-600 block">
                      {secondaryDriver ? `C.C. ${secondaryDriver.identification || 'Sin registrar'} • Lic: ${secondaryDriver.licenseCategory || 'C2'}` : 'Opcional'}
                    </span>
                    <span className="text-slate-600 block">
                      {secondaryDriver ? `Tel: ${secondaryDriver.phone}` : 'Disponibilidad según turno'}
                    </span>
                  </div>
                </div>

                {/* Section 4.5: Certified Safety and Comfort Equipment */}
                <div className="space-y-1.5 text-xs">
                  <h3 className="text-xs font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>3. Equipamiento de Seguridad y Confort Homologado</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block">Climatización:</span>
                      <span className="text-slate-600">{vehicle.airConditioning !== false ? '✓ Aire Acondicionado' : 'Ventilación standard'}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block">Silletería:</span>
                      <span className="text-slate-600">{vehicle.recliningSeats !== false ? '✓ Reclinables tipo Pullman' : 'Sillas fijas'}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block">Conectividad:</span>
                      <span className="text-slate-600">
                        {vehicle.usbChargers !== false ? '✓ USB/Tomas ' : ''}
                        {vehicle.wifi ? '✓ Wi-Fi' : ''}
                        {vehicle.usbChargers === false && !vehicle.wifi ? 'Básica' : ''}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block">Seguridad Activa:</span>
                      <span className="text-slate-600">✓ Cinturones 100% • ✓ ABS</span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Dispatch Note */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
                  <span className="text-[10px] text-blue-900 font-bold uppercase block">
                    Observaciones y Acreditación de Despacho
                  </span>
                  <p className="text-slate-800 italic mt-0.5">{dispatchNote}</p>
                </div>

                {/* Scanned Document Previews Section if checked */}
                {includeScannedPreviews && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase text-slate-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#1e3a5f]" />
                      <span>3. Anexos y Certificaciones Escaneadas</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {docsList.slice(0, 4).map((d) => (
                        <div
                          key={d.key}
                          className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center space-y-1"
                        >
                          <div className="h-20 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
                            {d.doc?.scannedUrl ? (
                              <img
                                src={d.doc.scannedUrl}
                                alt={d.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <FileCheck2 className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-800 block truncate">
                            {d.name}
                          </span>
                          <span className="text-[9px] text-slate-500 block">
                            Vence: {formatDateDDMMYYYY(d.doc?.expirationDate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 6: Official Signatures and Seals */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
                  <div className="space-y-1">
                    <div className="h-12 flex items-end justify-center">
                      <div className="w-36 border-b border-slate-900"></div>
                    </div>
                    <span className="font-bold text-slate-900 block">
                      Departamento de Operaciones y Despacho
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {selectedCompany?.name || 'Empresa Solicitante'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="h-12 flex items-end justify-center">
                      <div className="w-36 border-b border-slate-900"></div>
                    </div>
                    <span className="font-bold text-slate-900 block">
                      Conductor / Propietario Autorizado
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Placa: {formatPlateDisplay(vehicle.plate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 border border-amber-100">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950">Acceso Restringido</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Por políticas de seguridad y privacidad, la ficha técnica detallada de este vehículo y su conductor solo está disponible para la empresa contratante una vez que el conductor o propietario haya aceptado formalmente la prestación del servicio.
              </p>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Vehículo afiliado a:{' '}
              <span className="font-semibold text-slate-900">{vehicle.affiliatedCompany}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {isFichaVisible && (
              activeTab !== 'ficha' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('ficha')}
                  className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generar Ficha con Logo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isGeneratingPdf ? pdfStatusMessage || 'Generando...' : 'Descargar PDF Oficial'}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE VEHÍCULO */}
      {isConfirmingDelete && vehicle && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ¿Eliminar vehículo {vehicle.plate}?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Esta acción eliminará definitivamente el vehículo de tu flota y su expediente documental.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Cualquier conductor asignado a este vehículo quedará liberado automáticamente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  disabled={isDeletingVehicle}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDeletingVehicle(true);
                    deleteVehicle(vehicle.id);
                    setIsDeletingVehicle(false);
                    setIsConfirmingDelete(false);
                    onClose();
                  }}
                  disabled={isDeletingVehicle}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeletingVehicle ? 'Eliminando...' : 'Sí, eliminar vehículo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanned Document Full-Screen Lightbox Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingDoc.title}</h3>
                <p className="text-xs text-slate-500">
                  {viewingDoc.doc.entityName} • No. {viewingDoc.doc.documentNumber || viewingDoc.doc.policyNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl bg-slate-900 flex items-center justify-center p-2 min-h-[280px]">
              {viewingDoc.doc.scannedUrl ? (
                <img
                  src={viewingDoc.doc.scannedUrl}
                  alt={viewingDoc.title}
                  className="max-h-[60vh] w-auto object-contain rounded-lg shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <p className="text-slate-400 text-xs">No hay imagen escaneada disponible.</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="font-semibold text-slate-700">
                Vigencia hasta: {formatDateDDMMYYYY(viewingDoc.doc.expirationDate)}
              </span>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-[#1e3a5f] text-white font-bold rounded-xl"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Equipment Modal */}
      {isEditingEquipment && vehicle && (
        <EditEquipmentModal
          vehicle={vehicle}
          onClose={() => setIsEditingEquipment(false)}
        />
      )}
    </div>
  );
};
