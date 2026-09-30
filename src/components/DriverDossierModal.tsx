import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Driver, Vehicle, Company } from '../types';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  Award,
  Calendar,
  Car,
  Bus,
  Building2,
  FileCheck2,
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Upload,
  Camera,
  X,
  Sparkles,
  ChevronRight,
  CreditCard,
  Hash,
  AlertTriangle,
  ExternalLink,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import {
  formatPlateDisplay,
  formatDateDDMMYYYY,
  formatDateTime,
  readFileAsDataUrl,
} from '../utils/formatters';
import { generatePdfFromElement, printOrDownloadPdf } from '../utils/pdfGenerator';

interface DriverDossierModalProps {
  driverId: string;
  requestingCompanyId?: string | null;
  onClose: () => void;
}

export const DriverDossierModal: React.FC<DriverDossierModalProps> = ({
  driverId,
  requestingCompanyId,
  onClose,
}) => {
  const {
    drivers,
    vehicles,
    companies,
    owners,
    currentSession,
    updateDriverProfile,
    requests,
  } = useApp();

  const driver = drivers.find((d) => d.id === driverId);

  // Find assigned vehicle (principal and/or secondary)
  const primaryVehicle = driver?.assignedVehicleId
    ? vehicles.find((v) => v.id === driver.assignedVehicleId)
    : driver ? vehicles.find(
        (v) =>
          v.assignedDriverId === driverId ||
          (driver?.assignedVehiclePlate && v.plate === driver.assignedVehiclePlate)
      ) : undefined;

  const secondaryVehicle = driver?.secondaryVehicleId
    ? vehicles.find((v) => v.id === driver.secondaryVehicleId)
    : driver ? vehicles.find(
        (v) =>
          v.secondaryDriverId === driverId ||
          (driver?.secondaryVehiclePlate && v.plate === driver.secondaryVehiclePlate)
      ) : undefined;

  const owner = driver ? owners.find((o) => o.id === driver.ownerId) : null;

  // Verify if a company user has an accepted service/request with this driver
  const isCompanyUser = currentSession?.role === 'empresa' || currentSession?.role === 'coordinador';
  const userCompanyId = currentSession?.role === 'empresa'
    ? currentSession.userId
    : (currentSession?.role === 'coordinador' ? currentSession.companyId : null);

  const activeCompanyId = userCompanyId || requestingCompanyId;

  const isDriverServiceAcceptedByThisCompany = !!(driver && activeCompanyId && requests.some((req) => {
    if (req.status !== 'aceptada') return false;
    if (req.companyId !== activeCompanyId) return false;
    
    // Check if the service is assigned to this driver
    const matchesDriver = req.acceptedBy?.driverId === driver.id;
    const matchesPlate = primaryVehicle && req.acceptedBy?.vehiclePlate?.toUpperCase() === primaryVehicle.plate.toUpperCase();
    const matchesSecondaryPlate = secondaryVehicle && req.acceptedBy?.vehiclePlate?.toUpperCase() === secondaryVehicle.plate.toUpperCase();
    
    return matchesDriver || matchesPlate || matchesSecondaryPlate;
  }));

  // Decide if the company user is allowed to see the driver's Ficha Técnica / Dossier
  const isFichaVisible = !(isCompanyUser || requestingCompanyId) || isDriverServiceAcceptedByThisCompany;

  const contractingCompany = currentSession?.role === 'empresa'
    ? companies.find((c) => c.id === currentSession.userId)
    : null;
  const isPremium = currentSession?.role === 'empresa'
    ? (contractingCompany?.subscription?.isActive || false)
    : true;

  // Selected contracting company for letterhead / logo
  const defaultCompanyId =
    requestingCompanyId ||
    (currentSession?.role === 'empresa' ? currentSession.userId : null) ||
    (companies.length > 0 ? companies[0].id : '');

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(defaultCompanyId || '');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dossier' | 'documentos'>(
    isFichaVisible ? 'dossier' : 'documentos'
  );
  const [zoomedDoc, setZoomedDoc] = useState<{ title: string; url: string; subtitle: string } | null>(null);

  // Document upload state
  const [uploadingField, setUploadingField] = useState<keyof Driver | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const selectedCompany: Company | undefined =
    companies.find((c) => c.id === selectedCompanyId) || companies[0];

  const canEditDocs =
    driver &&
    (currentSession?.role === 'empresa' ||
      currentSession?.userId === driver.id ||
      currentSession?.userId === driver.ownerId ||
      currentSession?.originalOwnerId === driver.ownerId);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!isPremium) {
      alert('La exportación de Dossiers en PDF está reservada para usuarios con suscripción activa de TransPortal Premium ($11.900 COP/mes). Actívala en la pestaña Planes de tu panel.');
      return;
    }

    if (activeView !== 'dossier') {
      setActiveView('dossier');
      await new Promise((r) => setTimeout(r, 200));
    }

    const printContent = document.getElementById('printable-driver-dossier') || printContainerRef.current;
    if (!printContent || !driver) return;

    setIsGeneratingPdf(true);
    setPdfStatusMessage('Iniciando generación de PDF...');

    try {
      const driverNameClean = driver.name.replace(/\s+/g, '_');
      const fileName = `Dossier_Conductor_${driverNameClean}_${driver.identification || driver.id}.pdf`;
      const title = `Ficha Técnica Conductor - ${driver.name} - ${selectedCompany?.name || 'Transporte Especial'}`;

      const success = await generatePdfFromElement(printContent, {
        fileName,
        title,
        onProgress: (msg) => setPdfStatusMessage(msg),
      });

      if (success) {
        setSuccessToast('¡Dossier y Ficha Técnica de conductor descargada en PDF!');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch (err) {
      console.error('Error al generar PDF de conductor:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatusMessage(null);
    }
  };

  const handlePrint = async () => {
    if (activeView !== 'dossier') {
      setActiveView('dossier');
      await new Promise((r) => setTimeout(r, 200));
    }

    const printContent = document.getElementById('printable-driver-dossier') || printContainerRef.current;
    if (!printContent || !driver) return;

    setIsGeneratingPdf(true);
    setPdfStatusMessage('Preparando impresión...');

    try {
      const driverNameClean = driver.name.replace(/\s+/g, '_');
      const fileName = `Dossier_Conductor_${driverNameClean}.pdf`;
      const title = `Ficha Técnica Conductor - ${driver.name} - ${selectedCompany?.name || 'Transporte Especial'}`;

      const result = await printOrDownloadPdf(printContent, {
        fileName,
        title,
        onProgress: (msg) => setPdfStatusMessage(msg),
      });

      if (result.method === 'download_pdf') {
        setSuccessToast('Dossier generado y descargado en PDF (entorno protegido).');
        setTimeout(() => setSuccessToast(null), 4500);
      } else {
        setSuccessToast('Diálogo de impresión ejecutado.');
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (err) {
      console.error('Error en impresión:', err);
    } finally {
      setIsGeneratingPdf(false);
      setPdfStatusMessage(null);
    }
  };


  const handleDocumentUploadClick = (field: keyof Driver) => {
    setUploadingField(field);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingField || !driver) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateDriverProfile(driver.id, { [uploadingField]: dataUrl });
      setSuccessToast('¡Documento digitalizado y actualizado con éxito!');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploadingField(null);
    }
  };

  if (!driver) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Conductor no encontrado</h3>
          <p className="text-xs text-slate-500">
            No se pudo cargar la información del perfil del conductor solicitado.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Fallback images
  const profilePhoto =
    driver.profilePhoto ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const coverPhoto =
    driver.coverPhoto ||
    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80';

  const cedulaFront =
    driver.cedulaFrontUrl ||
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80';
  const cedulaBack =
    driver.cedulaBackUrl ||
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
  const licenseFront =
    driver.licenseFrontUrl ||
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
  const licenseBack =
    driver.licenseBackUrl ||
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      {/* Hidden file input for document updates */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none print:max-w-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                Ficha Técnica y Hoja de Vida del Conductor
              </h2>
              <p className="text-[11px] text-slate-400">
                Transporte Terrestre Automotor Especial de Colombia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Selector */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center text-xs">
              {isFichaVisible && (
                <button
                  type="button"
                  onClick={() => setActiveView('dossier')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    activeView === 'dossier'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Ficha Técnica
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveView('documentos')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeView === 'documentos'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Cédula y Licencia (Ambos Lados)
              </button>
            </div>

            {/* Print / PDF Buttons */}
            {isFichaVisible && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isGeneratingPdf}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 border border-slate-700"
                  title="Imprimir dossier"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isGeneratingPdf ? 'Procesando...' : 'Imprimir'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  title="Descargar Dossier en formato PDF oficial"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}</span>
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Company Selector Toolbar (Hidden on Print) */}
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1e3a5f] shrink-0" />
            <span className="font-bold text-slate-700">Empresa Contratante en Membrete:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setCustomLogoUrl(null);
              }}
              className="px-3 py-1 border border-slate-300 rounded-lg bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (NIT: {c.nit})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Verificado para cumplimiento MinTransporte y Decreto 1079 de 2015</span>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-500 text-white p-2.5 px-6 text-xs font-bold flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PDF Progress Toast */}
        {isGeneratingPdf && (
          <div className="bg-amber-500 text-slate-950 p-2.5 px-6 text-xs font-bold flex items-center gap-2 animate-pulse print:hidden">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{pdfStatusMessage || 'Generando documento PDF de alta resolución...'}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRINTABLE DOSSIER CONTENT AREA */}
        {/* ========================================================================= */}
        <div id="printable-driver-dossier" ref={printContainerRef} className="p-6 md:p-8 space-y-6 print:p-8 print:space-y-4">
          {activeView === 'dossier' && (
            isFichaVisible ? (
              <>
                {/* Official Letterhead with Contracting Company Logo */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={
                  customLogoUrl ||
                  selectedCompany?.logo ||
                  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=200&q=80'
                }
                alt={selectedCompany?.name || 'Empresa Contratante'}
                className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-white"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                  {selectedCompany?.name || 'EMPRESA CONTRATANTE DE TRANSPORTE'}
                </h1>
                <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                  <span>NIT: <strong className="text-slate-900">{selectedCompany?.nit || '900.842.119-4'}</strong></span>
                  <span>•</span>
                  <span>Ciudad: <strong className="text-slate-900">{selectedCompany?.city || 'Bogotá D.C.'}</strong></span>
                  <span>•</span>
                  <span>Tel: <strong className="text-slate-900">{selectedCompany?.phone || '3108899000'}</strong></span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                  Habilitación Mintransporte • Resolución Especial No. 4189
                </div>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="inline-block bg-slate-900 text-amber-400 font-mono text-[10px] font-bold px-2.5 py-1 rounded">
                FT-COND-{driver.identification || driver.id.toUpperCase()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Fecha de Emisión: <strong>{formatDateDDMMYYYY(new Date().toISOString())}</strong>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-slate-100 p-2.5 rounded-lg text-center border border-slate-200">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
              Ficha Técnica, Registro de Habilitación y Hoja de Vida del Conductor
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Conductor Certificado para Servicio Público de Transporte Terrestre Automotor Especial
            </p>
          </div>

          {/* Top Profile Card (Cover & Avatar) */}
          <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            {/* Cover Banner */}
            <div className="h-28 w-full bg-slate-800 relative">
              <img
                src={coverPhoto}
                alt="Portada"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Category Badge on Cover */}
              <div className="absolute top-2.5 right-3 bg-amber-400 text-slate-950 text-xs font-mono font-black px-2.5 py-0.5 rounded shadow-sm">
                LICENCIA {driver.licenseCategory || 'C2'} • VIGENTE
              </div>
            </div>

            {/* Profile Bar */}
            <div className="px-5 pb-4 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-3.5 -mt-8">
                <div className="relative">
                  <img
                    src={profilePhoto}
                    alt={driver.name}
                    className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-xs" title="Conductor Activo">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {driver.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-medium">
                    <span>
                      C.C.: <strong className="text-slate-900">{driver.identification || '1.020.784.912'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      RH: <strong className="text-rose-600 font-bold">{driver.bloodType || 'O+'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Exp: <strong className="text-slate-900">{driver.yearsOfExperience || 8} años</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Pill */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {isPremium ? (
                  <a
                    href={`tel:${driver.phone}`}
                    className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs hover:bg-[#1e3a5f] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{driver.phone}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => alert('Visualización bloqueada. Suscríbete al plan TransPortal Premium por $11.900 al mes en la pestaña Planes para desbloquear el contacto directo de conductores.')}
                    className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-800 font-bold rounded-lg flex items-center gap-1.5 shadow-xs hover:bg-amber-500/25 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span className="blur-[3px] select-none">{driver.phone.slice(0, 4)}***</span>
                    <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black uppercase">Premium</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bio / Experience Summary */}
          {driver.bio && (
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 text-xs text-slate-700">
              <span className="font-bold text-amber-900 block mb-0.5">Perfil y Experiencia Profesional:</span>
              <p className="leading-relaxed text-slate-800">{driver.bio}</p>
            </div>
          )}

          {/* Two-Column Grid: Personal & Safety Compliance vs. Assigned Vehicle & License */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Column 1: Personal, Healthcare & Emergency */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#1e3a5f]" />
                <span>Seguridad Social y Datos Médicos</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    EPS (Salud)
                  </span>
                  <span className="font-bold text-slate-900">
                    {driver.eps || 'Sanitas EPS'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    ARL (Riesgos Laborales)
                  </span>
                  <span className="font-bold text-slate-900">
                    {driver.arl || 'Positiva ARL'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Grupo Sanguíneo y RH
                  </span>
                  <span className="font-bold text-rose-600">
                    {driver.bloodType || 'O+'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Ciudad de Residencia
                  </span>
                  <span className="font-semibold text-slate-800">
                    {driver.city || 'Bogotá D.C.'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-0.5">
                  Contacto en Caso de Emergencia
                </span>
                <div className="flex items-center justify-between text-slate-800">
                  <span className="font-bold">{driver.emergencyContactName || 'Familiar Registrado'}</span>
                  <span className="font-mono font-semibold text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {driver.emergencyContactPhone || driver.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Driver License & Vehicle Binding */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-2 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Licencia de Conducción y Vehículo</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Categoría Licencia
                  </span>
                  <span className="font-black text-[#1e3a5f] text-sm">
                    {driver.licenseCategory || 'C2'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    (Servicio Público Especial)
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Vigencia de Licencia
                  </span>
                  <span className="font-bold text-emerald-700">
                    {driver.licenseExpirationDate || '2028-06-15'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Vigente RUNT
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Número de Licencia RUNT
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {driver.licenseNumber || `${driver.identification || '1020784912'}-${driver.licenseCategory || 'C2'}`}
                  </span>
                </div>
              </div>

              {/* Primary Assigned Vehicle */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">
                  Vehículo Principal Asignado
                </span>
                {primaryVehicle ? (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-400 text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded">
                        {formatPlateDisplay(primaryVehicle.plate)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {primaryVehicle.brand} ({primaryVehicle.modelYear})
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {primaryVehicle.type} • {primaryVehicle.capacity} Pasajeros
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Titular
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-xs">Sin vehículo titular asignado</div>
                )}

                {/* Secondary Vehicle if any */}
                {secondaryVehicle && (
                  <div className="mt-1.5 flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-300 text-slate-900 font-mono font-black text-xs px-2 py-0.5 rounded">
                        {formatPlateDisplay(secondaryVehicle.plate)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {secondaryVehicle.brand}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {secondaryVehicle.type}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Relevo / Suplente
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-950">Acceso Restringido</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Por políticas de seguridad y privacidad, la ficha técnica detallada y hoja de vida de este conductor solo está disponible para la empresa contratante una vez que el conductor o propietario haya aceptado formalmente la prestación de un servicio.
          </p>
        </div>
      )
    )}

          {/* ========================================================================= */}
          {/* SCANNED DOCUMENTS SECTION: CEDULA & LICENCIA (BOTH SIDES) */}
          {/* ========================================================================= */}
          {activeView === 'documentos' && (
            <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#1e3a5f]" />
                <h3 className="font-black text-sm text-slate-900 uppercase">
                  Documentos de Identidad y Conducción (Ambos Lados)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Digitalización de Anverso y Reverso
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CÉDULA DE CIUDADANÍA (AMBOS LADOS) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900">
                      1. Cédula de Ciudadanía
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    C.C. {driver.identification || '1020784912'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Cara Frontal */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>Cara Frontal (Anverso)</span>
                      {canEditDocs && (
                        <button
                          type="button"
                          onClick={() => handleDocumentUploadClick('cedulaFrontUrl')}
                          className="text-[10px] text-[#1e3a5f] hover:underline font-bold print:hidden"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setZoomedDoc({
                          title: 'Cédula de Ciudadanía - Cara Frontal (Anverso)',
                          url: cedulaFront,
                          subtitle: `Titular: ${driver.name} • C.C. ${driver.identification || '1020784912'}`,
                        })
                      }
                      className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                    >
                      <img
                        src={cedulaFront}
                        alt="Cédula Frontal"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Frente
                      </div>
                    </div>
                  </div>

                  {/* Cara Posterior */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>Cara Posterior (Reverso)</span>
                      {canEditDocs && (
                        <button
                          type="button"
                          onClick={() => handleDocumentUploadClick('cedulaBackUrl')}
                          className="text-[10px] text-[#1e3a5f] hover:underline font-bold print:hidden"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setZoomedDoc({
                          title: 'Cédula de Ciudadanía - Cara Posterior (Reverso)',
                          url: cedulaBack,
                          subtitle: `Código de Barras, Fecha de Expedición y Huella • C.C. ${driver.identification || '1020784912'}`,
                        })
                      }
                      className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                    >
                      <img
                        src={cedulaBack}
                        alt="Cédula Reverso"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Reverso / Huella
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LICENCIA DE CONDUCCIÓN (AMBOS LADOS) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900">
                      2. Licencia de Conducción
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Cat. {driver.licenseCategory || 'C2'} • Especial
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Cara Frontal */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>Cara Frontal (Anverso)</span>
                      {canEditDocs && (
                        <button
                          type="button"
                          onClick={() => handleDocumentUploadClick('licenseFrontUrl')}
                          className="text-[10px] text-[#1e3a5f] hover:underline font-bold print:hidden"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setZoomedDoc({
                          title: 'Licencia de Conducción - Cara Frontal (Anverso)',
                          url: licenseFront,
                          subtitle: `Categoría ${driver.licenseCategory || 'C2'} • Ministerio de Transporte`,
                        })
                      }
                      className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                    >
                      <img
                        src={licenseFront}
                        alt="Licencia Frontal"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Frente Licencia
                      </div>
                    </div>
                  </div>

                  {/* Cara Posterior */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>Cara Posterior (Reverso)</span>
                      {canEditDocs && (
                        <button
                          type="button"
                          onClick={() => handleDocumentUploadClick('licenseBackUrl')}
                          className="text-[10px] text-[#1e3a5f] hover:underline font-bold print:hidden"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    <div
                      onClick={() =>
                        setZoomedDoc({
                          title: 'Licencia de Conducción - Cara Posterior (Reverso)',
                          url: licenseBack,
                          subtitle: `Organismo de Tránsito, Restricciones y Vigencias RUNT`,
                        })
                      }
                      className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                    >
                      <img
                        src={licenseBack}
                        alt="Licencia Reverso"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Reverso / Restricciones
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Signatures & Certification Footer */}
          {activeView === 'dossier' && isFichaVisible && (
            <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-1">
                <div className="h-14 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-script text-slate-700 text-lg italic">{driver.name}</span>
                </div>
                <div className="font-bold text-slate-900">{driver.name}</div>
                <div className="text-[10px] text-slate-500">
                  Firma del Conductor • C.C. {driver.identification || '1020784912'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-14 border-b border-dashed border-slate-400 flex items-end justify-center pb-1">
                  <span className="font-script text-slate-700 text-sm font-bold tracking-widest uppercase">
                    {selectedCompany?.name || 'EMPRESA CONTRATANTE'}
                  </span>
                </div>
                <div className="font-bold text-slate-900">
                  Coordinación de Operaciones y Seguridad Vial
                </div>
                <div className="text-[10px] text-slate-500">
                  {selectedCompany?.name || 'Empresa de Transporte Especial'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zoom / Lightbox Modal for Scanned Documents */}
      {zoomedDoc && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h4 className="font-bold text-sm">{zoomedDoc.title}</h4>
                <p className="text-xs text-slate-400">{zoomedDoc.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedDoc(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/40">
              <img
                src={zoomedDoc.url}
                alt={zoomedDoc.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg border border-slate-700 shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300">
              <span>Resolución alta para verificación MinTransporte</span>
              <button
                type="button"
                onClick={() => setZoomedDoc(null)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
