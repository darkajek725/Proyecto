import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  Heart,
  Upload,
  Eye,
  Sparkles,
  Building2,
  Car,
  Award,
} from 'lucide-react';
import { readFileAsDataUrl } from '../../utils/formatters';

export const DriverProfileTab: React.FC = () => {
  const { currentSession, drivers, vehicles, updateDriverProfile, openDriverModal } = useApp();

  // Find current driver
  const currentDriver =
    drivers.find((d) => d.id === currentSession?.userId) ||
    drivers.find((d) => d.username === currentSession?.identifier) ||
    drivers[0];

  const assignedVehicle = vehicles.find(
    (v) =>
      v.id === currentDriver?.assignedVehicleId ||
      v.assignedDriverId === currentDriver?.id
  );

  const [name, setName] = useState(currentDriver?.name || '');
  const [phone, setPhone] = useState(currentDriver?.phone || '');
  const [email, setEmail] = useState(currentDriver?.email || '');
  const [identification, setIdentification] = useState(currentDriver?.identification || '');
  const [city, setCity] = useState(currentDriver?.city || 'Bogotá D.C.');
  const [bloodType, setBloodType] = useState(currentDriver?.bloodType || 'O+');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>(
    currentDriver?.yearsOfExperience || 8
  );
  const [bio, setBio] = useState(currentDriver?.bio || '');

  // Healthcare and safety
  const [eps, setEps] = useState(currentDriver?.eps || 'Sanitas EPS');
  const [arl, setArl] = useState(currentDriver?.arl || 'Positiva ARL');
  const [emergencyContactName, setEmergencyContactName] = useState(
    currentDriver?.emergencyContactName || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    currentDriver?.emergencyContactPhone || ''
  );

  // License
  const [licenseCategory, setLicenseCategory] = useState<'C1' | 'C2' | 'C3'>(
    currentDriver?.licenseCategory || 'C2'
  );
  const [licenseNumber, setLicenseNumber] = useState(
    currentDriver?.licenseNumber || `${currentDriver?.identification || '1020784912'}-C2`
  );
  const [licenseExpirationDate, setLicenseExpirationDate] = useState(
    currentDriver?.licenseExpirationDate || '2028-06-15'
  );

  // Bank Info for Cuentas de Cobro
  const [bankName, setBankName] = useState(currentDriver?.bankInfo?.bankName || 'Bancolombia');
  const [accountType, setAccountType] = useState<'Ahorros' | 'Corriente'>(currentDriver?.bankInfo?.accountType || 'Ahorros');
  const [accountNumber, setAccountNumber] = useState(currentDriver?.bankInfo?.accountNumber || '108-412356-91');
  const [holderName, setHolderName] = useState(currentDriver?.bankInfo?.holderName || currentDriver?.name || '');
  const [holderId, setHolderId] = useState(currentDriver?.bankInfo?.holderId || currentDriver?.identification || '');

  // Imagery
  const [profilePhoto, setProfilePhoto] = useState(
    currentDriver?.profilePhoto ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [coverPhoto, setCoverPhoto] = useState(
    currentDriver?.coverPhoto ||
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80'
  );

  // Documents
  const [cedulaFrontUrl, setCedulaFrontUrl] = useState(
    currentDriver?.cedulaFrontUrl ||
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80'
  );
  const [cedulaBackUrl, setCedulaBackUrl] = useState(
    currentDriver?.cedulaBackUrl ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
  );
  const [licenseFrontUrl, setLicenseFrontUrl] = useState(
    currentDriver?.licenseFrontUrl ||
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  );
  const [licenseBackUrl, setLicenseBackUrl] = useState(
    currentDriver?.licenseBackUrl ||
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [activeDocUpload, setActiveDocUpload] = useState<string | null>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await readFileAsDataUrl(file);
      setCoverPhoto(url);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await readFileAsDataUrl(file);
      setProfilePhoto(url);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocUpload) return;
    try {
      const url = await readFileAsDataUrl(file);
      if (activeDocUpload === 'cedulaFront') setCedulaFrontUrl(url);
      if (activeDocUpload === 'cedulaBack') setCedulaBackUrl(url);
      if (activeDocUpload === 'licenseFront') setLicenseFrontUrl(url);
      if (activeDocUpload === 'licenseBack') setLicenseBackUrl(url);
    } catch (err) {
      console.warn(err);
    } finally {
      setActiveDocUpload(null);
    }
  };

  const triggerDocUpload = (key: 'cedulaFront' | 'cedulaBack' | 'licenseFront' | 'licenseBack') => {
    setActiveDocUpload(key);
    if (docInputRef.current) {
      docInputRef.current.value = '';
      docInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDriver) return;

    setSaving(true);
    updateDriverProfile(currentDriver.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      identification: identification.trim(),
      city: city.trim(),
      bloodType,
      yearsOfExperience: Number(yearsOfExperience) || 5,
      bio: bio.trim(),
      eps: eps.trim(),
      arl: arl.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      licenseCategory,
      licenseNumber: licenseNumber.trim(),
      licenseExpirationDate,
      profilePhoto,
      coverPhoto,
      cedulaFrontUrl,
      cedulaBackUrl,
      licenseFrontUrl,
      licenseBackUrl,
      bankInfo: {
        bankName: bankName.trim(),
        accountType,
        accountNumber: accountNumber.trim(),
        holderName: holderName.trim() || name.trim(),
        holderId: holderId.trim() || identification.trim(),
      },
    });

    setSaving(false);
    setSuccessMsg('¡Tu perfil y documentos de conductor han sido guardados correctamente!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden inputs */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfileUpload}
      />
      <input
        ref={docInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDocUpload}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Mi Perfil y Hoja de Vida de Conductor</h2>
          <p className="text-xs text-slate-500">
            Personaliza tu foto de perfil, foto de portada, datos de seguridad social y digitaliza tu cédula y licencia por ambos lados.
          </p>
        </div>

        {currentDriver && (
          <button
            type="button"
            onClick={() => openDriverModal(currentDriver.id)}
            className="px-4 py-2.5 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Ver y Descargar Ficha Técnica</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Photo & Profile Photo Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Cover Photo Container */}
          <div className="relative h-48 w-full bg-slate-800">
            <img
              src={coverPhoto}
              alt="Foto de portada"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/35" />

            {/* Change Cover Button */}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white font-semibold text-xs rounded-xl backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Cambiar Foto de Portada</span>
            </button>

            {/* Profile Photo Avatar */}
            <div className="absolute -bottom-8 left-6 z-10 flex items-end gap-3">
              <div className="relative group">
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold gap-1"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Cambiar</span>
                </button>
              </div>

              <div className="mb-2 hidden sm:block">
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  Subir Foto de Perfil
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 px-6 pb-6 space-y-6">
            {/* Personal Details */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1e3a5f]" />
                <span>Información Personal</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cédula de Ciudadanía *
                  </label>
                  <input
                    type="text"
                    required
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    placeholder="Ej. 1020784912"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono Celular *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="conductor@correo.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad de Residencia
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bogotá D.C."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grupo Sanguíneo y RH
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white font-bold text-rose-600"
                  >
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="B-">B Negativo (B-)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                    <option value="AB-">AB Negativo (AB-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Años de Experiencia en Especial
                  </label>
                  <input
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
                    min={1}
                    max={50}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Presentación / Reseña Profesional
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntale a las empresas sobre tu experiencia en rutas turísticas, corporativas o manejo defensivo..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Healthcare & Emergency Contact */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Seguridad Social y Emergencias</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    EPS (Salud) *
                  </label>
                  <input
                    type="text"
                    required
                    value={eps}
                    onChange={(e) => setEps(e.target.value)}
                    placeholder="Ej. Sanitas EPS, Sura EPS"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ARL (Riesgos Laborales) *
                  </label>
                  <input
                    type="text"
                    required
                    value={arl}
                    onChange={(e) => setArl(e.target.value)}
                    placeholder="Ej. Positiva ARL, Sura ARL"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contacto de Emergencia
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Ej. Martha Pineda (Madre)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono de Emergencia
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="3142289901"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* License Details */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Licencia de Conducción</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría Licencia *
                  </label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value as 'C1' | 'C2' | 'C3')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none bg-white font-bold text-[#1e3a5f]"
                  >
                    <option value="C1">C1 - Automóviles, camperos y camionetas públicas</option>
                    <option value="C2">C2 - Camiones rígidos, busetas y buses de servicio público</option>
                    <option value="C3">C3 - Vehículos articulados y tractocamiones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Licencia RUNT
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="1020784912-C2"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={licenseExpirationDate}
                    onChange={(e) => setLicenseExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* INFORMACIÓN BANCARIA PARA CUENTA DE COBRO */}
            {/* ========================================================================= */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1e3a5f]" />
                <span>Información Bancaria para Cuenta de Cobro</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Registra los datos de la cuenta donde la empresa contratante debe realizar los pagos. Estos datos se usarán para generar la cuenta de cobro en PDF al finalizar cada servicio ocasional.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entidad Bancaria / Plataforma *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Ej. Bancolombia, Nequi, Daviplata"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Cuenta *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as 'Ahorros' | 'Corriente')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-bold"
                  >
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Cuenta *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Ej. 108-412356-91"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Titular de Cuenta
                  </label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder={name || "Nombre del Titular"}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Documento del Titular (NIT/Cédula)
                  </label>
                  <input
                    type="text"
                    value={holderId}
                    onChange={(e) => setHolderId(e.target.value)}
                    placeholder={identification || "Documento del Titular"}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DIGITAL DOCUMENT SCANS (CEDULA & LICENCIA - AMBOS LADOS) */}
            {/* ========================================================================= */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Documentos Digitalizados (Ambos Lados para Ficha Técnica)</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  Haz clic en cualquier imagen para cambiarla
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* CÉDULA DE CIUDADANÍA */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Cédula de Ciudadanía
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      C.C. {identification || '1020784912'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Front */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Anverso (Frente)</span>
                        <button
                          type="button"
                          onClick={() => triggerDocUpload('cedulaFront')}
                          className="text-[#1e3a5f] hover:underline font-bold text-[10px]"
                        >
                          Subir
                        </button>
                      </div>
                      <div
                        onClick={() => triggerDocUpload('cedulaFront')}
                        className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                      >
                        <img
                          src={cedulaFrontUrl}
                          alt="Cédula Frente"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Upload className="w-4 h-4" />
                          <span>Cambiar</span>
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Reverso (Posterior)</span>
                        <button
                          type="button"
                          onClick={() => triggerDocUpload('cedulaBack')}
                          className="text-[#1e3a5f] hover:underline font-bold text-[10px]"
                        >
                          Subir
                        </button>
                      </div>
                      <div
                        onClick={() => triggerDocUpload('cedulaBack')}
                        className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                      >
                        <img
                          src={cedulaBackUrl}
                          alt="Cédula Reverso"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Upload className="w-4 h-4" />
                          <span>Cambiar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LICENCIA DE CONDUCCIÓN */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Licencia de Conducción
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Cat. {licenseCategory}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Front */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Anverso (Frente)</span>
                        <button
                          type="button"
                          onClick={() => triggerDocUpload('licenseFront')}
                          className="text-[#1e3a5f] hover:underline font-bold text-[10px]"
                        >
                          Subir
                        </button>
                      </div>
                      <div
                        onClick={() => triggerDocUpload('licenseFront')}
                        className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                      >
                        <img
                          src={licenseFrontUrl}
                          alt="Licencia Frente"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Upload className="w-4 h-4" />
                          <span>Cambiar</span>
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Reverso (Posterior)</span>
                        <button
                          type="button"
                          onClick={() => triggerDocUpload('licenseBack')}
                          className="text-[#1e3a5f] hover:underline font-bold text-[10px]"
                        >
                          Subir
                        </button>
                      </div>
                      <div
                        onClick={() => triggerDocUpload('licenseBack')}
                        className="relative h-28 w-full rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer group bg-slate-200"
                      >
                        <img
                          src={licenseBackUrl}
                          alt="Licencia Reverso"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Upload className="w-4 h-4" />
                          <span>Cambiar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Los cambios se actualizarán en tiempo real en tu ficha técnica descargable.
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>{saving ? 'Guardando...' : 'Guardar Todo Mi Perfil'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
