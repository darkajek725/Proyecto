import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Building2,
  Car,
  Lock,
  FileText,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  EyeOff,
  UserCheck,
  ArrowLeft,
  Mail,
  Send,
  Key,
  RefreshCw,
} from 'lucide-react';

export const AuthModals: React.FC = () => {
  const {
    authModal,
    closeAuthModal,
    loginCompany,
    registerCompany,
    loginUnified,
    registerOwner,
    loginCoordinator,
    coordinators,
    resetUserPassword,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(authModal.initialMode || 'login');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Recovery States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode when modal opens or initialMode changes
  useEffect(() => {
    if (authModal.initialMode) {
      setMode(authModal.initialMode);
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsForgotPassword(false);
    setForgotStep(1);
    setForgotIdentifier('');
    setVerificationCode('');
    setNewPassword('');
    setGeneratedCode('');
  }, [authModal.isOpen, authModal.initialMode, authModal.role]);

  // Form states for Company
  const [companyNit, setCompanyNit] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyCity, setCompanyCity] = useState('Bogotá D.C.');
  const [companyPassword, setCompanyPassword] = useState('123');
  const [showCompanyPassword, setShowCompanyPassword] = useState(false);

  // Form states for Unified (Owner/Driver)
  const [unifiedUser, setUnifiedUser] = useState('');
  const [unifiedPassword, setUnifiedPassword] = useState('123');
  const [showUnifiedPassword, setShowUnifiedPassword] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerIdCard, setOwnerIdCard] = useState('');

  // Form states for Coordinator Login
  const [coordUser, setCoordUser] = useState('mauricio.gomez');
  const [coordPassword, setCoordPassword] = useState('123');
  const [showCoordPassword, setShowCoordPassword] = useState(false);

  if (!authModal.isOpen || !authModal.role) return null;

  const isCompany = authModal.role === 'empresa';
  const isCoordinator = authModal.role === 'coordinador';

  const handleCoordinatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = loginCoordinator(coordUser, coordPassword);
    if (!res.success) {
      setErrorMsg(res.message || 'Error al iniciar sesión como coordinador');
    }
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'login') {
      const res = loginCompany(companyNit, companyPassword);
      if (!res.success) {
        setErrorMsg(res.message || 'Error al iniciar sesión');
      }
    } else {
      const res = registerCompany({
        nit: companyNit,
        name: companyName,
        phone: companyPhone,
        email: companyEmail,
        city: companyCity,
        password: companyPassword,
      });
      if (!res.success) {
        setErrorMsg(res.message || 'Error al registrar empresa');
      }
    }
  };

  const handleUnifiedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'login') {
      const res = loginUnified(unifiedUser, unifiedPassword);
      if (!res.success) {
        setErrorMsg(res.message || 'Error al iniciar sesión');
      }
    } else {
      const res = registerOwner({
        name: ownerName,
        phone: ownerPhone,
        username: unifiedUser,
        password: unifiedPassword,
        identification: ownerIdCard,
      });
      if (!res.success) {
        setErrorMsg(res.message || 'Error al registrar propietario');
      }
    }
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg('Por favor ingresa tu NIT, Usuario o Correo Electrónico registrado.');
      return;
    }

    if (!authModal.role) {
      setErrorMsg('Error: Rol no especificado.');
      return;
    }

    // Search for user and get their registered email
    const res = resetUserPassword(authModal.role, forgotIdentifier);
    if (!res.success) {
      setErrorMsg(res.message || 'No se pudo encontrar ninguna cuenta registrada con esa información.');
      return;
    }

    // Generate a 6-digit random code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(randomCode);
    setForgotEmail(res.email || '');
    
    setForgotStep(2);
    setSuccessMsg(`¡Código de verificación enviado! Hemos simulado el envío de un código de 6 dígitos a la dirección de correo registrada (${res.email}). Por favor, ingresa el código generado a continuación.`);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!verificationCode.trim()) {
      setErrorMsg('El código de verificación es obligatorio.');
      return;
    }

    if (verificationCode.trim() !== generatedCode) {
      setErrorMsg('El código de verificación es incorrecto. Inténtalo de nuevo o solicita un nuevo código.');
      return;
    }

    if (newPassword.length < 3) {
      setErrorMsg('La nueva contraseña debe tener al menos 3 caracteres.');
      return;
    }

    if (!authModal.role) return;

    // Actually reset/update the password in AppContext
    const res = resetUserPassword(authModal.role, forgotIdentifier, newPassword);
    if (!res.success) {
      setErrorMsg(res.message || 'Ocurrió un error al restablecer la contraseña.');
      return;
    }

    // Reset recovery states
    setSuccessMsg('¡Contraseña restablecida correctamente! Ahora puedes ingresar usando tu nueva contraseña.');
    setIsForgotPassword(false);
    setForgotStep(1);
    setForgotIdentifier('');
    setVerificationCode('');
    setNewPassword('');
    
    // Fill the login password field with the newly updated password for convenience!
    if (authModal.role === 'empresa') {
      setCompanyPassword(newPassword);
    } else if (authModal.role === 'coordinador') {
      setCoordPassword(newPassword);
    } else {
      setUnifiedPassword(newPassword);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-[#1e3a5f] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              {isCompany ? (
                <Building2 className="w-5 h-5" />
              ) : isCoordinator ? (
                <UserCheck className="w-5 h-5 text-[#1e3a5f]" />
              ) : (
                <Car className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isCompany
                  ? 'Acceso Rol Empresa'
                  : isCoordinator
                  ? 'Acceso Coordinador Autorizado'
                  : 'Acceso Propietario / Conductor'}
              </h3>
              <p className="text-xs text-amber-300">
                {isCompany
                  ? 'Contratación y publicación de servicios especiales'
                  : isCoordinator
                  ? 'Gestión de rutas fijas y servicios a nombre de la empresa'
                  : 'Ingreso unificado con usuario y contraseña'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Iniciar sesión / Registrarse (Solo para Empresa y Propietario) */}
        {!isCoordinator && !isForgotPassword && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`pb-3 px-4 text-xs font-bold transition-colors relative cursor-pointer ${
                mode === 'login'
                  ? 'text-[#1e3a5f] border-b-2 border-amber-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`pb-3 px-4 text-xs font-bold transition-colors relative cursor-pointer ${
                mode === 'register'
                  ? 'text-[#1e3a5f] border-b-2 border-amber-500'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isCompany ? 'Registrar Nueva Empresa' : 'Crear Cuenta Propietario'}
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="whitespace-pre-line">{successMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {isForgotPassword ? (
            /* RECUPERAR CONTRASEÑA FLOW */
            forgotStep === 1 ? (
              /* PASO 1: Ingresar Identificador */
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="p-3 bg-[#1e3a5f]/5 border border-[#1e3a5f]/15 rounded-xl text-xs text-[#1e3a5f] flex items-start gap-2">
                  <Mail className="w-4 h-4 text-[#1e3a5f] shrink-0 mt-0.5" />
                  <span>
                    Ingresa tu identificación o correo electrónico. Buscaremos tu cuenta y te enviaremos un código de verificación de 6 dígitos al correo registrado.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {authModal.role === 'empresa'
                      ? 'NIT o Correo Electrónico de la Empresa *'
                      : authModal.role === 'coordinador'
                      ? 'Usuario o Correo Electrónico de Coordinador *'
                      : 'Usuario o Correo Electrónico registrado *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder={
                        authModal.role === 'empresa'
                          ? 'Ej. 900824112-5 o operaciones@empresa.com'
                          : 'Ej. carlos.mendoza o julian.ruiz'
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Volver al ingreso
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Código
                  </button>
                </div>
              </form>
            ) : (
              /* PASO 2: Ingresar Código y Nueva Contraseña */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <Key className="w-4 h-4 text-amber-700" />
                    Código de simulación activo
                  </div>
                  <p className="mb-2">
                    Dado que estás en un ambiente de prototipo de validación rápida (sin servidor de correo SMTP), puedes ver e ingresar el código generado a continuación:
                  </p>
                  <div className="bg-white/80 p-2 rounded border border-amber-500/30 font-mono font-bold text-center text-lg text-amber-950 tracking-widest">
                    {generatedCode}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Verificación (6 dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingresa el código"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-center font-mono font-bold text-lg tracking-wider focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 3 caracteres"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Modificar NIT/Usuario
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restablecer Contraseña
                  </button>
                </div>
              </form>
            )
          ) : isCoordinator ? (
            /* COORDINATOR LOGIN FORM (SOLO ACCESO - GESTIONADO POR LA EMPRESA) */
            <form onSubmit={handleCoordinatorSubmit} className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-[#1e3a5f] flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Ingresa con el usuario y contraseña autorizados por tu empresa de transporte especial. La creación y asignación de coordinadores se realiza únicamente por la empresa desde su panel administrativo.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usuario del Coordinador *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={coordUser}
                    onChange={(e) => setCoordUser(e.target.value)}
                    placeholder="Ej. mauricio.gomez"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex flex-wrap gap-1.5 items-center">
                  <span className="font-semibold">Coordinadores demo activos:</span>
                  {coordinators.slice(0, 3).map((coord) => (
                    <button
                      key={coord.id}
                      type="button"
                      onClick={() => {
                        setCoordUser(coord.username);
                        setCoordPassword(coord.password || '123');
                      }}
                      className="text-[#1e3a5f] font-bold font-mono hover:underline bg-slate-100 hover:bg-indigo-50 px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer"
                    >
                      {coord.username} ({coord.name.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showCoordPassword ? 'text' : 'password'}
                    required
                    value={coordPassword}
                    onChange={(e) => setCoordPassword(e.target.value)}
                    placeholder="Contraseña (demo: 123)"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCoordPassword(!showCoordPassword)}
                    className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showCoordPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotStep(1);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-indigo-700 hover:text-[#1e3a5f] font-bold hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Ingresar como Coordinador</span>
              </button>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  ¿Eres una empresa y deseas crear un nuevo coordinador? Ingresa con el <strong>Rol Empresa</strong> y gestiónalos desde la pestaña <strong>Coordinadores</strong> de tu panel.
                </span>
              </div>
            </form>
          ) : isCompany ? (
            /* EMPRESA FORM */
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Razón Social / Nombre de la Empresa *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ej. Transportes Especiales Andinos S.A.S."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Teléfono / Celular *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="3104528891"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ciudad Base *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={companyCity}
                          onChange={(e) => setCompanyCity(e.target.value)}
                          placeholder="Bogotá D.C., Medellín, Cali..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Correo Electrónico Corporativo
                    </label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="operaciones@miempresa.com.co"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIT de la Empresa (con dígito de verificación) *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={companyNit}
                    onChange={(e) => setCompanyNit(e.target.value)}
                    placeholder="Ej. 900824112-5"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                </div>
                {mode === 'login' && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    NIT de prueba precargado: <span className="font-mono font-bold text-[#1e3a5f] cursor-pointer hover:underline" onClick={() => setCompanyNit('900824112-5')}>900824112-5</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showCompanyPassword ? 'text' : 'password'}
                    required
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCompanyPassword(!showCompanyPassword)}
                    className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    title={showCompanyPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showCompanyPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showCompanyPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setForgotStep(1);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-[#1e3a5f] hover:text-[#142842] font-bold hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#1e3a5f] hover:bg-[#142842] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>
                  {mode === 'login' ? 'Ingresar como Empresa' : 'Registrar Empresa y Continuar'}
                </span>
              </button>
            </form>
          ) : (
            /* PROPIETARIO Y/O CONDUCTOR FORM */
            <form onSubmit={handleUnifiedSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo del Propietario *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Ej. Carlos Alberto Mendoza"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cédula de Ciudadanía *
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerIdCard}
                        onChange={(e) => setOwnerIdCard(e.target.value)}
                        placeholder="C.C. 79.845.123"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Teléfono / Celular *
                      </label>
                      <input
                        type="tel"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="3124567890"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de Usuario *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={unifiedUser}
                    onChange={(e) => setUnifiedUser(e.target.value)}
                    placeholder="Ej. carlos.mendoza o julian.ruiz"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                {mode === 'login' && (
                  <div className="mt-1 text-[11px] text-slate-500 space-y-0.5">
                    <p>
                      Propietario demo:{' '}
                      <span
                        className="font-mono font-bold text-amber-700 cursor-pointer hover:underline"
                        onClick={() => setUnifiedUser('carlos.mendoza')}
                      >
                        carlos.mendoza
                      </span>
                    </p>
                    <p>
                      Conductor asignado demo:{' '}
                      <span
                        className="font-mono font-bold text-emerald-700 cursor-pointer hover:underline"
                        onClick={() => setUnifiedUser('julian.ruiz')}
                      >
                        julian.ruiz
                      </span>{' '}
                      (Placa WEO-412)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type={showUnifiedPassword ? 'text' : 'password'}
                    required
                    value={unifiedPassword}
                    onChange={(e) => setUnifiedPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUnifiedPassword(!showUnifiedPassword)}
                    className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                    title={showUnifiedPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showUnifiedPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showUnifiedPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {mode === 'login' && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setForgotStep(1);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-amber-700 hover:text-amber-950 font-bold hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1e3a5f]" />
                <span>
                  {mode === 'login'
                    ? 'Ingresar al Tablero'
                    : 'Crear Cuenta de Propietario'}
                </span>
              </button>
            </form>
          )}

          {/* Prototype disclaimer note */}
          <div className="mt-5 p-2.5 bg-slate-100 rounded-lg flex items-start gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Nota de prototipo: Las claves se guardan de forma local y simplificada para fines de validación rápida. Por seguridad, no utilices contraseñas bancarias ni sensibles reales.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
